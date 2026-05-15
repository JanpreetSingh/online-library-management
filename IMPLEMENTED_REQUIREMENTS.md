# Implemented Requirements

This document lists all functional requirements that have been fully implemented (UI + backend) in the current version of the Online Library Management System.

---

## FR-1 — User Authentication & Profile

### FR-1.1 — User Registration (Admin-only)
- **Status:** ✅ Implemented
- **Description:** An admin can create new user accounts (librarian or member role) from the Register page.
- **Frontend:** `RegisterPage.tsx` — form with name, email, password, role selector. Accessible only to users with `admin` role (`/register` route is admin-protected).
- **Backend:** `POST /api/auth/register` — validates payload, hashes password with bcrypt, stores user in `users` table. Returns 409 if email already exists.

---

### FR-1.2 — User Login
- **Status:** ✅ Implemented
- **Description:** Registered users (admin, librarian, member) can log in with email and password and receive a JWT.
- **Frontend:** `LoginPage.tsx` — email/password form with Zod validation. On success, JWT is stored in `localStorage` and user is redirected to `/dashboard`.
- **Backend:** `POST /api/auth/login` — verifies email, validates bcrypt password hash, issues a signed JWT (HS256) with `sub`, `role`, `name` claims. Expires in 30 minutes.

---

### FR-1.3 — Profile Update
- **Status:** ✅ Implemented
- **Description:** Any authenticated user can view and update their own profile (name, phone number, address).
- **Frontend:** `ProfilePage.tsx` — pre-populated form. Submits changes and shows success toast.
- **Backend:**
  - `GET /api/users/me` — returns current user's profile from DB.
  - `PUT /api/users/me` — updates `name`, `phone`, `address` fields. Partial updates supported (only provided fields are changed).

---

### FR-1.6 — Guest Login
- **Status:** ✅ Implemented
- **Description:** Any visitor can enter the system as a read-only guest without creating an account.
- **Frontend:** `GuestLoginPage.tsx` — single button "Continue as Guest". Navigates to dashboard on success.
- **Backend:** `POST /api/auth/guest-login` — issues a short-lived JWT with role `guest`. Guest users are **not** stored in the database; the token itself carries all guest identity.
- **Access control:** Guest users can browse books but cannot add/edit books or borrow.

---

## FR-2 — Book Management

### FR-2.1 — Add Books
- **Status:** ✅ Implemented
- **Description:** Admin and Librarian users can add new books to the library catalogue.
- **Frontend:** `BooksPage.tsx` — "Add Book" button (visible to admin/librarian only) opens a modal with `BookForm.tsx`. Form validates all fields with Zod.
- **Backend:** `POST /api/books` — role-guarded (admin/librarian only). Validates ISBN uniqueness (409 Conflict if duplicate). Stores book in `books` table with `available_copies` set equal to `total_copies` on creation.
- **Fields:** title, author, ISBN, category, publisher, publication year, total copies, cover image URL (optional).

---

### FR-2.2 — Edit Books
- **Status:** ✅ Implemented
- **Description:** Admin and Librarian users can edit existing book details.
- **Frontend:** `EditBookPage.tsx` — loads existing book data from API, pre-fills `BookForm.tsx`. On save, calls PUT and redirects to `/books`.
- **Backend:** `PUT /api/books/{id}` — role-guarded (admin/librarian only). Partial updates supported. If `total_copies` changes, `available_copies` is adjusted proportionally (clamped to 0). ISBN uniqueness is re-validated against other records on change.

---

## FR-2 (Additional) — View Books

### FR-2.0 — View Book Catalogue
- **Status:** ✅ Implemented
- **Description:** All authenticated users (including guests) can browse the full list of books.
- **Frontend:** `BooksPage.tsx` — displays books in a card grid with title, author, category, ISBN, available/total copies. Shows empty state when no books exist.
- **Backend:**
  - `GET /api/books` — returns all books, ordered by `created_at` descending. Accessible to all authenticated roles including guest.
  - `GET /api/books/{id}` — returns a single book by ID.

---

## FR-3 — Borrowing & Returns

### FR-3.1 — Borrow a Book
- **Status:** ✅ Implemented
- **Description:** Members, librarians, and admins can borrow available books. Guest users cannot borrow.
- **Frontend:** `BooksPage.tsx` — "Borrow" button appears on each book card (visible to member/librarian/admin, hidden for guests). Shows loading state during request. On success, displays toast notification and updates available copies immediately.
- **Backend:** `POST /api/borrow/{book_id}` — role-guarded (guest blocked). Creates `BorrowTransaction` with status `BORROWED`, sets `borrow_date` to current timestamp, `due_date` to 14 days later. Validates:
  - Book exists and has available copies
  - User hasn't exceeded 5 active borrows limit
  - User doesn't already have an active borrow of this book
  - Uses row-level locking to prevent race conditions
- **Business Rules:**
  - 14-day loan period
  - Maximum 5 active borrows per user
  - Decrements `available_copies` atomically
  - Transaction tracking with status enum (BORROWED, RETURNED, OVERDUE)
- **Database:** `borrow_transactions` table with indexed foreign keys to `users` and `books`.

---

## Summary Table

| Requirement | Feature | UI | Backend |
|---|---|---|---|
| FR-1.1 | User Registration (admin creates users) | ✅ | ✅ |
| FR-1.2 | Login with email & password | ✅ | ✅ |
| FR-1.3 | Profile Update (name, phone, address) | ✅ | ✅ |
| FR-1.6 | Guest Login (no account needed) | ✅ | ✅ |
| FR-2.0 | View Book Catalogue | ✅ | ✅ |
| FR-2.1 | Add Books (admin/librarian) | ✅ | ✅ |
| FR-2.2 | Edit Books (admin/librarian) | ✅ | ✅ |
| FR-3.1 | Borrow a Book (member/librarian/admin) | ✅ | ✅ |

---

## Not Yet Implemented

| Requirement | Feature |
|---|---|
| FR-3.2 | Return a Book |
| FR-3.3 | View My Borrowed Books |
| FR-4.1 | Admin — View All Users |
| FR-4.2 | Admin — Create Librarian/Member Accounts (bulk/import) |
| FR-4.3 | Admin/Librarian — View All Borrow Transactions |
