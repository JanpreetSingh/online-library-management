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
3. **User stories**: create Jira User Stories for every missing requirement before coding
4. **User consent**: always ask the user which user story to work on next — never auto-select
5. **Design**: produce architecture overview + API contract in Confluence; await human approval
6. **Feature dev**: implement one requirement at a time, with unit test(s); display git diff; do not commit
7. **Code review**: analyse git diff for security, correctness, and pattern compliance; await human approval
8. **E2E automation**: write Playwright spec in `tests/e2e/` from acceptance criteria, run `npx playwright test`, generate HTML report
9. **Deployment**: deploy locally via `docker-compose up --build -d`; verify health checks
10. **Documentation**: update application docs in Confluence after deployment

## Integrations
- Confluence: source of truth for requirements and design documents (use `confluence/*` MCP tools)
- Jira: user story management (use `jira/*` MCP tools)
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
