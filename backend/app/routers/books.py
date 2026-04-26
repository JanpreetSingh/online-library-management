from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.database import get_db
from app.models.book import Book
from app.models.user import User, UserRole
from app.schemas.book import CreateBookRequest, UpdateBookRequest, BookResponse
from app.auth.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/api/books", tags=["books"])

_staff_roles = [UserRole.admin, UserRole.librarian]


@router.get("", response_model=list[BookResponse])
def list_books(
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    return db.query(Book).order_by(Book.created_at.desc()).all()


@router.get("/{book_id}", response_model=BookResponse)
def get_book(
    book_id: str,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")
    return book


@router.post("", response_model=BookResponse, status_code=status.HTTP_201_CREATED)
def create_book(
    payload: CreateBookRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(_staff_roles)),
):
    existing = db.query(Book).filter(Book.isbn == payload.isbn).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A book with ISBN '{payload.isbn}' already exists",
        )

    book = Book(
        title=payload.title,
        author=payload.author,
        isbn=payload.isbn,
        category=payload.category,
        publisher=payload.publisher,
        publication_year=payload.publication_year,
        total_copies=payload.total_copies,
        available_copies=payload.total_copies,
        cover_image_url=payload.cover_image_url,
    )
    db.add(book)
    db.commit()
    db.refresh(book)
    return book


@router.put("/{book_id}", response_model=BookResponse)
def update_book(
    book_id: str,
    payload: UpdateBookRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(_staff_roles)),
):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")

    if payload.isbn is not None and payload.isbn != book.isbn:
        clash = db.query(Book).filter(Book.isbn == payload.isbn).first()
        if clash:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"A book with ISBN '{payload.isbn}' already exists",
            )

    if payload.title is not None:
        book.title = payload.title
    if payload.author is not None:
        book.author = payload.author
    if payload.isbn is not None:
        book.isbn = payload.isbn
    if payload.category is not None:
        book.category = payload.category
    if payload.publisher is not None:
        book.publisher = payload.publisher
    if payload.publication_year is not None:
        book.publication_year = payload.publication_year
    if payload.total_copies is not None:
        delta = payload.total_copies - book.total_copies
        book.total_copies = payload.total_copies
        book.available_copies = max(0, book.available_copies + delta)
    if payload.cover_image_url is not None:
        book.cover_image_url = payload.cover_image_url

    book.updated_at = datetime.now(timezone.utc)
    db.add(book)
    db.commit()
    db.refresh(book)
    return book
