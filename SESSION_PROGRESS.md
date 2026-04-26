# Online Library Management — Session Progress

## Date: April 20, 2026

---

## Project Location
`c:\Users\JanpreetSinghJolly\gitlab_epam\online-library-management`

---

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | Python 3.11 + FastAPI + SQLAlchemy (sync) + passlib + python-jose |
| Database | PostgreSQL (local via Docker Compose) |
| Cloud DB | Neon (free tier) — needed only for cloud deployment |
| Cloud Hosting | Render (backend) + Vercel (frontend) — NOT YET DONE |

---

## What Is Done ✅

### Git
- `git init` done in project root

### Frontend (`frontend/`)
- Vite + React + TypeScript scaffold
- Tailwind CSS + PostCSS configured
- `vite.config.ts`, `tsconfig.json`, `postcss.config.js`, `tailwind.config.js`
- `src/vite-env.d.ts` — Vite env types
- `src/index.css` — Tailwind directives
- `src/types/user.ts` — TypeScript types
- `src/services/api.ts` — Axios instance with JWT interceptor
- `src/services/authService.ts` — login, guestLogin, register, getProfile, updateProfile
- `src/contexts/AuthContext.tsx` — JWT decode, login/logout, hasRole
- `src/components/PrivateRoute.tsx` — Route guard + role enforcement
- `src/pages/LoginPage.tsx` — FR-1.2: email + password login
- `src/pages/GuestLoginPage.tsx` — FR-1.6: name-only guest login
- `src/pages/RegisterPage.tsx` — FR-1.1: Admin creates librarian/member
- `src/pages/DashboardPage.tsx` — Role-aware welcome + quick actions
- `src/App.tsx` — React Router v6 routes
- `src/main.tsx` — React root
- `frontend/Dockerfile` — Multi-stage build (node → nginx)
- `frontend/nginx.conf` — SPA fallback to index.html
- **Build verified**: `npm run build` succeeds ✅
- **Dev server**: runs on `http://localhost:3000` ✅

### Backend (`backend/`)
- `requirements.txt` — all dependencies pinned
- `.env` — local dev config
- `.env.example` — template
- `app/__init__.py`
- `app/config.py` — Pydantic Settings (reads .env)
- `app/database.py` — SQLAlchemy engine + `get_db` dependency
- `app/models/__init__.py`
- `app/models/user.py` — `User` ORM model + `UserRole` enum
- `app/schemas/__init__.py`
- `app/schemas/user.py` — Pydantic request/response schemas
- `app/auth/__init__.py`
- `app/auth/jwt.py` — `create_access_token`, `decode_token` (HS256)
- `app/auth/passwords.py` — bcrypt hash/verify
- `app/auth/dependencies.py` — `get_current_user`, `require_roles`
- `app/routers/__init__.py`
- `app/routers/auth.py` — `POST /api/auth/login`, `/guest-login`, `/register`
- `app/routers/users.py` — `GET/PUT /api/users/me`
- `app/main.py` — FastAPI app + CORS + router registration
- `seed.py` — creates `admin@library.com` / `Admin@123`
- `Dockerfile` — Python 3.11-slim image
- **Virtual env**: `backend/.venv/` — all packages installed ✅
- **Import check**: `from app.main import app` works ✅
- **Server starts**: `http://localhost:8000` responds ✅
- **Health endpoint**: `GET /health` returns `{"status":"ok"}` ✅
- **Swagger UI**: `http://localhost:8000/docs` ✅

### Docker
- `docker-compose.yml` — postgres:16 + backend + frontend services
- **Docker Desktop installed + WSL2 enabled** ✅
- **`docker compose up --build` runs cleanly** ✅
- bcrypt pinned to `4.0.1` in requirements.txt (passlib compatibility fix)

### ProfilePage (FR-1.3)
- `frontend/src/pages/ProfilePage.tsx` ✅
  - Loads current profile from `GET /api/users/me`
  - Pre-fills name, phone, address
  - Email shown as read-only
  - Saves via `PUT /api/users/me`
  - Wired in `App.tsx` at `/profile` route (non-guest only)

---

## What Is Pending ⏳

### Immediate (after Docker install + PC restart)
1. Verify Docker is installed:
   ```powershell
   docker --version
   docker-compose --version
   ```
2. Start the full stack:
   ```powershell
   cd "c:\Users\JanpreetSinghJolly\gitlab_epam\online-library-management"
   docker-compose up --build
   ```
3. Seed runs automatically inside Docker on first start
4. Test login at `http://localhost:3000` with `admin@library.com` / `Admin@123`
5. Test guest login with any name

### Iteration 2 — Profile Update (FR-1.3)
- Backend: `GET /api/users/me` + `PUT /api/users/me` already done ✅
- Frontend: `ProfilePage.tsx` — NOT YET BUILT
  - Pre-filled form: name, phone, address
  - Currently shows "Profile — coming soon" placeholder in `App.tsx`

### Iteration 3 — Add Books + Edit Books (FR-2.1, FR-2.2)
- Backend: `Book` model, `POST /api/books`, `PUT /api/books/{id}`, `GET /api/books` — NOT YET BUILT
- Frontend: `BooksPage.tsx`, `BookForm.tsx`, `EditBookPage.tsx` — NOT YET BUILT

---

## API Endpoints Reference
| Method | Path | Auth Required | FR |
|--------|------|---------------|----|
| GET | `/health` | None | — |
| POST | `/api/auth/login` | None | FR-1.2 |
| POST | `/api/auth/guest-login` | None | FR-1.6 |
| POST | `/api/auth/register` | Admin JWT | FR-1.1 |
| GET | `/api/users/me` | Any JWT | FR-1.3 |
| PUT | `/api/users/me` | Any JWT (non-guest advised) | FR-1.3 |

---

## Default Credentials (after seed)
| Field | Value |
|-------|-------|
| Email | `admin@library.com` |
| Password | `Admin@123` |
| Role | `admin` |

---

## Frontend Routes
| URL | Page | Access |
|-----|------|--------|
| `/login` | LoginPage | Public |
| `/guest` | GuestLoginPage | Public |
| `/dashboard` | DashboardPage | Authenticated |
| `/register` | RegisterPage | Admin only |
| `/profile` | "Coming soon" placeholder | Non-guest |
| `/books` | "Coming soon" placeholder | All authenticated |

---

## How to Resume After Restart

### Start Backend (without Docker, for quick testing)
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
cd "c:\Users\JanpreetSinghJolly\gitlab_epam\online-library-management\backend"
.\.venv\Scripts\Activate.ps1
# Update .env with real DATABASE_URL first, then:
python seed.py
.\.venv\Scripts\uvicorn.exe app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Start Frontend (dev)
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
cd "c:\Users\JanpreetSinghJolly\gitlab_epam\online-library-management\frontend"
npm run dev
```

### Start Full Stack (with Docker — preferred)
```powershell
cd "c:\Users\JanpreetSinghJolly\gitlab_epam\online-library-management"
docker-compose up --build
```

---

## Next Conversation Prompt (copy-paste after restart)
> "I'm resuming the Online Library Management System project. Docker is now installed. Please check the SESSION_PROGRESS.md file in the project root to catch up on what's been done, then continue with: (1) run docker-compose up to verify full stack, (2) implement ProfilePage for FR-1.3."
