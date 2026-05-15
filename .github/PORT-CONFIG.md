# Application Port Configuration

This document defines the port configuration for the Online Library Management system to ensure consistency across agents, tests, and documentation.

## Port Mapping

### Docker Compose Deployment (Production-like)
Defined in `docker-compose.yml`:

| Service  | Host Port | Container Port | Access URL |
|----------|-----------|----------------|------------|
| Frontend | 3000      | 80 (nginx)     | http://localhost:3000 |
| Backend  | 8000      | 8000           | http://localhost:8000 |
| Database | 5432      | 5432           | postgresql://localhost:5432/library_db |

### Local Development (without Docker)
- **Frontend** (Vite dev server): Port 3000 (configurable in `frontend/vite.config.ts`)
  - Note: `strictPort: false` means Vite will use next available port if 3000 is taken
- **Backend** (Uvicorn): Port 8000 (default FastAPI convention)
- **Database**: Port 5432 (local PostgreSQL)

## Health Check Endpoints

### Backend
- **Health**: `http://localhost:8000/health` (if implemented)
- **API Docs**: `http://localhost:8000/docs` (Swagger/OpenAPI)
- **Alternative**: `http://localhost:8000/api/docs` or `http://localhost:8000/openapi.json`

### Frontend
- **Root**: `http://localhost:3000/`
- Any valid route (e.g., `/login`, `/books`)

## Usage in Agents

### Playwright Runner Agent
Should check these URLs before running tests:
```bash
# Backend health check
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/docs

# Frontend health check
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

### Deployment Assistant Agent
Should verify these endpoints after deployment:
```bash
docker-compose ps  # Check all services are running
curl http://localhost:8000/docs  # Backend API docs
curl http://localhost:3000  # Frontend homepage
```

## Environment Variables Override

Agents should support these environment variables for flexibility:
- `FRONTEND_URL`: Override frontend URL (default: `http://localhost:3000`)
- `BACKEND_URL`: Override backend URL (default: `http://localhost:8000`)
- `DATABASE_URL`: Override database connection string

## Configuration Sources (Priority Order)

1. **Environment variables** (highest priority)
2. **docker-compose.yml** (Docker deployment)
3. **vite.config.ts** (frontend dev server)
4. **backend/.env** (backend configuration)
5. **Default conventions** (3000 for frontend, 8000 for backend)

## Verification Commands

### Check if services are running
```bash
# Backend
curl -I http://localhost:8000/docs

# Frontend
curl -I http://localhost:3000

# Database
pg_isready -h localhost -p 5432 -U library_user -d library_db
```

### Check Docker containers
```bash
docker-compose ps
docker-compose logs backend
docker-compose logs frontend
```

## Notes for Developers

1. **Port conflicts**: If port 3000 or 8000 is already in use, either:
   - Stop the conflicting process
   - Modify `docker-compose.yml` to use different host ports
   - Update this document and all agents accordingly

2. **Vite strictPort**: Currently set to `false`, allowing automatic port switching. Set to `true` for strict port 3000 enforcement.

3. **CORS**: When running locally without Docker, Vite proxy handles CORS. With Docker, backend must allow CORS from frontend origin.

## Last Updated
2026-05-11 - Initial documentation based on docker-compose.yml and vite.config.ts analysis
