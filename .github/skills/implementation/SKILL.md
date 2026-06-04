---
name: implementation
description: 'Implement all tasks from implementation-plan.md in the Online Library Management application, following the architecture patterns and acceptance criteria. Use when developing a feature, implementing a task, writing FastAPI endpoints, creating React pages, or adding unit tests. Triggers on: implement, develop, feature, task, TASK-N, backend, frontend, FastAPI, React.'
argument-hint: 'Optional TASK-N identifier to resume from if a previous run was interrupted (e.g., TASK-5). If omitted, tasks are executed in the order they appear in implementation-plan.md.'
---

# Skill: Implementation

## When to Use
- Implementing a single TASK-N from an approved `implementation-plan.md`
- Adding a new API endpoint and/or frontend page
- Fixing a specific file as described in a task

## Pre-conditions (MUST be met before writing any code)
1. `implementation-plan.md` exists at the project root and has been approved by the human
2. `design-review.md` gate shows **✅ Approved** (no unresolved 🔴 errors)
3. At least one task has status `ready` or `not-started` — never implement a `blocked` task

## Procedure

> **This procedure is a loop.** After completing Step 8 for one task, return to Step 1 and pick the next incomplete task. Continue until all tasks are `done ✓` or execution is halted by a blocked dependency. The order of execution is always the document order in `implementation-plan.md` — that order already encodes the Critical Path → Parallel Tracks → remaining tasks dependency sequence.

### 1. Select Next Task
- Read `implementation-plan.md` and collect all tasks in **document order** (top to bottom, as written in the Task Breakdown section) — do not re-sort by priority label
- If a `resume_from` argument was provided, skip all tasks that appear before that ID in document order
- Pick the **first task in document order** whose status is `ready` or `not-started`
- Before proceeding, verify that every task listed in its **Depends on** field is marked `done ✓`; if not, skip this task and try the next one in document order
- If no eligible task is found (all remaining are `blocked` or all dependencies unmet), stop and report which tasks are blocking progress
- If all tasks are `done ✓`, stop the implementation loop and proceed directly to **Step 9 — Write Unit Tests**.
- Announce: "Implementing **TASK-N: \<title\>** (Priority: PN, position M of N in plan). Proceeding."

### 2. Read Task Context
From the selected task entry in `implementation-plan.md`, extract:
- **Files** — exact list of files to create / modify
- **AC coverage** — which acceptance criteria this task must satisfy
- **Open items from design-review** — any warnings or info items to address during implementation
- **Depends on** — confirm all dependency tasks are marked `done ✓` before proceeding

Read the relevant sections of `ARCHITECTURE.md` for the technical specification (API contract, data flow, DB schema).
Read `REQUIREMENTS.md` acceptance criteria for the ACs listed in the task.

### 3. Show Implementation Plan (before writing code)

Display the exact files to be created / modified:
```
TASK-N: <title>
─────────────────────────────────────────
BACKEND
  CREATE: backend/app/routers/X.py
  MODIFY: backend/app/main.py         ← include_router(X.router)
  CREATE: backend/app/schemas/X.py
  CREATE: backend/app/models/X.py

FRONTEND
  CREATE: frontend/src/pages/X.tsx
  MODIFY: frontend/src/App.tsx        ← add route
  CREATE: frontend/src/services/XService.ts
  CREATE: frontend/src/types/x.ts

TESTS
  CREATE: backend/tests/test_X.py
```

Do not write any code until this plan is displayed. Continue immediately — do not wait for the user to respond.

### 4. Implement — Backend
Follow the existing patterns in the project:

