# Architecture: FR-3.1 Borrow a Book

**REQ-ID**: REQ-40786  
**Source**: [EPMCDMETST-40786](https://jiraeu.epam.com/browse/EPMCDMETST-40786)  
**Date**: 2026-06-06  
**Status**: Approved

---

## High-Level System Architecture

```mermaid
graph TB
    A[Browser] -->|HTTPS| B[React Frontend :3000]
    B --> C[BorrowService]
    C -->|POST /api/borrow/:id| D[FastAPI Backend :8000]
    D --> E[JWT Auth Middleware]
    E --> F[BorrowRouter]
    F --> G[PostgreSQL :5432]
    F --> H[Book Model]
    F --> I[BorrowTransaction Model]
    H --> G
    I --> G
    
    style E fill:#f9f,stroke:#333,stroke-width:2px
    style G fill:#bbf,stroke:#333,stroke-width:2px
```

### Component Descriptions

- **React Frontend**: User interface for browsing books and initiating borrow requests
- **BorrowService**: TypeScript service layer that wraps borrow API calls with authentication
- **FastAPI Backend**: REST API server handling business logic and data persistence
- **JWT Auth Middleware**: Validates bearer tokens and extracts user identity (401/403 enforcement)
- **BorrowRouter**: FastAPI router implementing borrow endpoint with business rules
- **Book Model**: SQLAlchemy model for books table with available_copies tracking
- **BorrowTransaction Model**: SQLAlchemy model for borrow_transactions audit log
- **PostgreSQL**: Relational database with ACID guarantees and row-level locking

---

## Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Frontend | React + TypeScript | 18 | UI component framework |
| Styling | Tailwind CSS | 3.x | Utility-first CSS framework |
| HTTP Client | Fetch API | Native | REST API communication |
| Backend Framework | FastAPI | 0.115+ | Async Python web framework |
| ORM | SQLAlchemy | 2.0 | Database abstraction and query builder |
| Validation | Pydantic | v2 | Request/response schema validation |
| Database | PostgreSQL | 15 | Relational database with row locking |
| Auth | JWT (python-jose) | 3.3+ | Stateless authentication tokens |
| Testing (Unit) | pytest | 8.0+ | Backend unit and integration tests |
| Testing (E2E) | Playwright | 1.40+ | Browser-based end-to-end tests |

---

## Data Flow

**Sequence Diagram: Successful Borrow Request**

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant F as Frontend (React)
    participant B as BorrowService
    participant A as FastAPI Backend
    participant M as Auth Middleware
    participant R as BorrowRouter
    participant D as PostgreSQL

    U->>F: Click "Borrow Book" button
    F->>B: borrowService.borrowBook(bookId)
    B->>A: POST /api/borrow/{book_id}<br/>Authorization: Bearer <jwt>
    A->>M: Validate JWT
    M->>M: decode_token(jwt)
    M->>D: SELECT * FROM users WHERE id = sub
    D-->>M: User record (role = member)
    M-->>R: current_user object
    
    R->>R: Check role == member (FR-4)
    R->>D: SELECT COUNT(*) FROM borrow_transactions<br/>WHERE user_id = X AND returned_at IS NULL
    D-->>R: active_count = 4
    R->>R: Check active_count < 5 (FR-3)
    
    R->>D: SELECT * FROM borrow_transactions<br/>WHERE user_id = X AND book_id = Y AND returned_at IS NULL
    D-->>R: No existing active borrow
    R->>R: Check no duplicate borrow (FR-8)
    
    R->>D: BEGIN TRANSACTION
    R->>D: SELECT * FROM books WHERE id = Y FOR UPDATE
    D-->>R: book (available_copies = 1)
    R->>R: Check available_copies > 0 (FR-2)
    
    R->>R: Create BorrowTransaction record
    R->>R: Decrement available_copies by 1
    R->>D: INSERT INTO borrow_transactions (...)
    R->>D: UPDATE books SET available_copies = 0 WHERE id = Y
    R->>D: COMMIT TRANSACTION
    D-->>R: Transaction committed
    
    R-->>A: BorrowBookResponse JSON
    A-->>B: 200 OK + transaction data
    B-->>F: BorrowBookResponse
    F-->>U: Success message displayed
```

**Numbered Steps**:

1. User clicks "Borrow Book" button on BookDetailsPage.tsx
2. Frontend calls `borrowService.borrowBook(bookId)`
3. Service sends POST /api/borrow/{book_id} with JWT in Authorization header
4. FastAPI receives request and routes to borrow router
5. Auth middleware (get_current_user) validates JWT signature and expiration
6. Middleware queries users table to fetch current_user record and verify is_active
7. BorrowRouter checks current_user.role == UserRole.member (403 if not)
8. Router queries borrow_transactions to count active borrows (status = 'Borrowed', returned_at IS NULL)
9. Router rejects with 409 if active_count >= 5
10. Router queries borrow_transactions for existing user+book combination
11. Router rejects with 409 if duplicate active borrow exists
12. Router starts database transaction (READ COMMITTED isolation)
13. Router queries books table with SELECT FOR UPDATE row lock
14. Router rejects with 404 if book not found
15. Router rejects with 409 if available_copies <= 0
16. Router creates BorrowTransaction record with borrowed_at, due_date (now + 14 days), status = 'Borrowed'
17. Router decrements book.available_copies by 1
18. Router commits transaction atomically (both INSERT and UPDATE succeed or both rollback)
19. Pydantic BorrowBookResponse schema serializes transaction data
20. JSON response sent to frontend with 200 OK
21. React component updates UI with success notification

---

## API Contract

### POST /api/borrow/{book_id}

**Description**: Create a borrow transaction for an authenticated member user, decrement book inventory, and return transaction details.

**Auth**: JWT bearer token required (member role only)

**Path Parameters**:
- `book_id` (UUID string, required): Unique identifier of the book to borrow

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Example**:
```http
POST /api/borrow/3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response 200 OK** (Success):
```json
{
  "transaction_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "book_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "borrowed_at": "2026-06-06T14:30:00Z",
  "due_date": "2026-06-20T14:30:00Z",
  "status": "Borrowed"
}
```

**Response 400 Bad Request** (Malformed UUID):
```json
{
  "detail": [
    {
      "loc": ["path", "book_id"],
      "msg": "value is not a valid uuid",
      "type": "type_error.uuid"
    }
  ]
}
```
**Note**: FastAPI/Pydantic automatically returns 422 for invalid UUID format.

**Response 401 Unauthorized** (Missing or Invalid JWT):
```json
{
  "detail": "Not authenticated"
}
```
**Triggers**:
- No Authorization header
- Invalid JWT signature
- Expired JWT token
- JWT sub claim missing

**Response 403 Forbidden** (Wrong Role):
```json
{
  "detail": "Only members can borrow books"
}
```
**Triggers**:
- User has role: guest, admin, or librarian (not member)

**Response 404 Not Found** (Book Does Not Exist):
```json
{
  "detail": "Book not found"
}
```
**Triggers**:
- No book record with matching book_id in database

**Response 409 Conflict** (Business Rule Violation):

**Case 1: No Copies Available**
```json
{
  "detail": "No copies available for borrowing"
}
```
**Triggers**:
- Book exists but available_copies = 0

**Case 2: Member Borrow Limit Reached**
```json
{
  "detail": "You have reached the maximum limit of 5 active borrows"
}
```
**Triggers**:
- User already has 5 borrow transactions where returned_at IS NULL

**Case 3: Duplicate Active Borrow**
```json
{
  "detail": "You already have an active borrow for this book"
}
```
**Triggers**:
- User already has an active borrow transaction for this specific book (returned_at IS NULL)

**Response 422 Unprocessable Entity** (Validation Error):
```json
{
  "detail": [
    {
      "loc": ["path", "book_id"],
      "msg": "value is not a valid uuid",
      "type": "type_error.uuid"
    }
  ]
}
```
**Triggers**:
- Pydantic validation fails (e.g., book_id is not a valid UUID format)

---

## Database Schema

### Existing Tables (No Changes Required)

**Table: users**
```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'member',  -- Enum: admin, librarian, member, guest
    phone VARCHAR(30),
    address VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

**Table: books**
```sql
CREATE TABLE books (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(20) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    publisher VARCHAR(255),
    publication_year INTEGER,
    total_copies INTEGER NOT NULL DEFAULT 1,
    available_copies INTEGER NOT NULL DEFAULT 1,
    cover_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_books_available_copies_non_negative CHECK (available_copies >= 0)
);
```
**Note**: The CHECK constraint `ck_books_available_copies_non_negative` enforces NFR-4 (Inventory Consistency) at the database level.

**Table: borrow_transactions**
```sql
CREATE TABLE borrow_transactions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id),
    book_id VARCHAR(36) NOT NULL REFERENCES books(id),
    borrowed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    returned_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'Borrowed',  -- Enum: Borrowed, Returned, Overdue
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX ix_borrow_transactions_user_id ON borrow_transactions(user_id);
CREATE INDEX ix_borrow_transactions_book_id ON borrow_transactions(book_id);
CREATE INDEX ix_borrow_transactions_status ON borrow_transactions(status);
```

**Indexes Usage**:
- `ix_borrow_transactions_user_id`: Accelerates active borrow count query (FR-3)
- `ix_borrow_transactions_book_id`: Accelerates duplicate borrow check (FR-8)
- `ix_borrow_transactions_status`: Accelerates filtering by status (future reporting)

### Migration Required

**None** - All required tables and constraints already exist in the database schema.

---

## Impacted Files

### Files Already Implemented (Existing)

| File | Purpose | Status |
|------|---------|--------|
| `backend/app/routers/borrow.py` | Borrow endpoint router with business logic | ✅ Exists |
| `backend/app/models/book.py` | Book SQLAlchemy model with CHECK constraint | ✅ Exists |
| `backend/app/models/borrow_transaction.py` | BorrowTransaction SQLAlchemy model | ✅ Exists |
| `backend/app/models/user.py` | User SQLAlchemy model with UserRole enum | ✅ Exists |
| `backend/app/schemas/borrow_transaction.py` | Pydantic request/response schemas | ✅ Exists |
| `backend/app/auth/dependencies.py` | JWT auth middleware (get_current_user) | ✅ Exists |
| `backend/app/auth/jwt.py` | JWT encode/decode utilities | ✅ Exists |
| `backend/app/main.py` | FastAPI app with router registration | ✅ Exists |
| `frontend/src/services/borrowService.ts` | API client for borrow operations | ✅ Exists |
| `frontend/src/types/borrowTransaction.ts` | TypeScript interfaces for borrow data | ✅ Exists |
| `backend/tests/test_borrow.py` | Unit tests for borrow endpoint | ✅ Exists |

### Files Modified (None)

No existing files require modification. All infrastructure and models are already in place.

### Files Created (None)

No new files are required. The feature is fully implemented using existing architecture.

---

## Security Considerations

### Authentication (NFR-1)
- **JWT Validation**: All requests must include a valid JWT bearer token in the Authorization header
- **Token Verification**: python-jose library validates signature using SECRET_KEY and HS256 algorithm
- **Expiration Check**: Tokens are rejected if `exp` claim has passed
- **401 Enforcement**: Unauthenticated requests fail before any database queries execute
- **WWW-Authenticate Header**: 401 responses include `WWW-Authenticate: Bearer` header per RFC 6750

### Authorization (NFR-2)
- **Role-Based Access Control**: Only users with `role = member` can borrow books
- **Server-Side Enforcement**: Role check occurs in borrow router after JWT validation
- **Database Verification**: User role is fetched from database (not trusted from JWT claims alone)
- **403 Enforcement**: Valid JWTs with wrong roles (guest, admin, librarian) receive 403 Forbidden
- **Precedence**: 401 (auth failure) precedes 403 (authorization failure) in error response ordering

### SQL Injection Protection
- **ORM Parameterization**: All queries use SQLAlchemy ORM with parameter binding
- **No Raw SQL**: No string concatenation or raw SQL queries in router code
- **Input Validation**: UUID path parameter validated by Pydantic before query execution

### Data Integrity (NFR-3, NFR-4)
- **ACID Transactions**: Book decrement and transaction creation occur in single PostgreSQL transaction
- **Row-Level Locking**: `SELECT FOR UPDATE` prevents concurrent modifications to same book record
- **CHECK Constraint**: `available_copies >= 0` constraint prevents negative inventory
- **Atomic Commit**: Both INSERT and UPDATE succeed together or both rollback on failure

### Input Validation
- **Pydantic Schemas**: book_id validated as UUID format (422 on malformed input)
- **Type Safety**: FastAPI automatically validates path/query parameters
- **Boundary Checks**: Active borrow count and available copies checked before mutation

---

## Non-Functional Requirements

### NFR-1: Authentication Security
**Requirement**: JWT-based authentication enforces stateless, tamper-proof user identification.

**Implementation**:
- JWT tokens contain `sub` (user_id), `name`, `email`, and `role` claims
- Tokens signed with SECRET_KEY using HS256 algorithm
- Expiration validated via `exp` claim (default 30 minutes from issuance)
- `get_current_user` dependency rejects missing, expired, or invalid tokens with 401
- Guest users reconstructed from JWT claims (not stored in database)

**Verification**: Unit tests verify 401 responses for missing/expired/invalid tokens.

### NFR-2: Authorization Security
**Requirement**: Only member role can borrow books; other roles rejected with 403.

**Implementation**:
- Router checks `current_user.role != UserRole.member` and raises 403
- Role validation occurs after JWT authentication (401 precedes 403)
- Admin and librarian roles explicitly forbidden from borrowing (business rule)

**Verification**: Unit tests verify 403 for guest, admin, and librarian roles.

### NFR-3: Data Integrity
**Requirement**: Atomic transaction ensures decrement and transaction creation succeed together or both fail.

**Implementation**:
- PostgreSQL READ COMMITTED isolation level (default)
- `db.add()` stages both BorrowTransaction INSERT and Book UPDATE
- `db.commit()` commits both operations atomically
- Exception during commit triggers automatic rollback

**Verification**: Unit tests verify no partial state (transaction without decrement, or vice versa).

### NFR-4: Inventory Consistency
**Requirement**: available_copies never becomes negative.

**Implementation**:
- CHECK constraint `ck_books_available_copies_non_negative` at database level
- Pre-decrement check: `if book.available_copies <= 0: raise 409`
- Database rejects UPDATE if constraint violated (constraint violation error)

**Verification**: Unit tests verify 409 on zero copies; E2E tests verify concurrent borrow attempts.

### NFR-5: Error Clarity
**Requirement**: Human-readable error messages in `detail` field.

**Implementation**:
- 401: "Not authenticated"
- 403: "Only members can borrow books"
- 404: "Book not found"
- 409: Context-specific messages (no copies, limit reached, duplicate borrow)
- FastAPI HTTPException automatically formats errors as JSON with `status_code` and `detail`

**Verification**: Unit tests assert exact error messages for each status code.

### NFR-6: Performance Under Concurrency
**Requirement**: Maintain correctness and sub-2s response time under concurrent load.

**Implementation**:
- `SELECT FOR UPDATE` locks book row until transaction commits
- Row lock prevents concurrent decrements of same book (serializes conflicting requests)
- Lock released immediately on COMMIT or ROLLBACK
- PostgreSQL connection pooling handles concurrent requests efficiently

**Verification**: E2E tests verify correctness under 100 concurrent requests for last available copy.

### NFR-7: API Design Standards
**Requirement**: Follow RESTful conventions and FastAPI best practices.

**Implementation**:
- Resource-oriented URL: POST /api/borrow/{book_id}
- Pydantic v2 schemas with `model_config = {"from_attributes": True}`
- OpenAPI tag: "borrow" for automatic documentation grouping
- HTTP status codes: 200 (success), 401/403 (auth errors), 404 (not found), 409 (conflict), 422 (validation)

**Verification**: OpenAPI docs at /docs display endpoint with correct tags and schemas.

---

## Error Handling

### Error Response Format

All error responses follow FastAPI's standard HTTPException format:

```json
{
  "detail": "Human-readable error message"
}
```

For validation errors (422), Pydantic returns detailed field-level errors:

```json
{
  "detail": [
    {
      "loc": ["path", "book_id"],
      "msg": "value is not a valid uuid",
      "type": "type_error.uuid"
    }
  ]
}
```

### Error Precedence

Errors are checked in this order (first match short-circuits):

1. **422 Unprocessable Entity**: Pydantic validation fails (malformed UUID)
2. **401 Unauthorized**: Missing, expired, or invalid JWT
3. **403 Forbidden**: Valid JWT but wrong role
4. **404 Not Found**: Book does not exist
5. **409 Conflict**: Business rule violation (no copies, limit reached, duplicate borrow)

### Exception Handling

- **Database Errors**: SQLAlchemy exceptions caught and logged; generic 500 returned to client
- **Constraint Violations**: CHECK constraint violation triggers rollback; router pre-check prevents this
- **Deadlocks**: PostgreSQL row locking prevents deadlocks (FIFO lock queue)
- **Network Timeouts**: Frontend handles timeout with user-friendly message

---

## Testing Strategy

### Unit Tests (Backend)

**File**: `backend/tests/test_borrow.py`

**Test Coverage**:
- ✅ **test_borrow_book_success**: Member borrows available book → 200 + transaction created + copies decremented
- ✅ **test_borrow_book_unauthorized**: No JWT → 401
- ✅ **test_borrow_book_forbidden_guest**: Guest user → 403
- ✅ **test_borrow_book_forbidden_admin**: Admin user → 403
- ✅ **test_borrow_book_forbidden_librarian**: Librarian user → 403
- ✅ **test_borrow_book_not_found**: Non-existent book_id → 404
- ✅ **test_borrow_book_no_copies**: available_copies = 0 → 409
- ✅ **test_borrow_book_limit_reached**: User has 5 active borrows → 409
- ✅ **test_borrow_book_duplicate_active**: User already borrowed same book → 409
- ✅ **test_borrow_book_invalid_uuid**: Malformed book_id → 422

**Test Fixtures**:
- `client`: TestClient for FastAPI app
- `member_token`: JWT for member user
- `admin_token`: JWT for admin user
- `test_book`: Seeded book with available_copies > 0

**Assertion Patterns**:
```python
assert response.status_code == 200
assert response.json()["transaction_id"] is not None
assert response.json()["status"] == "Borrowed"
```

### Integration Tests (Backend)

**File**: `backend/tests/test_borrow.py` (same file, integration test class)

**Test Coverage**:
- ✅ **test_atomic_transaction_rollback**: Database error during commit → no partial state
- ✅ **test_concurrent_last_copy**: 100 concurrent requests for last copy → exactly 1 succeeds, 99 get 409

**Test Setup**:
- Use test database with real PostgreSQL instance
- Seed users, books, and borrow_transactions
- Use threading to simulate concurrent requests

### End-to-End Tests (Playwright)

**File**: `tests/e2e/borrow.spec.ts` (to be created if needed)

**Test Coverage**:
- **test_borrow_book_ui_flow**: Member logs in → navigates to book details → clicks "Borrow" → sees success message
- **test_borrow_book_no_copies_ui**: Member attempts to borrow unavailable book → sees error message
- **test_borrow_book_limit_reached_ui**: Member with 5 active borrows → sees limit message

**Test Environment**:
- Frontend running on http://localhost:3000
- Backend running on http://localhost:8000
- PostgreSQL test database with seeded data

### Test Execution

```bash
# Backend unit tests
cd backend
python -m pytest tests/test_borrow.py -v

