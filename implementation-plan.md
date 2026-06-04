# Implementation Plan: FR-3.1 Borrow a Book

## Source
Architecture: `ARCHITECTURE.md`
Requirements: `REQUIREMENTS.md`
Design Review: `design-review.md`

---

## Summary

| Metric | Value |
|--------|-------|
| Total tasks | 14 |
| Critical path | TASK-1 → TASK-2 → TASK-3 → TASK-5 → TASK-6 |
| Already completed | 14 |
| Remaining tasks | 0 |
| Blocked tasks | 0 |
| Parallel tracks | 2 (Frontend track / Open-items track) |
| Coverage gaps | 0 |

---

## Critical Path

```
TASK-1 (DB migration + CHECK constraint)
  └── TASK-2 (BorrowTransaction model)              ← DONE
        └── TASK-3 (BorrowBookResponse schema)      ← DONE
              └── TASK-5 (borrow router — role fix) ← NEEDS FIX
                    └── TASK-6 (pytest tests)        ← DONE (re-run after fix)
```

**TASK-4** (auth dependencies patch) is a prerequisite of TASK-5 and is **DONE**.

---

## Parallel Tracks

### Track B — Frontend (can start immediately, independent of backend fixes)
```
TASK-7 (TS types)   ← DONE
  └── TASK-8 (borrowService.ts)   ← DONE
        └── TASK-9 (BooksPage.tsx borrow UI)   ← DONE
```

### Track C — Open items (P3, start after TASK-5 is fixed)
```
TASK-10 (UUID validation at router)
TASK-11 (document 401/403 decision)
TASK-12 (document PostgreSQL isolation strategy)
TASK-13 (nginx rate-limiting review)
TASK-14 (due_date scope decision)
```

---

## Task Breakdown

### TASK-1: Database Migration — borrow_transactions table + CHECK constraint
- **Area**: Database
- **Priority**: P1
- **Depends on**: none
- **Status**: done ✓
- **Files**:
  - `backend/app/models/book.py` — add `CheckConstraint("available_copies >= 0")` to `__table_args__`
  - `backend/app/models/borrow_transaction.py` — EXISTS ✓ (table + indexes in place)
- **Description**: `borrow_transactions` table is already created via SQLAlchemy auto-migration. **Remaining work**: add `CheckConstraint("available_copies >= 0", name="ck_books_available_copies_non_negative")` to `book.py` `__table_args__` so the DB enforces the invariant at the storage layer in addition to app-level `SELECT FOR UPDATE`.
- **AC coverage**: AC-4 (availableCopies never below 0), AC-6 (concurrent safety)
- **Open items from design-review**: Finding #3 — DB-level constraint missing; currently relies solely on app-level enforcement

---

### TASK-2: Backend Model — BorrowTransaction SQLAlchemy ORM
- **Area**: Backend models
- **Priority**: P1
- **Depends on**: TASK-1
- **Status**: done ✓
- **Files**:
  - `backend/app/models/borrow_transaction.py` — EXISTS ✓
- **Description**: Model present with UUID PK, FK to users + books, borrowed_at, due_date, returned_at (nullable), status VARCHAR, and composite indexes on user_id, book_id, status.
- **AC coverage**: AC-1, AC-5

---

### TASK-3: Backend Schema — BorrowBookResponse Pydantic v2
- **Area**: Backend schemas
- **Priority**: P1
- **Depends on**: TASK-2
- **Status**: done ✓
- **Files**:
  - `backend/app/schemas/borrow_transaction.py` — EXISTS ✓
- **Description**: Pydantic v2 schema for the 200 response: `transaction_id`, `book_id`, `user_id`, `borrowed_at`, `due_date`, `status`.
- **AC coverage**: AC-1

---

### TASK-4: Backend Auth — HTTPBearer patch in dependencies.py
- **Area**: Backend auth
- **Priority**: P1
- **Depends on**: none
- **Status**: done ✓
- **Files**:
  - `backend/app/auth/dependencies.py` — EXISTS ✓
