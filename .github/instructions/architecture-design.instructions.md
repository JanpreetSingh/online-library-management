---
description: 'Architecture and tech stack reference for the Online Library Management project. Loaded on-demand when implementing features, writing code, or making architecture decisions.'
applyTo: "backend/**/*.py,frontend/src/**/*.{ts,tsx}"
---

# Architecture: Online Library Management

## Backend
- **Framework**: Python FastAPI 0.115
- **ORM**: SQLAlchemy 2.0 (async-compatible)
- **Database**: PostgreSQL (via psycopg2-binary)
- **Validation**: Pydantic v2 schemas
- **Auth**: JWT via python-jose, bcrypt password hashing via passlib
- **Port**: 8000

### Key Backend Files
- `backend/app/main.py` — FastAPI app entry, router registration, CORS
- `backend/app/routers/` — One file per domain (auth.py, books.py, users.py, borrow.py)
- `backend/app/schemas/` — Pydantic v2 request/response models (incl. borrow_transaction.py)
- `backend/app/models/` — SQLAlchemy ORM models (incl. borrow_transaction.py)
- `backend/app/auth/` — JWT helpers, password hashing, route dependencies
- `backend/app/config.py` — Settings via pydantic-settings (reads .env)
- `backend/app/database.py` — DB session factory
- `backend/tests/test_borrow.py` — Reference test patterns for borrow endpoint

### Backend Conventions
- Protect routes with `Depends(get_current_user)` from `backend/app/auth/dependencies.py`
- Role enforcement: `current_user.role != UserRole.member` for member-only endpoints (never `== UserRole.guest` alone — blocks guest but not admin/librarian)
- Auth split: **401** = missing/invalid JWT (`HTTPBearer(auto_error=False)`); **403** = valid JWT with wrong role (in router)
- All responses use Pydantic schemas — never return raw ORM objects
- Errors: raise `HTTPException` with appropriate status codes
- UUID path params: use `uuid.UUID` type (FastAPI returns 422 on malformed input instead of a 500)
- Inventory mutations: use `select(...).with_for_update()` + comment documenting the PostgreSQL READ COMMITTED + SELECT FOR UPDATE isolation strategy
- DB constraints: add `CheckConstraint` in `__table_args__` for non-negativity invariants (e.g., `available_copies >= 0`)

## Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS only — no inline styles, no CSS modules
- **Forms**: react-hook-form + Zod + @hookform/resolvers
- **Routing**: react-router-dom v6
- **HTTP**: axios (via `frontend/src/services/api.ts`)
- **Auth state**: React Context (`frontend/src/contexts/AuthContext.tsx`)
- **Alerts**: react-hot-toast
- **Port**: 3000

### Key Frontend Files
- `frontend/src/App.tsx` — Route definitions
- `frontend/src/pages/` — One file per page
- `frontend/src/services/api.ts` — Axios instance (base URL, auth header injection)
- `frontend/src/services/bookService.ts` — Example service pattern
- `frontend/src/types/` — TypeScript interfaces matching backend schemas
- `frontend/src/components/PrivateRoute.tsx` — Role-based route guard

### Frontend Conventions
- Functional components + hooks only — no class components
- Import order: React → third-party → local
- Protected routes: wrap in `<PrivateRoute allowedRoles={[...]}>` in App.tsx
- API calls: always use services layer, never call axios directly from pages

## Implementation Planning
- Active task list: `implementation-plan.md` at project root
- Task format: `TASK-N` IDs with priority (P1/P2/P3), status (`ready` / `not-started` / `blocked` / `done ✓`), file list, AC coverage, and open items from design-review
- Always check `implementation-plan.md` before coding to confirm task status and dependencies
- After implementing a task, update its status field in `implementation-plan.md` to `done ✓`

## Infrastructure
- **Containers**: Docker Compose (`docker-compose.yml`)
- **Frontend container**: nginx serving Vite build on port 3000
- **Backend container**: uvicorn on port 8000