# E2E tests (requires app running)
npx playwright test tests/e2e/borrow.spec.ts
```

### Coverage Goals

- **Backend Unit Tests**: ≥ 90% line coverage for borrow.py router
- **E2E Tests**: ≥ 80% coverage of critical user flows (success + major error paths)

---

## Deployment Considerations

### Environment Variables

**Existing Variables** (no new variables required):
```bash
# .env file
DATABASE_URL=postgresql://user:pass@localhost:5432/library
SECRET_KEY=your-secret-key-minimum-32-characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Database Migrations

**None required** - All tables, columns, and constraints already exist.

### Dependencies

**Existing Dependencies** (no new packages required):

**Backend (requirements.txt)**:
```
fastapi==0.115.0
uvicorn[standard]==0.30.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
pydantic==2.5.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
pytest==8.0.0
httpx==0.25.0
```

**Frontend (package.json)**:
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "typescript": "^5.0.0"
  }
}
```

### Deployment Steps

**None required** - Feature is fully implemented and deployed via existing workflow.

1. Backend already running on port 8000 via `uvicorn app.main:app --reload`
2. Frontend already running on port 3000 via `npm run dev`
3. PostgreSQL already running on port 5432 via Docker Compose
4. CI/CD pipeline already configured in `.gitlab-ci.yml`

---

## Open Questions

**None** - All requirements are fully specified and implemented. No ambiguities or unresolved decisions remain.

---

## Appendix: Business Rules Summary

| Rule ID | Description | HTTP Status | Error Message |
|---------|-------------|-------------|---------------|
| FR-4 | Only members can borrow | 403 | "Only members can borrow books" |
| FR-2 | Book must have available copies | 409 | "No copies available for borrowing" |
| FR-3 | User cannot exceed 5 active borrows | 409 | "You have reached the maximum limit of 5 active borrows" |
| FR-8 | User cannot borrow same book twice | 409 | "You already have an active borrow for this book" |
| FR-9 | Book must exist | 404 | "Book not found" |
| NFR-1 | Valid JWT required | 401 | "Not authenticated" |

---

## Appendix: Database Transaction Pseudocode

```python
# Atomic borrow transaction pseudocode
BEGIN TRANSACTION (READ COMMITTED isolation)
    
    # Row-level lock prevents concurrent modifications
    book = SELECT * FROM books WHERE id = book_id FOR UPDATE
    
    if book is None:
        ROLLBACK
        return 404 "Book not found"
    
    if book.available_copies <= 0:
        ROLLBACK
        return 409 "No copies available"
    
    # Create transaction record
    transaction = INSERT INTO borrow_transactions (
        user_id, book_id, borrowed_at, due_date, status
    ) VALUES (
        current_user.id, book_id, NOW(), NOW() + 14 days, 'Borrowed'
    )
    
    # Decrement inventory
    UPDATE books SET available_copies = available_copies - 1 WHERE id = book_id
    
    COMMIT TRANSACTION
    
    return 200 + transaction data

EXCEPTION:
    ROLLBACK TRANSACTION
    return 500 "Internal server error"
```

---

**END OF ARCHITECTURE DOCUMENT**
