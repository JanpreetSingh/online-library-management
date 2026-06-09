# Requirements: FR-3.1 Borrow a Book

**Source**: [EPMCDMETST-40786](https://jiraeu.epam.com/browse/EPMCDMETST-40786)
**Date**: 2026-06-06
**REQ-ID**: REQ-40786

## Overview

This feature enables authenticated library members to borrow available books from the catalog, automatically tracking inventory changes and enforcing business rules around borrowing limits and availability. The system ensures data consistency through atomic database operations and prevents race conditions during concurrent borrow attempts. This capability is foundational for the library's core lending workflow and provides accurate real-time availability data to all users.

## Actors

- **Member**: An authenticated user with the `member` role who can borrow books from the catalog, subject to availability and active borrow limits. Members cannot borrow if they already have 5 unreturned books.
- **System**: The backend service that validates requests, enforces business rules, manages database transactions, and tracks borrow history for audit and reporting purposes.

## Functional Requirements

### FR-1: Submit Borrow Request
**Description**: An authenticated user with the `member` role must be able to submit a borrow request for any book by providing its unique `bookId` identifier via a POST API endpoint.

**Acceptance Criteria**:
- ✅ AC1.1: POST /api/borrow/{book_id} with a valid JWT bearer token and `member` role returns 200 or appropriate error status
- ✅ AC1.2: The request body requires no additional parameters beyond the JWT in the Authorization header
- ✅ AC1.3: The `book_id` path parameter accepts UUID format and returns 422 for malformed UUIDs
- ✅ AC1.4: The endpoint validates JWT signature and expiration before processing any business logic

**Priority**: High

### FR-2: Reject When No Copies Available
**Description**: The system must reject borrow requests when the target book has zero available copies, returning a clear error message that explains why the request cannot be fulfilled.

**Acceptance Criteria**:
- ✅ AC2.1: Attempting to borrow a book with `available_copies = 0` returns HTTP 409 Conflict
- ✅ AC2.2: The 409 response includes detail message: "Book is not available for borrowing"
- ✅ AC2.3: No borrow transaction record is created when `available_copies = 0`
- ✅ AC2.4: The book's `available_copies` value remains unchanged after a failed request

**Priority**: High

### FR-3: Enforce Member Borrow Limit
**Description**: The system must prevent members from borrowing additional books when they already have 5 active (unreturned) borrow transactions, protecting library inventory from monopolization.

**Acceptance Criteria**:
- ✅ AC3.1: Attempting to borrow when the user has 5 active borrows returns HTTP 409 Conflict
- ✅ AC3.2: The 409 response includes detail message: "You have reached the maximum limit of 5 active borrows"
- ✅ AC3.3: Active borrows are counted by querying `borrow_transactions` where `user_id = current_user.id` and `status = 'Borrowed'`
- ✅ AC3.4: Returned books (status != 'Borrowed') do not count toward the limit

**Priority**: High

### FR-4: Require Authentication and Member Role
**Description**: The system must verify that the requester possesses a valid JWT token and holds the `member` role, rejecting unauthenticated users and users with other roles (guest, admin, librarian).

**Acceptance Criteria**:
- ✅ AC4.1: Requests without an Authorization header return HTTP 401 Unauthorized
- ✅ AC4.2: Requests with expired or invalid JWT tokens return HTTP 401 Unauthorized with detail "Not authenticated"
- ✅ AC4.3: Requests from users with role `guest`, `admin`, or `librarian` return HTTP 403 Forbidden
- ✅ AC4.4: The 403 response includes role-specific detail message (e.g., "Guest users cannot borrow books")
- ✅ AC4.5: Role validation occurs after JWT validation (401 precedes 403)

**Priority**: High

### FR-5: Create Borrow Transaction Record
**Description**: On successful borrow, the system must create a persistent transaction record capturing the user, book, timestamp, due date, and status for audit, reporting, and return-flow integration.

**Acceptance Criteria**:
- ✅ AC5.1: A new row is inserted into `borrow_transactions` with a UUID primary key
- ✅ AC5.2: The record includes `user_id` (from JWT), `book_id`, `borrowed_at` (current UTC timestamp), `due_date` (14 days from now), and `status = 'Borrowed'`
- ✅ AC5.3: The API returns the transaction data in a JSON response with keys: `transaction_id`, `book_id`, `user_id`, `borrowed_at`, `due_date`, `status`
- ✅ AC5.4: The `transaction_id` matches the database primary key value

**Priority**: High

### FR-6: Decrement Book Available Copies Atomically
**Description**: On successful borrow, the system must decrement the book's `available_copies` by exactly 1 and ensure this decrement and the transaction creation occur atomically within a single database transaction.

**Acceptance Criteria**:
- ✅ AC6.1: The book's `available_copies` decreases by 1 when a borrow succeeds
- ✅ AC6.2: The `available_copies` value never falls below 0, enforced by a CHECK constraint at the database level
- ✅ AC6.3: If transaction creation fails, the `available_copies` decrement is rolled back
- ✅ AC6.4: If the decrement fails, the transaction record is not created
- ✅ AC6.5: The database operation uses `SELECT ... FOR UPDATE` to lock the book row before decrementing

**Priority**: High

### FR-7: Handle Concurrent Borrow Attempts Safely
**Description**: When multiple users attempt to borrow the last available copy simultaneously, the system must ensure exactly one request succeeds while all others receive an error, preventing overselling and maintaining inventory accuracy.

**Acceptance Criteria**:
- ✅ AC7.1: Under concurrent requests for a book with `available_copies = 1`, exactly one transaction record is created
- ✅ AC7.2: Under concurrent requests for a book with `available_copies = 1`, the book's final `available_copies` value is 0
- ✅ AC7.3: All unsuccessful concurrent requests receive HTTP 409 Conflict with detail "Book is not available for borrowing"
- ✅ AC7.4: No partial state occurs (e.g., transaction created but copies not decremented)
- ✅ AC7.5: PostgreSQL row-level locking (`SELECT FOR UPDATE`) prevents race conditions

**Priority**: High

### FR-8: Prevent Duplicate Active Borrows
**Description**: The system must prevent a member from borrowing the same book multiple times concurrently, rejecting duplicate borrow requests when an active transaction already exists for the same user-book combination.

**Acceptance Criteria**:
- ✅ AC8.1: Attempting to borrow a book the user has already borrowed (status = 'Borrowed') returns HTTP 409 Conflict
- ✅ AC8.2: The 409 response includes detail message: "You already have an active borrow for this book"
- ✅ AC8.3: The check queries `borrow_transactions` for existing records where `user_id = current_user.id`, `book_id = target_book_id`, and `status = 'Borrowed'`
- ✅ AC8.4: Returned copies (status != 'Borrowed') can be borrowed again

**Priority**: High

### FR-9: Handle Non-Existent Book IDs
**Description**: The system must return a clear error when the requested `book_id` does not exist in the database, preventing silent failures and providing actionable feedback to clients.

**Acceptance Criteria**:
- ✅ AC9.1: Requesting a non-existent `book_id` returns HTTP 404 Not Found
- ✅ AC9.2: The 404 response includes detail message: "Book not found"
- ✅ AC9.3: No database modifications occur (no transaction created, no inventory change)

**Priority**: Medium

## Non-Functional Requirements

### NFR-1: Authentication Security
**Description**: The borrow endpoint must enforce JWT-based authentication to prevent unauthorized access and ensure all actions are attributable to authenticated users.

**Acceptance Criteria**:
- ✅ Requests without a valid JWT bearer token are rejected with 401 before any database queries execute
- ✅ JWT signature verification uses the configured secret key and algorithm (HS256)
- ✅ Expired tokens are rejected with 401 and WWW-Authenticate header
- ✅ The JWT `sub` claim is used to identify the user performing the action

**Priority**: High

### NFR-2: Authorization Security
**Description**: Role-based access control must be enforced server-side to ensure only members can borrow books, preventing privilege escalation attacks via client-side manipulation.

**Acceptance Criteria**:
- ✅ Role validation occurs after successful JWT authentication
- ✅ The user's role is fetched from the database (not trusted from JWT claims alone)
- ✅ Users with roles other than `member` receive 403 Forbidden
- ✅ The role check uses equality: `if current_user.role != UserRole.member: raise 403`

**Priority**: High

### NFR-3: Data Integrity
**Description**: The atomic borrow operation (decrement inventory + create transaction) must be enforced at the database level to prevent data inconsistencies under all failure scenarios.

**Acceptance Criteria**:
- ✅ The decrement and transaction creation occur within a single PostgreSQL transaction
- ✅ Database transaction isolation level is READ COMMITTED (PostgreSQL default)
- ✅ `SELECT FOR UPDATE` row lock prevents concurrent modifications to the same book record
- ✅ If any part of the operation fails, the entire transaction is rolled back with no partial state

**Priority**: High

### NFR-4: Inventory Consistency
**Description**: The system must guarantee that `available_copies` never becomes negative, regardless of concurrent load or application bugs, through database-level constraints.

**Acceptance Criteria**:
- ✅ A CHECK constraint on `books.available_copies >= 0` is enforced at the PostgreSQL level
- ✅ Attempts to decrement below zero result in a constraint violation and transaction rollback
- ✅ The application returns 409 Conflict if the pre-borrow check finds `available_copies = 0`

**Priority**: High

### NFR-5: Error Clarity
**Description**: All error responses must include human-readable messages in the `detail` field, enabling frontend developers to display actionable feedback to users without parsing status codes.

**Acceptance Criteria**:
- ✅ 401 responses include detail: "Not authenticated"
- ✅ 403 responses include role-specific messages: "Guest users cannot borrow books"
- ✅ 404 responses include detail: "Book not found"
- ✅ 409 responses include context-specific messages (no copies, limit reached, duplicate borrow)
- ✅ All error responses follow FastAPI's standard HTTPException format with `status_code` and `detail`

**Priority**: Medium

### NFR-6: Performance Under Concurrency
**Description**: The borrow endpoint must maintain correctness and acceptable response times under concurrent load, handling realistic race conditions without performance degradation.

**Acceptance Criteria**:
- ✅ The endpoint handles 100 concurrent borrow requests for the same book without data corruption
- ✅ Response time remains under 2 seconds for borrow requests under normal load (50 concurrent users)
- ✅ Database row locks are released immediately after transaction commit/rollback
- ✅ No deadlocks occur under concurrent access patterns

**Priority**: Medium

### NFR-7: API Design Standards
**Description**: The borrow API must follow RESTful conventions and FastAPI best practices for consistency with existing endpoints and ease of integration.

**Acceptance Criteria**:
- ✅ The endpoint follows the pattern POST /api/borrow/{book_id} (resource-oriented URL)
- ✅ Response schemas use Pydantic v2 with `ConfigDict(from_attributes=True)`
- ✅ The endpoint is tagged as "borrowing" in OpenAPI documentation
- ✅ HTTP status codes follow semantic standards (200 success, 401/403 auth errors, 404 not found, 409 conflict, 422 validation)

**Priority**: Low

## Assumptions and Constraints

- The `member` role is the only role permitted to borrow books; `admin` and `librarian` roles are explicitly excluded
- No suspended or blocked member flag exists; eligibility is determined solely by valid JWT + `member` role
- Due dates are set to 14 days from borrow time (technical prerequisite for return flow but not enforced in this story)
- The maximum concurrent borrow limit of 5 is a fixed business rule and not configurable in this iteration
- PostgreSQL 15 with default READ COMMITTED isolation level is used
- The JWT authentication system already exists and is functioning correctly
- The `books` and `users` tables are pre-populated with valid data
- Standard server access logs are sufficient for observability; no dedicated audit event table is required for this story
- The frontend will display error messages from the API's `detail` field directly to users

## Out of Scope

- Payment processing, late fees, or overdue fines
- Reservation or hold queue systems
- Book return flow (handled by separate story)
- Due date enforcement, overdue notifications, or loan period configuration
- Email/SMS notifications on successful borrow
- Admin or librarian override capabilities for borrow eligibility rules
- Member account suspension or blocking features
- Configurable borrow limits (fixed at 5 for v1)
- Borrow history reporting or analytics
- Integration with external library management systems
- Mobile app support (web only for v1)
- Book recommendations based on borrow history
- Rate limiting configuration (deferred to infrastructure review)

## Dependencies

- **User Authentication System**: JWT-based authentication with `python-jose` and `passlib` already exists and is operational
- **Book Catalog API**: The `books` table and related CRUD endpoints already exist with `available_copies` field
- **PostgreSQL Database**: PostgreSQL 15 instance is provisioned with `books`, `users`, and `borrow_transactions` tables
- **SQLAlchemy ORM**: SQLAlchemy 2.0 is configured with proper session management and transaction handling
- **Frontend Auth Context**: React auth context provides JWT token to API service layer via axios interceptors
- **Nginx Reverse Proxy**: Configured to route `/api/*` requests to FastAPI backend on port 8000
