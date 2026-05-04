# Developer Guide - Borrow a Book Feature

## Quick Start

### Running the Application

1. Start backend:
```bash
cd backend
python seed.py
uvicorn app.main:app --reload
```

2. Start frontend:
```bash
cd frontend
npm run dev
```

3. Login as member/admin at http://localhost:3001

### Testing the Feature

1. Navigate to Books page
2. Click "Borrow" button on any available book
3. See success message with due date
4. Notice available copies decreased

## Architecture

### Data Flow
```
User clicks Borrow
  ↓
Frontend: borrowService.borrowBook(bookId)
  ↓
POST /api/borrow/{book_id} with JWT
  ↓
Backend: Check guest, limits, availability
  ↓
Database: Lock book row, create transaction, update copies
  ↓
Return transaction with due date
  ↓
Frontend: Update UI, show success message
```

### Database Schema
```
borrow_transactions
├── id (PK)
├── user_id (FK → users.id)
├── book_id (FK → books.id)
├── borrowed_at
├── due_date
├── returned_at (nullable)
├── status
├── created_at
└── updated_at
```

## Key Code Locations

### Backend
- **Model:** `backend/app/models/borrow_transaction.py`
- **Router:** `backend/app/routers/borrow.py`
- **Schema:** `backend/app/schemas/borrow_transaction.py`
- **Tests:** `backend/tests/test_borrow.py`

### Frontend
- **Service:** `frontend/src/services/borrowService.ts`
- **Types:** `frontend/src/types/borrowTransaction.ts`
- **UI:** `frontend/src/pages/BooksPage.tsx`

## Configuration

### Constants (backend/app/routers/borrow.py)
```python
LOAN_DAYS = 14              # Loan period in days
MAX_ACTIVE_BORROWS = 5      # Max concurrent borrows per user
```

## API Reference

### Borrow Book
```
POST /api/borrow/{book_id}
Authorization: Bearer {jwt_token}

Response (200):
{
  "transaction_id": "string",
  "book_id": "string",
  "user_id": "string",
  "borrowed_at": "datetime",
  "due_date": "datetime",
  "status": "Borrowed"
}

Errors:
- 401: Not authenticated
- 403: Guest user
- 404: Book not found
- 409: No copies available
- 400: Duplicate or limit exceeded
```

## Testing

### Run Backend Tests
```bash
cd backend
pytest tests/test_borrow.py -v
```

### Test Coverage
- Guest restriction
- Successful borrow
- Availability check
- Duplicate prevention
- Limit enforcement
- Authentication
- Book existence

## Common Issues

### Issue: "Guest users cannot borrow books"
**Cause:** User logged in as guest
**Solution:** Login with member/librarian/admin account

### Issue: "No copies available"
**Cause:** All copies currently borrowed
**Solution:** Wait for returns or choose another book

### Issue: "Already have an active borrow"
**Cause:** User already borrowed this book
**Solution:** Return book first

### Issue: "Maximum limit of 5 active borrows"
**Cause:** User has 5 unreturned books
**Solution:** Return some books first

## Debugging

### Check Active Borrows
```sql
SELECT * FROM borrow_transactions 
WHERE user_id = '{user_id}' 
AND returned_at IS NULL;
```

### Check Book Availability
```sql
SELECT id, title, available_copies, total_copies 
FROM books 
WHERE id = '{book_id}';
```

### Check Transaction History
```sql
SELECT * FROM borrow_transactions 
WHERE book_id = '{book_id}' 
ORDER BY borrowed_at DESC;
```

## Extending the Feature

### Add Email Notifications
1. Install email library
2. Add email service
3. Call in borrow router after transaction creation

### Add Overdue Detection
1. Create scheduled task
2. Query transactions where due_date < now() AND returned_at IS NULL
3. Update status to 'Overdue'

### Add Fine Calculation
1. Add fine_amount column to transactions
2. Calculate days overdue
3. Apply fine rate
4. Update transaction on return

## Code Style

### Backend (Python)
- Follow PEP 8
- Use type hints
- Document complex logic
- Handle exceptions with clear messages

### Frontend (TypeScript)
- Use TypeScript strict mode
- Define interfaces for all data structures
- Handle errors gracefully
- Show user-friendly messages

## Security Checklist

- ✅ JWT authentication required
- ✅ Role-based access control
- ✅ Input validation
- ✅ SQL injection prevention (ORM)
- ✅ Race condition handling
- ✅ Error message sanitization

## Performance Tips

1. Use database indexes (already implemented)
2. Minimize lock duration
3. Cache user role checks
4. Optimize frontend re-renders
5. Use optimistic UI updates

## Related Features

- **FR-3.2:** Return a Book (not yet implemented)
- **FR-3.3:** View My Borrowed Books (not yet implemented)
- **FR-2.1:** Add Books (already implemented)
- **FR-2.2:** Edit Books (already implemented)

## Support

For issues or questions:
1. Check this guide
2. Review test cases
3. Check API docs at http://localhost:8000/docs
4. Review implementation docs

---

**Last Updated:** May 4, 2026
