# GitHub Copilot Guide — Online Library Management

This guide explains how GitHub Copilot is configured in this project, what it can do, and how to drive the full SDLC workflow using natural language prompts.

---

## Table of Contents

- [What Copilot Can Do](#what-copilot-can-do)
- [SDLC Workflow Overview](#sdlc-workflow-overview)
- [Step-by-Step Workflow](#step-by-step-workflow)
  - [Step 1 — Fetch Requirements from Confluence](#step-1--fetch-requirements-from-confluence)
  - [Step 2 — Run Gap Analysis](#step-2--run-gap-analysis)
  - [Step 3 — Create Jira Test Cases](#step-3--create-jira-test-cases)
  - [Step 4 — Implement a Feature](#step-4--implement-a-feature)
  - [Step 5 — Run Playwright E2E Tests](#step-5--run-playwright-e2e-tests)
- [Available Agents](#available-agents)
- [Available Skills](#available-skills)
- [Example Prompts](#example-prompts)
- [Project Architecture Quick Reference](#project-architecture-quick-reference)
- [Role-Based Access Reference](#role-based-access-reference)
- [Implemented Features](#implemented-features)
- [Not Yet Implemented](#not-yet-implemented)
- [Security Rules Copilot Enforces](#security-rules-copilot-enforces)

---

## What Copilot Can Do

Copilot in this project is wired up with:

| Capability | Tool / Integration |
|---|---|
| Read requirements from Confluence | `confluence/*` MCP tools |
| Analyse gaps between requirements and code | `gap-analyzer` agent |
| Create structured test cases in Jira | `jira/*` MCP tools |
| Implement backend FastAPI features | `feature-developer` agent |
| Implement frontend React features | `feature-developer` agent |
| Write & run Playwright E2E tests | `playwright-runner` agent |
| Run the full SDLC pipeline end-to-end | `sdlc-orchestrator` agent |

---

## SDLC Workflow Overview

```
Confluence (requirements)
        │
        ▼
  Gap Analysis (what is missing?)
        │
        ▼
  Jira Test Cases (Given/When/Then)
        │
        ▼
  User Picks Requirement to Implement
        │
        ▼
  Feature Development (backend → frontend → unit tests)
        │
        ▼
  Playwright E2E Automation → HTML Report
```

Copilot **never auto-selects** which feature to build next — it always presents the gap analysis and waits for your approval.

---

## Step-by-Step Workflow

### Step 1 — Fetch Requirements from Confluence

Ask Copilot to retrieve and structure the project requirements:

```
Fetch the requirements from Confluence and list them.
```

Copilot will:
1. Connect to Confluence using MCP tools
2. Parse every requirement block (headings, acceptance criteria, priority)
3. Return a structured list in `REQ-NNN` format

> **Tip:** You can also provide the Confluence page URL directly:  
> `Fetch requirements from https://your-confluence/page/12345`

---

### Step 2 — Run Gap Analysis

Ask Copilot to compare requirements against the current codebase:

```
Run a gap analysis against the current codebase.
```

Copilot will:
1. Load the structured requirements from Step 1
2. Search the codebase (`backend/`, `frontend/src/`) for evidence of each requirement
3. Classify each requirement as **Implemented**, **Partial**, or **Missing**
4. Present a summary table

---

### Step 3 — Create Jira Test Cases

After gap analysis, ask Copilot to create test cases for missing requirements:

```
Create Jira test cases for the missing requirements.
```

Copilot will:
1. Write **Given / When / Then** scenarios for each acceptance criterion
2. Apply naming convention `TC-NNN: <Role> <action> <subject>`
3. Add labels: `automation`, `regression`, `<REQ-ID>`
4. Upload each test case to Jira via MCP tools

---

### Step 4 — Implement a Feature

Tell Copilot which requirement to implement (always your choice):

```
Implement FR-3.1 — Borrow a Book.
```

Copilot will:
1. Read the requirement and acceptance criteria
2. Show a **plan** (files to create/modify) — you can approve or adjust
3. Implement the **backend** first (FastAPI router, Pydantic schema, SQLAlchemy model)
4. Implement the **frontend** (React page, service layer, route registration)
5. Write unit tests

#### What Copilot always does during implementation:
- Follows existing router patterns in `backend/app/routers/`
- Uses Pydantic v2 schemas — never raw ORM objects in responses
- Uses `get_current_user` / `require_role` dependencies for protected routes
- Uses Tailwind CSS only (no inline styles)
- Uses `react-hook-form` + Zod for all forms
- Reads environment variables from `backend/app/config.py` — never hardcodes secrets

---

### Step 5 — Run Playwright E2E Tests

After a feature is implemented, ask Copilot to write and run E2E tests:

```
Write and run Playwright E2E tests for the borrow book feature.
```

Copilot will:
1. Create a spec file in `tests/e2e/`
2. Run `npx playwright test`
3. Generate and open the HTML report (`playwright-report/`)

> **Prerequisite:** The app must be running before tests execute.  
> Start it with: `docker-compose up` or run frontend/backend manually.

---

## Available Agents

These are specialist sub-agents Copilot can invoke automatically or on request:

| Agent | Purpose | When to use |
|---|---|---|
| `confluence-reader` | Fetch & structure requirements from Confluence | "Fetch requirements" |
| `gap-analyzer` | Compare requirements vs codebase | "Run gap analysis" |
| `jira-uploader` | Create & upload Jira test cases | "Create test cases" |
| `feature-developer` | Implement a single approved requirement | "Implement FR-X.X" |
| `playwright-runner` | Write specs, run tests, generate report | "Run E2E tests" |
| `sdlc-orchestrator` | Drive the entire pipeline end-to-end | "Run the full SDLC workflow" |

---

## Available Skills

Skills are domain-specific playbooks loaded automatically when relevant:

| Skill | Triggers on |
|---|---|
| `confluence-analysis` | requirements, confluence, acceptance criteria, user stories |
| `feature-dev` | implement, develop, feature, backend, frontend, FastAPI, React |
| `jira-testcase` | test case, Jira, Given/When/Then, upload |
| `playwright-automation` | playwright, e2e, automation, spec, browser test, test report |

---

## Example Prompts

### Starting the full workflow
```
Run the full SDLC workflow starting from Confluence.
```

### Fetching requirements only
```
Fetch the requirements from Confluence and show me what's missing.
```

### Implementing a specific feature
```
Implement FR-3.2 — Return a Book.
```

### Creating test cases for a specific requirement
```
Create Jira test cases for FR-4.1 — Admin View All Users.
```

### Writing E2E tests for an existing feature
```
Write Playwright E2E tests for the Login flow.
```

### Checking what's been built
```
Show me which requirements are implemented and which are missing.
```

### Inspecting the live app
```
Open the app in the browser and take a screenshot of the Books page.
```

---

## Project Architecture Quick Reference

```
online-library-management/
├── backend/app/
│   ├── routers/        ← API endpoints (auth, books, users)
│   ├── schemas/        ← Pydantic v2 request/response models
│   ├── models/         ← SQLAlchemy ORM models
│   ├── auth/           ← JWT helpers, password hashing, route guards
│   ├── config.py       ← Settings from .env (never hardcode here)
│   └── main.py         ← App entry, CORS, router registration
│
├── frontend/src/
│   ├── pages/          ← One file per page/route
│   ├── services/       ← All API calls (api.ts, bookService.ts, …)
│   ├── components/     ← Reusable UI (BookForm, PrivateRoute, …)
│   ├── contexts/       ← AuthContext (JWT state, login/logout)
│   ├── types/          ← TypeScript interfaces
│   └── App.tsx         ← Route definitions + PrivateRoute guards
│
├── tests/e2e/          ← Playwright test specs
├── docker-compose.yml  ← Orchestrates db + backend + frontend
└── playwright.config.ts
```

### Key Ports

| Service | Port |
|---|---|
| Frontend (React / Nginx) | 3000 |
| Backend (FastAPI / Uvicorn) | 8000 |
| PostgreSQL | 5432 |

---

## Role-Based Access Reference

| Role | Capabilities |
|---|---|
| **admin** | Full access: manage users, books, transactions |
| **librarian** | Add/edit books, manage borrowing |
| **member** | Browse books, borrow, view own transactions |
| **guest** | Read-only browse — no borrowing, no account required |

### Frontend Route Guards

Protected routes are wrapped in `<PrivateRoute allowedRoles={[...]}>` in `frontend/src/App.tsx`.

| Route | Allowed Roles |
|---|---|
| `/login` | Public |
| `/guest` | Public |
| `/dashboard` | admin, librarian, member, guest |
| `/register` | admin only |
| `/profile` | admin, librarian, member |
| `/books` | admin, librarian, member, guest |
| `/books/:id/edit` | admin, librarian |

---

## Implemented Features

| ID | Feature |
|---|---|
| FR-1.1 | User Registration (admin creates librarian/member accounts) |
| FR-1.2 | Login with email & password → JWT issued |
| FR-1.3 | Profile update (name, phone, address) |
| FR-1.6 | Guest login (no account — short-lived JWT, read-only) |
| FR-2.0 | View book catalogue (all roles including guest) |
| FR-2.1 | Add books (admin/librarian) |
| FR-2.2 | Edit books (admin/librarian) |

---

## Not Yet Implemented

| ID | Feature |
|---|---|
| FR-3.1 | Borrow a Book |
| FR-3.2 | Return a Book |
| FR-3.3 | View My Borrowed Books |
| FR-4.1 | Admin — View All Users |
| FR-4.2 | Admin/Librarian — View All Borrow Transactions |

> Ask Copilot to implement any of these:  
> `Implement FR-3.1 — Borrow a Book.`

---

## Security Rules Copilot Enforces

- **No hardcoded secrets** — all credentials and keys come from environment variables via `backend/app/config.py`
- **Input validation** — all API inputs validated by Pydantic v2 schemas before hitting the database
- **Protected routes** — every non-public endpoint requires a valid JWT (`Authorization: Bearer <token>`)
- **Password hashing** — bcrypt via passlib; plain-text passwords are never stored
- **Role enforcement** — `require_role([...])` dependency rejects under-privileged requests with `403 Forbidden`
- **OWASP Top 10** — Copilot flags and fixes injection, broken auth, and insecure direct object reference issues during code review

---

*For project setup and running instructions, see [README.md](README.md).*  
*For implemented requirement details, see [IMPLEMENTED_REQUIREMENTS.md](IMPLEMENTED_REQUIREMENTS.md).*