- **Routers**: follow `backend/app/routers/books.py` — `APIRouter`, `Depends(get_current_user)`, `HTTPException` with typed status codes
- **Role enforcement**: use `current_user.role != UserRole.member` pattern where member-only access is required (not `== UserRole.guest` — see design-review finding #1)
- **Schemas**: Pydantic v2 (`model_config = ConfigDict(from_attributes=True)`) in `backend/app/schemas/`
- **Models**: SQLAlchemy 2.0 `Mapped` / `mapped_column` syntax in `backend/app/models/`; add `CheckConstraint` for non-negativity invariants where required
- **Router registration**: add `app.include_router(...)` in `backend/app/main.py`
- **Config/secrets**: read from `backend/app/config.py` — never hardcode credentials
- **Path params**: use `uuid.UUID` type for UUID path parameters (produces clean 422 instead of 500 on malformed input)
- **Concurrency**: use `select(...).with_for_update()` for inventory mutations; comment the isolation strategy
- **Auth split**: 401 = missing/invalid JWT (`HTTPBearer(auto_error=False)` in `dependencies.py`); 403 = valid JWT with wrong role (in router); add inline comments to make this explicit
- **Open items**: address any design-review warnings noted in the task's "Open items" field

### 5. Implement — Frontend
- **Components**: functional components + hooks only — no class components
- **Styling**: Tailwind classes only — no inline styles, no CSS modules
- **Forms**: react-hook-form + Zod + `@hookform/resolvers/zod` for all form fields
- **HTTP**: call backend via the existing `frontend/src/services/api.ts` axios instance — never call axios directly from pages
- **Auth state**: read from `frontend/src/contexts/AuthContext.tsx`
- **Alerts**: use `react-hot-toast` for success/error feedback
- **Route guard**: wrap protected routes in `<PrivateRoute allowedRoles={[...]}>` in `frontend/src/App.tsx`
- **Types**: create matching TypeScript interfaces in `frontend/src/types/` for every backend response schema

### 6. (Skipped in per-task loop)
Unit tests are written once for all tasks after the full implementation loop completes. See **Step 9**.

### 7. Verify No Regression
- Confirm existing routes in `backend/app/main.py` still have their `include_router` calls
- Confirm existing routes in `frontend/src/App.tsx` are intact
- Confirm no import paths were broken in modified files

### 8. Display Git Diff, Update Plan, and Loop
- Run `git diff` (and `git diff --cached` if any files were staged) and display the **full** output — do not truncate
- Do NOT run `git add` or `git commit`
- Wait for human approval of the diff
- On approval: update the task's `**Status**` field in `implementation-plan.md` from `not-started` / `ready` to `done ✓`
- **Return to Step 1** — select the next incomplete task and repeat the full procedure; when Step 1 finds all tasks `done ✓`, proceed to Step 9
- On rejection: apply requested changes, re-run `git diff`, re-present for approval before updating status

### 9. Write Unit Tests (post-implementation)
This step runs **once**, after every task in `implementation-plan.md` is `done ✓`.

- Collect every unique **AC coverage** field across all tasks in `implementation-plan.md`
- For each backend router touched during implementation, create or update one test file in `backend/tests/` following the naming convention `test_<router>.py`
- Each test file must cover:
  - Happy-path for every acceptance criterion
  - All documented error cases (401 no token, 403 wrong role, 404 not found, 409 conflict, 422 malformed input, etc.)
- Follow existing patterns in `backend/tests/test_borrow.py`
- Frontend: only if a testing framework is already configured — do not install new test tooling
- Run tests and confirm all pass:
  ```bash
  cd backend && python -m pytest tests/ -v
  ```
- Display `git diff` for the test files and wait for human approval
- On approval, report:
  ```
  All tasks done ✓. Unit tests written and passing.
  Ready for SDLC Step 7 — Code Review.
  ```

## Output Format

```
TASK-N implementation complete.

Files created:  N
Files modified: N

─── AC Coverage ───
AC-1: ✓ covered by <file>
AC-2: ✓ covered by <file>
...

─── Open Items Addressed ───
Finding #N: <what was done>
...

--- git diff ---
<full diff output>
```

## Reference Files
- [Architecture conventions](../../instructions/architecture-design.instructions.md)
