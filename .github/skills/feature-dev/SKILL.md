---
name: feature-dev
description: 'Implement a missing feature requirement in the Online Library Management application following existing architecture patterns. Use when developing a feature, implementing a requirement, writing backend routes, creating frontend pages, or adding unit tests. Triggers on: implement, develop, feature, requirement, missing, backend, frontend, FastAPI, React.'
argument-hint: 'Requirement ID and description to implement (e.g., REQ-003: Book search by ISBN)'
---

# Skill: Feature Development

## When to Use
- Implementing a requirement that has been approved by the user
- Adding a new API endpoint and/or frontend page
- Writing unit tests for new code

## Pre-conditions (MUST be met before writing any code)
1. User has explicitly confirmed which requirement to implement (provided REQ-ID)
2. Gap analysis has been completed and the requirement is confirmed as missing
3. A Jira User Story exists for this requirement
4. Design (architecture overview + API contract) has been reviewed and approved by the human

## Procedure

### 1. Analyse
- Read the requirement and its acceptance criteria
- Search the codebase for related files (`backend/app/routers/`, `frontend/src/pages/`, etc.)
- Identify all files that need to change

### 2. Plan (show to user before coding)
List exact files to create/modify, e.g.:
```
BACKEND
  CREATE: backend/app/routers/reservations.py
  MODIFY: backend/app/main.py  (include_router)
  CREATE: backend/app/schemas/reservation.py
  CREATE: backend/app/models/reservation.py

FRONTEND
  CREATE: frontend/src/pages/ReservationsPage.tsx
  MODIFY: frontend/src/App.tsx  (add route)
  CREATE: frontend/src/services/reservationService.ts
  CREATE: frontend/src/types/reservation.ts
```

### 3. Implement — Backend First
- Follow existing router patterns in `backend/app/routers/`
- Use Pydantic v2 schemas in `backend/app/schemas/`
- SQLAlchemy models in `backend/app/models/`
- All protected routes require JWT via `get_current_user` dependency
- Never hardcode credentials — use `backend/app/config.py`

### 4. Implement — Frontend
- Functional components + React hooks only
- Tailwind classes only — no inline styles
- Zod + react-hook-form for all forms
- Call backend via `frontend/src/services/api.ts` patterns

### 5. Write Unit Tests
- Backend: pytest tests in `backend/tests/` (follow existing patterns)
- Frontend: Only if a testing framework is already configured

### 6. Verify No Regression
- Check that existing routes in `App.tsx` and existing routers still load

### 7. Display Git Diff
- Run `git diff` and display the full output
- Do NOT run `git add` or `git commit` — the human will commit when ready
- Confirm role-based access is preserved

## Reference Files
- [Architecture context](../../instructions/architecture.instructions.md)
