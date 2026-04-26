# Online Library Management System

A full-stack web application for managing a library — books, users, and borrowing — built with React, FastAPI, and PostgreSQL.

---

## Table of Contents

- [Application Structure](#application-structure)
- [Frontend](#frontend)
- [Backend](#backend)
- [Database](#database)
- [Deployment](#deployment)
- [How to Run](#how-to-run)
- [Default Credentials](#default-credentials)

---

## Application Structure

```
online-library-management/
├── frontend/                  # React + TypeScript SPA
│   ├── src/
│   │   ├── components/        # Reusable UI components (BookForm, PrivateRoute, Navbar…)
│   │   ├── contexts/          # AuthContext (JWT state, login/logout)
│   │   ├── pages/             # Page-level components (Login, Dashboard, Books…)
│   │   ├── services/          # Axios API clients (authService, bookService)
│   │   ├── types/             # TypeScript type definitions
│   │   └── App.tsx            # Route definitions
│   ├── Dockerfile             # Multi-stage: Node build → Nginx serve
│   ├── nginx.conf             # Nginx reverse-proxy config (SPA fallback + /api proxy)
│   └── vite.config.ts         # Vite config with dev proxy (/api → localhost:8000)
│
├── backend/                   # FastAPI Python service
│   ├── app/
│   │   ├── auth/              # JWT helpers (jwt.py, passwords.py, dependencies.py)
│   │   ├── models/            # SQLAlchemy ORM models (user.py, book.py)
│   │   ├── routers/           # API route handlers (auth.py, users.py, books.py)
│   │   ├── schemas/           # Pydantic request/response models (user.py, book.py)
│   │   ├── config.py          # Settings via pydantic-settings (.env)
│   │   ├── database.py        # SQLAlchemy engine, session, Base
│   │   └── main.py            # FastAPI app entry — CORS, router registration
│   ├── seed.py                # Creates DB tables + seeds default admin on startup
│   ├── requirements.txt       # Python dependencies
│   └── Dockerfile             # Python 3.11-slim image
│
├── docker-compose.yml         # Orchestrates db, backend, frontend containers
└── README.md
```

---

## Frontend

| Item | Detail |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite 5 |
| Styling | Tailwind CSS |
| Routing | react-router-dom v6 |
| Forms | react-hook-form + Zod validation |
| HTTP client | Axios |
| Auth | JWT stored in `localStorage`, decoded with jwt-decode |
| Notifications | react-hot-toast |
| Production server | Nginx (Alpine) |

### Pages & Routes

| Route | Page | Access |
|---|---|---|
| `/login` | LoginPage | Public |
| `/guest` | GuestLoginPage | Public |
| `/dashboard` | DashboardPage | All authenticated roles |
| `/register` | RegisterPage | Admin only |
| `/profile` | ProfilePage | All authenticated roles |
| `/books` | BooksPage | All authenticated roles |
| `/books/:id/edit` | EditBookPage | Admin / Librarian only |

### Role-Based Access

- **admin** — full access: manage users, books, transactions
- **librarian** — add/edit books, manage borrowing
- **member** — browse books, borrow, view own transactions
- **guest** — read-only browse (no borrowing)

---

## Backend

| Item | Detail |
|---|---|
| Framework | FastAPI 0.115 |
| ORM | SQLAlchemy 2.0 |
| Validation | Pydantic v2 |
| Authentication | JWT (python-jose), bcrypt passwords (passlib + bcrypt 4.0.1) |
| Server | Uvicorn with `--reload` in dev |
| Settings | pydantic-settings, loaded from `.env` |

### API Endpoints

#### Auth — `/api/auth`
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/login` | Email + password login → JWT |
| POST | `/api/auth/guest-login` | Guest access → short-lived JWT |
| POST | `/api/auth/register` | Create a new user (admin only) |

#### Users — `/api/users`
| Method | Path | Description |
|---|---|---|
| GET | `/api/users/me` | Get current user profile |
| PUT | `/api/users/me` | Update name / phone / address |

#### Books — `/api/books`
| Method | Path | Description | Roles |
|---|---|---|---|
| GET | `/api/books` | List all books | All |
| GET | `/api/books/{id}` | Get single book | All |
| POST | `/api/books` | Add a new book | Admin, Librarian |
| PUT | `/api/books/{id}` | Edit a book | Admin, Librarian |

### Key Design Decisions

- Guest users are **not** stored in the database — a transient JWT is issued and the `User` object is reconstructed from the token on each request.
- `available_copies` is automatically adjusted when `total_copies` is updated via `PUT /api/books/{id}`.
- ISBN uniqueness is enforced at both the database level (unique constraint) and the API level (409 Conflict response).

---

## Database

| Item | Detail |
|---|---|
| Engine | PostgreSQL 16 (Alpine) |
| Host | `db` Docker service, port `5432` |
| Database | `library_db` |
| User | `library_user` |
| Password | `library_pass` |
| Persistence | Docker named volume `postgres_data` |

### Tables

#### `users`
| Column | Type | Notes |
|---|---|---|
| id | VARCHAR(36) | UUID primary key |
| name | VARCHAR(120) | Required |
| email | VARCHAR(255) | Unique, nullable (guest has none) |
| password_hash | VARCHAR(255) | bcrypt hash |
| role | ENUM | `admin`, `librarian`, `member`, `guest` |
| phone | VARCHAR(30) | Optional |
| address | VARCHAR(500) | Optional |
| is_active | BOOLEAN | Soft-disable accounts |
| created_at | TIMESTAMPTZ | Auto-set |
| updated_at | TIMESTAMPTZ | Auto-updated |

#### `books`
| Column | Type | Notes |
|---|---|---|
| id | VARCHAR(36) | UUID primary key |
| title | VARCHAR(255) | Required |
| author | VARCHAR(255) | Required |
| isbn | VARCHAR(20) | Unique |
| category | VARCHAR(100) | e.g. Novel, Programming |
| publisher | VARCHAR(255) | Optional |
| publication_year | INTEGER | Optional |
| total_copies | INTEGER | Total physical copies |
| available_copies | INTEGER | Currently available to borrow |
| cover_image_url | TEXT | Optional URL |
| created_at | TIMESTAMPTZ | Auto-set |
| updated_at | TIMESTAMPTZ | Auto-updated |

### Table Creation

Tables are created automatically on backend startup via `seed.py`:

```python
Base.metadata.create_all(bind=engine)
```

No Alembic migration is needed for a fresh deployment — the seed script is idempotent.

---

## Deployment

### Docker Compose (Recommended)

All three services are orchestrated via `docker-compose.yml`:

| Service | Image | Port | Description |
|---|---|---|---|
| `db` | `postgres:16-alpine` | 5432 | PostgreSQL database |
| `backend` | Python 3.11-slim (custom) | 8000 | FastAPI REST API |
| `frontend` | Nginx Alpine (custom) | 3000 | React SPA + reverse proxy |

The frontend Nginx config proxies `/api/*` requests to the backend, so the browser only ever talks to one origin (port 3000 in production).

### Environment Variables

Copy `backend/.env.example` to `backend/.env` and set:

```env
DATABASE_URL=postgresql://library_user:library_pass@db:5432/library_db
JWT_SECRET=<strong-random-secret-min-32-chars>
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=30
FIRST_ADMIN_EMAIL=admin@library.com
FIRST_ADMIN_PASSWORD=Admin@123
FIRST_ADMIN_NAME=Administrator
```

> **Important:** Change `JWT_SECRET`, `FIRST_ADMIN_EMAIL`, and `FIRST_ADMIN_PASSWORD` before deploying to production.

---

## How to Run

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (with WSL2 backend on Windows)
- Git

### 1. Clone the repository

```bash
git clone <repository-url>
cd online-library-management
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
# Edit backend/.env to set JWT_SECRET and admin credentials
```

### 3. Start all services

```bash
docker compose up --build
```

- Frontend (Nginx): http://localhost:3000
- Backend API: http://localhost:8000
- API docs (Swagger): http://localhost:8000/docs
- Health check: http://localhost:8000/health

### 4. Stop services

```bash
docker compose down
```

To also remove the database volume (clears all data):

```bash
docker compose down -v
```

---

### Running for Development (Hot Reload)

#### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
python seed.py                # creates tables and admin
uvicorn app.main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend
npm install
npm run dev                   # dev server on http://localhost:3001
```

The Vite dev proxy forwards `/api/*` → `http://localhost:8000`, so no CORS issues during development.

---

## Default Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@library.com` | `Admin@123` |
| Guest | — | Click "Continue as Guest" on login page |

> Change these credentials before any production deployment.