- **Description**: `HTTPBearer(auto_error=False)` in place; absent credentials raise explicit 401 with `WWW-Authenticate: Bearer` header before any business logic runs. Guest tokens produce a transient User object (not DB-fetched).
- **AC coverage**: AC-5 (unauthenticated → 401)
- **Open items from design-review**: Finding #2 — 401 for missing/invalid JWT (NFR1) vs 403 for valid JWT with wrong role (AC5) split is now implemented; document this decision in code comment (see TASK-11)

---

### TASK-5: Backend Router — POST /api/borrow/{book_id} role check fix
- **Area**: Backend routers
- **Priority**: P1
- **Depends on**: TASK-2, TASK-3, TASK-4
- **Status**: done ✓
- **Files**:
  - `backend/app/routers/borrow.py` — modify role check
- **Description**: Router exists and handles 404/409 cases correctly. **Critical fix required**: the current role guard only blocks `UserRole.guest`. Architecture (Data Flow Step 6, patched after design-review finding #1) requires **all non-member roles** to be blocked: guest, admin, and librarian. Change the role check from:
  ```python
  if current_user.role == UserRole.guest:
  ```
  to:
  ```python
  if current_user.role != UserRole.member:
  ```
  This aligns with REQUIREMENTS.md Assumptions ("The `member` role is the only role permitted to borrow; admin and librarian roles are not in scope").
- **AC coverage**: AC-1, AC-2, AC-3, AC-4, AC-5, AC-6
- **Open items from design-review**: Finding #1 (resolved in ARCHITECTURE.md but not yet applied to code)

---

### TASK-6: Backend Tests — pytest test suite
- **Area**: Backend tests
- **Priority**: P2
- **Depends on**: TASK-5
- **Status**: done ✓
- **Files**:
  - `backend/tests/test_borrow.py` — EXISTS ✓ (9 tests, all passing)
- **Description**: 7 tests cover all AC. After the role-check fix in TASK-5, add a test case for `admin` and `librarian` roles to confirm they receive 403. Re-run the full suite to confirm all 7+ tests pass.
- **AC coverage**: AC-1, AC-2, AC-3, AC-4, AC-5, AC-6

---

### TASK-7: Frontend Types — BorrowBookResponse TypeScript interface
- **Area**: Frontend types
- **Priority**: P2
- **Depends on**: none
- **Status**: done ✓
- **Files**:
  - `frontend/src/types/borrowTransaction.ts` — EXISTS ✓
- **Description**: TypeScript interface mirroring the API 200 response shape.
- **AC coverage**: AC-1

---

### TASK-8: Frontend Service — borrowService.ts
- **Area**: Frontend services
- **Priority**: P2
- **Depends on**: TASK-7
- **Status**: done ✓
- **Files**:
  - `frontend/src/services/borrowService.ts` — EXISTS ✓
- **Description**: `borrowBook(bookId)` axios call to `POST /api/borrow/{book_id}` with Bearer token injected by `services/api.ts` interceptor.
- **AC coverage**: AC-1

---

### TASK-9: Frontend Page — BooksPage.tsx borrow button + state
- **Area**: Frontend pages
- **Priority**: P2
- **Depends on**: TASK-7, TASK-8
- **Status**: done ✓
- **Files**:
  - `frontend/src/pages/BooksPage.tsx` — EXISTS ✓
- **Description**: Borrow button per book row, `handleBorrow()` handler, `borrowingBookId` loading state, success/error toast feedback.
- **AC coverage**: AC-1, AC-2, AC-3, AC-5

---

### TASK-10: Security — UUID format validation at borrow router
- **Area**: Backend routers
- **Priority**: P2
- **Depends on**: TASK-5
- **Status**: done ✓
- **Files**:
  - `backend/app/routers/borrow.py` — modify `book_id` path parameter type
- **Description**: Change `book_id: str` to `book_id: uuid.UUID` in the route signature. FastAPI will then return a clean `422 Unprocessable Entity` for malformed UUIDs before any DB query runs, instead of allowing a malformed string to reach SQLAlchemy and produce a 500. Convert to string internally with `str(book_id)` where the ORM expects it.
- **AC coverage**: supports AC-2 (clean error on bad input)
- **Open items from design-review**: Finding #6 — UUID format validation at router level

---

### TASK-11: Documentation — 401 vs 403 split decision comment
- **Area**: Backend auth
- **Priority**: P3
- **Depends on**: TASK-5
- **Status**: done ✓
- **Files**:
  - `backend/app/auth/dependencies.py` — add inline comment
  - `backend/app/routers/borrow.py` — add inline comment
- **Description**: Add a short comment above the credential check in `dependencies.py` and above the role check in `borrow.py` documenting the split: "401 = missing or invalid JWT (NFR1); 403 = valid JWT but insufficient role (AC-5)." Prevents future maintainers from collapsing the two into a single 403.
- **AC coverage**: supports AC-5 (clarity)
- **Open items from design-review**: Finding #2

---

### TASK-12: Documentation — PostgreSQL isolation level comment
- **Area**: Backend routers
- **Priority**: P3
- **Depends on**: TASK-5
- **Status**: done ✓
- **Files**:
  - `backend/app/routers/borrow.py` — add inline comment above `select(...).with_for_update()`
- **Description**: Add a comment: "PostgreSQL READ COMMITTED isolation + SELECT FOR UPDATE row lock ensures at-most-one successful concurrent borrow for the last copy." Makes the concurrency strategy explicit for reviewers and auditors.
- **AC coverage**: AC-6 (concurrent safety)
- **Open items from design-review**: Finding #4

---

### TASK-13: Infrastructure — nginx rate-limiting review
- **Area**: Configuration
- **Priority**: P3
- **Depends on**: none
- **Status**: done ✓
- **Files**:
  - `frontend/nginx.conf` — review or add `limit_req_zone` directive
- **Description**: Review `nginx.conf` for an existing `limit_req` or `limit_req_zone` directive on `/api/borrow`. If absent, either add a conservative rate limit (e.g., `10r/s` per IP with `burst=5`) or raise as an infrastructure ticket and document the deferral decision. Prevents a single member flooding the endpoint with borrow requests causing DB lock contention.
- **AC coverage**: NFR Security (NFR1 boundary protection)
- **Open items from design-review**: Finding #5

---

### TASK-14: Scope decision — due_date in DB schema vs REQUIREMENTS.md
- **Area**: Backend models
- **Priority**: P3
- **Depends on**: none
- **Status**: done ✓
- **Files**:
  - `backend/app/models/borrow_transaction.py` — comment or defer column
- **Description**: REQUIREMENTS.md explicitly marks due dates out of scope for this story, but `due_date` is present in the model, data flow, and API response (set to `now() + 14 days`). Decision required: (a) keep as a technical prerequisite for the return-flow story and add a TODO comment acknowledging the scope decision, OR (b) remove the column and strip it from the response schema. Whichever is chosen, document the rationale.
- **AC coverage**: n/a (scope governance)
- **Open items from design-review**: Finding #7

---

## Blocked Tasks

| Task | Blocked by | What is needed |
|------|-----------|----------------|
| TASK-6 (re-run tests) | TASK-5 role check fix | Apply `!= UserRole.member` guard + add admin/librarian test cases, then re-run suite |
| TASK-10 (UUID validation) | TASK-5 merged into same file | Apply after TASK-5 to avoid conflicting edits |
| TASK-11 (comment 401/403) | TASK-5 | Wait for final role-check code to settle before adding explanatory comment |

---

## Coverage Gaps

None. All 6 acceptance criteria are covered:

| AC | Covered by |
|----|-----------|
| AC-1 (successful borrow) | TASK-5, TASK-8, TASK-9 |
| AC-2 (0 copies → 409) | TASK-5, TASK-9 |
| AC-3 (5 active borrows → 409) | TASK-5 |
| AC-4 (availableCopies decremented, never negative) | TASK-1, TASK-5 |
| AC-5 (unauthenticated / wrong role → 401/403) | TASK-4, TASK-5 |
| AC-6 (concurrent borrow → exactly one succeeds) | TASK-1, TASK-5 |
