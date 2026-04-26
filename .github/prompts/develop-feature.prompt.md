---
description: 'Implement a user-selected missing requirement in the Online Library Management application, write unit tests, then create and run Playwright E2E automation. Use when developing a feature after user consent is given.'
name: develop-feature
agent: agent
tools: [read, edit, search, execute, playwright/*]
---

# Develop Feature for Selected Requirement

You are performing Steps 4–7 of the SDLC workflow: implement one requirement, then automate tests.

## Step 1: User Consent (MANDATORY — do not skip)

Ask the user:
> "The following requirements are missing. Which one should I implement next?
> [list each missing REQ-ID and title]
> Please reply with the REQ-ID."

**Do NOT write any code until the user responds with a specific requirement ID.**

## Step 2: Implement the Feature

Apply the `feature-dev` skill for the selected requirement:
1. Analyse the requirement and acceptance criteria
2. Show the implementation plan (list of files to create/modify) — wait for user confirmation
3. Implement backend (FastAPI router, Pydantic schema, SQLAlchemy model if needed)
4. Implement frontend (React page, service, types, route registration)
5. Write unit/integration tests

## Step 3: Validate

Run the backend (if possible) or provide explicit validation instructions:
```bash
cd backend && python -m pytest tests/ -v
```

## Step 4: Playwright E2E Automation

Apply the `playwright-automation` skill:
1. Use Playwright MCP to inspect the live app for this feature's UI
2. Write a `tests/e2e/<feature-name>.spec.ts` spec file
3. Execute tests:
```bash
npx playwright test tests/e2e/<feature-name>.spec.ts
```
4. Generate HTML report:
```bash
npx playwright show-report
```
5. Report pass/fail count and open the HTML report

## Step 5: Completion Summary

Output:
- Requirement ID implemented
- Files created/modified
- Jira test cases covered
- Playwright test results (N passed, M failed)
- Path to HTML report: `playwright-report/index.html`
