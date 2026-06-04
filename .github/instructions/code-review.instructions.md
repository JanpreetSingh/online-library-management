---
description: 'Code review rules and checklist for the Online Library Management project. Loaded when performing code review, analysing git diff, or producing a structured review report.'
applyTo: backend/**/*.py,frontend/src/**/*.{ts,tsx},backend/tests/**/*.py
---

# Code Review Instructions

## Role
Act as a senior code reviewer. Perform a structured code review of the implementation against the 7-area checklist below. Produce a table of findings and gate the pipeline accordingly.

## 7-Area Review Checklist

Every review MUST evaluate all seven areas. Raise a finding row for each violation.

| Review Area | Review Question |
|-------------|----------------|
| **Correctness** | Does each component behave as specified in `REQUIREMENTS.md`? Do endpoints return the exact status codes and payload shapes defined in the acceptance criteria? |
| **Security** | Are secrets excluded from source and output? Is all user input validated at the API boundary (Pydantic schemas)? Are JWT guards on every protected route? No hardcoded credentials, no raw SQL, no OWASP Top 10 issues (injection, broken auth, IDOR, sensitive data exposure)? |
| **Error Handling** | Are all API failures, missing records, and empty result sets handled gracefully with appropriate HTTP status codes and human-readable messages? No unhandled exceptions that would produce a 500? |
| **Test Coverage** | Do tests cover the happy path **and** edge cases — `Not Found` (404), `Conflict` (409), `Unauthorized` (401), `Forbidden` (403), and missing-field / malformed-input scenarios? |
| **Code Clarity** | Are function and variable names self-explanatory? Is the logic easy to follow without needing inline comments? Are complex decisions documented where they exist? |
| **DRY Principle** | Is there duplicated logic that could be refactored into a shared helper or dependency? Flag any copy-paste patterns across routers, schemas, or components. |
| **Dependency Safety** | Are any newly added or updated package versions known to be vulnerable (CVE)? Cross-check `requirements.txt` and `package.json` additions against known advisories. |

## Review Table Format

```markdown
| File | Line | Area | Severity | Finding |
|------|------|------|----------|---------|
| backend/app/routers/X.py | 42 | Security | 🔴 error | Missing `Depends(get_current_user)` on protected route |
| backend/tests/test_X.py  | —  | Test Coverage | 🔴 error | No test for 404 when record does not exist |
| frontend/src/pages/X.tsx | 18 | Code Clarity | ⚠️ warning | Variable name `x` is not descriptive |
| backend/app/schemas/X.py | 7  | DRY Principle | ℹ️ info | Pagination logic duplicated from users router |
```

Severity levels:
- 🔴 **error** — Must be fixed before proceeding (security issue, broken logic, missing test)
- ⚠️ **warning** — Should be fixed but non-blocking
- ℹ️ **info** — Suggestion or style note

## Gate Rules

- Any 🔴 error → **block**; request fixes before testing proceeds
- Only ⚠️ / ℹ️ → **approve with notes**

## Project-Specific Conventions

- Auth split: **401** = missing/invalid JWT (raised in `dependencies.py`); **403** = valid JWT, wrong role (raised in each router)
- Role guard: must use `current_user.role != UserRole.member` — never `== UserRole.guest`
- Path params that are UUIDs must use `uuid.UUID` type, not `str`
- All form input validated by Pydantic v2 schemas in `backend/app/schemas/`
- No inline styles in React — Tailwind classes only
- No `git add`, `git commit`, or `git push` during review
