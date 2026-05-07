---
description: 'Implement a user-selected user story in the Online Library Management application, write unit tests, display git diff for review, then run Playwright E2E automation. Covers Steps 6–8 of the SDLC workflow.'
name: develop-feature
agent: agent
tools: [read, edit, search, execute, playwright/*]
---

# Develop Feature for Selected User Story

You are performing Steps 6–8 of the SDLC workflow: implement the code, then test it. Steps 5 (Design) and 7 (Code Review) are human-gated checkpoints handled by the orchestrator.

## Pre-conditions (MUST be met before writing any code)
- User has confirmed which REQ-ID to implement
- Design (architecture overview + API contract) has been reviewed and approved by the human

---

## Step 6: Implement the Feature

Apply the `feature-dev` skill for the selected requirement:
1. Announce: "Implementing REQ-NNN: <title>. Proceeding."
2. Show the implementation plan (list of files to create/modify) — wait for user confirmation
3. Implement backend (FastAPI router, Pydantic schema, SQLAlchemy model if needed)
4. Implement frontend (React page, service, types, route registration)
5. Write pytest unit tests for every new backend endpoint
6. Verify no existing routes or imports are broken
7. Run `git diff` and display the full output

> **Do NOT run `git add` or `git commit`.** The human decides when to commit.

---

## Step 7: Code Review Gate (orchestrator-handled)

The `code-review-assistant` runs automatically after the human approves the diff. Do not proceed to testing until the orchestrator signals code review is approved.

---

## Step 8: Playwright E2E Automation

Apply the `playwright-automation` skill once code review is approved:
1. Use Playwright MCP to inspect the live app for this feature's UI
2. Map each acceptance criterion to one `test()` block
3. Write `tests/e2e/<feature-name>.spec.ts`
4. Execute tests:
```bash
npx playwright test tests/e2e/<feature-name>.spec.ts
```
5. Generate HTML report:
```bash
npx playwright show-report
```
6. Report pass/fail count and confirm `playwright-report/index.html` exists

---

## Completion Summary

Output:
- Requirement ID implemented
- Files created/modified
- Playwright test results (N passed, M failed)
- Path to HTML report: `playwright-report/index.html`
