# Online Library Management — Copilot Instructions

## Project Stack
- **Backend**: Python FastAPI + SQLAlchemy + PostgreSQL (port 8000)
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS (port 3000)
- **Auth**: JWT (python-jose), role-based (admin / librarian / member / guest)
- **Tests**: Playwright E2E (`tests/e2e/`), config at `playwright.config.ts`
- **Containers**: Docker Compose (`docker-compose.yml`)

## Code Style
- Python: follow existing FastAPI patterns in `backend/app/routers/`
- TypeScript: functional components, React hooks, no class components
- Tailwind classes only — no inline styles, no CSS modules
- Zod schemas for all form validation (`@hookform/resolvers/zod`)

## Architecture
- Backend routers → `backend/app/routers/` (auth, users, books)
- Backend schemas → `backend/app/schemas/` (Pydantic v2)
- Frontend services → `frontend/src/services/` (api.ts, authService.ts, bookService.ts)
- Frontend pages → `frontend/src/pages/`
- Frontend types → `frontend/src/types/`

## SDLC Workflow (enforced)
1. **Requirements**: always fetched from Confluence via the `confluence-reader` agent
2. **Gap analysis**: compare requirements with codebase before any feature work
3. **Test cases**: create Jira test cases for every missing requirement before coding
4. **User consent**: always ask the user which requirement to implement next — never auto-select
5. **Feature dev**: implement one requirement at a time, with unit test(s)
6. **E2E automation**: after every feature, write Playwright spec in `tests/e2e/`, run `npx playwright test`, generate HTML report

## Integrations
- Confluence: source of truth for requirements (use `confluence/*` MCP tools)
- Jira: test case management (use `jira/*` MCP tools)
- Playwright MCP: browser automation for live app inspection (use `playwright/*` tools)

## Security
- Never hardcode credentials or secrets — use environment variables
- Validate all inputs at API boundary with Pydantic schemas
- All protected routes require valid JWT in `Authorization: Bearer <token>`

## Testing
- Playwright tests live in `tests/e2e/`
- Run: `npx playwright test`
- Report: `npx playwright show-report` (outputs to `playwright-report/`)
- App must be running before tests execute (docker-compose up OR manual start)
