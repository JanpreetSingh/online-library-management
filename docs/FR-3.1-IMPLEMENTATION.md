# FR-3.1: Borrow a Book - Implementation Documentation

## Overview
This document details the implementation of FR-3.1: Borrow a Book feature in the Online Library Management System.

## Feature Summary
Members can borrow available books from the library. The system tracks borrow transactions, manages book availability, and enforces business rules around borrowing limits.

## Database Changes

### New Table: borrow_transactions

Purpose: Track all book borrowing transactions and their lifecycle.

Columns:
- id - VARCHAR(36) PRIMARY KEY
- user_id - VARCHAR(36) FOREIGN KEY to users.id
- book_id - VARCHAR(36) FOREIGN KEY to books.id
- borrowed_at - TIMESTAMPTZ NOT NULL
- due_date - TIMESTAMPTZ NOT NULL
- returned_at - TIMESTAMPTZ NULL
- status - VARCHAR(20) NOT NULL (Borrowed, Returned, Overdue)
- created_at - TIMESTAMPTZ
- updated_at - TIMESTAMPTZ

Indexes: user_id, book_id, status

## Backend Implementation

### API Endpoint
POST /api/borrow/{book_id}

Authorization: member, librarian, admin (Guest users forbidden)

Business Rules:
- LOAN_DAYS = 14 (default loan period)
- MAX_ACTIVE_BORROWS = 5 (max concurrent borrows)
- Guest users cannot borrow
- User cannot exceed active borrow limit
- User cannot borrow same book twice
- Book must have available copies > 0
- Uses database row locking to prevent race conditions

## Frontend Implementation

### UI Changes (BooksPage.tsx)
- Added "Borrow" button in Actions column
- Shown only for members/librarians/admins
- Disabled when no copies available
- Shows loading state during API call
- Success message includes due date
- Updates available copies immediately

## Testing

Test File: backend/tests/test_borrow.py

Test Cases:
1. Guest users cannot borrow (403)
2. Successful borrow by member (200)
3. Cannot borrow unavailable book (409)
4. Cannot borrow same book twice (400)
5. Book not found (404)
6. Unauthenticated cannot borrow (401)
7. Cannot exceed max borrows (400)

## Files Changed

### Backend (New)
- backend/app/models/borrow_transaction.py
- backend/app/schemas/borrow_transaction.py
- backend/app/routers/borrow.py
- backend/tests/test_borrow.py

### Backend (Updated)
- backend/app/models/__init__.py
- backend/app/main.py
- backend/seed.py

### Frontend (New)
- frontend/src/types/borrowTransaction.ts
- frontend/src/services/borrowService.ts

### Frontend (Updated)
- frontend/src/pages/BooksPage.tsx

## Deployment

The borrow_transactions table is created automatically via Base.metadata.create_all(bind=engine).
No manual migration needed.

## User Permissions

| Role | Can Borrow? |
|------|-------------|
| Guest | No |
| Member | Yes |
| Librarian | Yes |
| Admin | Yes |

## Future Enhancements

1. FR-3.2: Return a Book
2. FR-3.3: View My Borrowed Books
3. Overdue handling
4. Email notifications
5. Fine calculation
6. Renewal feature

## Verification Checklist

- [x] Database model created
- [x] API endpoint implemented
- [x] Business rules enforced
- [x] Frontend UI updated
- [x] Tests written
- [x] Documentation complete
- [x] Guest users blocked
- [x] Race conditions handled
- [x] Error handling implemented
