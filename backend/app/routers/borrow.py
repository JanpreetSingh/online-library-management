from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import datetime, timezone, timedelta
import uuid

from app.database import get_db
from app.models.book import Book
from app.models.user import User, UserRole
from app.models.borrow_transaction import BorrowTransaction, BorrowStatus
from app.schemas.borrow_transaction import BorrowBookResponse, BorrowTransactionResponse
from app.auth.dependencies import get_current_user
from typing import List

router = APIRouter(prefix="/api/borrow", tags=["borrow"])

# Business rules constants
LOAN_DAYS = 14
MAX_ACTIVE_BORROWS = 5


@router.get("/user", response_model=List[BorrowTransactionResponse])
def get_user_borrows(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all borrow transactions for the current user.

    Returns list of all borrows (both active and returned).
    """
    borrows = db.query(BorrowTransaction).filter(
        BorrowTransaction.user_id == current_user.id
    ).order_by(BorrowTransaction.borrowed_at.desc()).all()

    return borrows


@router.post("/{book_id}", response_model=BorrowBookResponse)
def borrow_book(
    book_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Borrow a book - creates a transaction and decrements available_copies.

    Auth: 401 = missing/invalid JWT (enforced in dependencies.py before this runs).
          403 = valid JWT but role is not 'member' (guest, admin, librarian all rejected here).

    Rules:
    - Only members may borrow; all other roles are forbidden
    - Book must exist and have available copies
    - User cannot borrow same book twice concurrently
    - User cannot exceed MAX_ACTIVE_BORROWS limit
    """

    # 403: only 'member' role may borrow — guest, admin and librarian are all rejected.
    # (401 for missing/invalid JWT is already raised in get_current_user before reaching here.)
    if current_user.role != UserRole.member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only members can borrow books"
        )

    # Check user's active borrow count
    active_borrows_count = db.query(BorrowTransaction).filter(
        BorrowTransaction.user_id == current_user.id,
        BorrowTransaction.returned_at.is_(None)
    ).count()

    if active_borrows_count >= MAX_ACTIVE_BORROWS:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"You have reached the maximum limit of {MAX_ACTIVE_BORROWS} active borrows"
        )

    # Check if user already has an active borrow for this book
    book_id_str = str(book_id)
    existing_borrow = db.query(BorrowTransaction).filter(
        BorrowTransaction.user_id == current_user.id,
        BorrowTransaction.book_id == book_id_str,
        BorrowTransaction.returned_at.is_(None)
    ).first()
    
    if existing_borrow:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You already have an active borrow for this book"
        )
    
    # PostgreSQL READ COMMITTED isolation + SELECT FOR UPDATE row lock ensures
    # at-most-one successful concurrent borrow for the last available copy.
    book = db.query(Book).filter(Book.id == book_id_str).with_for_update().first()
    
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    if book.available_copies <= 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No copies available for borrowing"
        )
    
    # Calculate due date
    borrowed_at = datetime.now(timezone.utc)
    due_date = borrowed_at + timedelta(days=LOAN_DAYS)
    
    # Create borrow transaction
    transaction = BorrowTransaction(
        user_id=current_user.id,
        book_id=book_id_str,
        borrowed_at=borrowed_at,
        due_date=due_date,
        status=BorrowStatus.borrowed
    )
    
    # Decrement available copies
    book.available_copies -= 1
    book.updated_at = datetime.now(timezone.utc)
    
    # Commit both changes atomically
    db.add(transaction)
    db.add(book)
    db.commit()
    db.refresh(transaction)
    
    return BorrowBookResponse(
        transaction_id=transaction.id,
        book_id=transaction.book_id,
        user_id=transaction.user_id,
        borrowed_at=transaction.borrowed_at,
        due_date=transaction.due_date,
        status=transaction.status
    )
