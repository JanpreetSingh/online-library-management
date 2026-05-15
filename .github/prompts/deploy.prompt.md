---
description: 'Build and deploy the application locally using Docker Compose and verify all services are healthy. Use after testing is approved, before documentation is updated. Step 9 of the SDLC workflow.'
name: deploy
agent: agent
tools: [execute]
---

# Deployment: Local Docker Compose

You are performing Step 9 of the SDLC workflow: build and start the application locally and confirm all services are healthy.

## Pre-conditions
- Playwright E2E tests (Step 8) have been approved by the human
- Docker Desktop is running

## Steps

1. Build and start all containers:
   ```bash
   docker-compose up --build -d
   ```

2. Verify containers are running:
   ```bash
   docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
   ```
   All expected containers must show status `Up`.

3. Health check — Backend:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health
   ```
   Expect: `200`

4. Health check — Frontend:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
   ```
   Expect: `200`

5. Report deployment status table:

| Service | Container Status | Health Check | URL |
|---------|-----------------|--------------|-----|
| Backend (FastAPI) | ✅ Up | ✅ 200 | http://localhost:8000 |
| Frontend (React) | ✅ Up | ✅ 200 | http://localhost:3000 |
| Database (PostgreSQL) | ✅ Up | — | — |

## Output

**Success:**
```
Deployment complete. All services healthy.

Awaiting human confirmation before documentation is updated.
```

**Failure:**
```
Deployment issue detected.
<service>: <error details>

Check logs with:  docker-compose logs <service>

Awaiting human decision before proceeding.
```
