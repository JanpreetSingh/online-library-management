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
- `backend/app/routers/` — One file per domain (auth.py, books.py, users.py)
- `backend/app/schemas/` — Pydantic v2 request/response models
- `backend/app/models/` — SQLAlchemy ORM models
- `backend/app/auth/` — JWT helpers, password hashing, route dependencies
- `backend/app/config.py` — Settings via pydantic-settings (reads .env)
- `backend/app/database.py` — DB session factory

### Backend Conventions
- Protect routes with `Depends(get_current_user)` from `backend/app/auth/dependencies.py`
- Role checks: `Depends(require_role(['admin', 'librarian']))`
- All responses use Pydantic schemas — never return raw ORM objects
- Errors: raise `HTTPException` with appropriate status codes

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

## Infrastructure
- **Containers**: Docker Compose (`docker-compose.yml`)
- **Frontend container**: nginx serving Vite build on port 3000
- **Backend container**: uvicorn on port 8000
