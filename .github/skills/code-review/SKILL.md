---
name: code-review
description: 'Analyse uncommitted git diff and produce a structured review table for human sign-off. Use when reviewing code changes, checking diff quality, identifying security or logic issues, or gating code before testing. Triggers on: code review, git diff, review changes, check code, blocking issues.'
argument-hint: 'Optional: requirement ID or feature name to scope the review context'
---

# Skill: Code Review

## When to Use
- Reviewing uncommitted changes before testing proceeds
- Identifying security vulnerabilities, logic errors, or pattern violations in new code
- Producing a structured sign-off artefact for the human

## Procedure

### 1. Capture the Diff
Run:
```bash
git diff
```
If empty, also run `git diff --cached` for staged changes.

### 2. Review Checklist

Evaluate the diff against every area below. Raise a finding for each violation.

| Review Area | Review Question |
|-------------|----------------|
| **Correctness** | Does each component behave as specified in `REQUIREMENTS.md`? Do endpoints return the exact status codes and payload shapes defined in the acceptance criteria? |
| **Security** | Are secrets excluded from source and output? Is all user input validated at the API boundary (Pydantic schemas)? Are JWT guards on every protected route? No hardcoded credentials, no raw SQL, no OWASP Top 10 issues (injection, broken auth, IDOR, sensitive data exposure)? |
| **Error Handling** | Are all API failures, missing records, and empty result sets handled gracefully with appropriate HTTP status codes and human-readable messages? No unhandled exceptions that would produce a 500? |
| **Test Coverage** | Do tests cover the happy path **and** the edge cases — `Not Found` (404), `Conflict` (409), `Unauthorized` (401), `Forbidden` (403), and any missing-field / malformed-input scenarios? |
| **Code Clarity** | Are function and variable names self-explanatory? Is the logic easy to follow without needing inline comments? Are complex decisions documented where they exist? |
| **DRY Principle** | Is there duplicated logic that could be refactored into a shared helper or dependency? Flag any copy-paste patterns across routers, schemas, or components. |
| **Dependency Safety** | Are any newly added or updated package versions known to be vulnerable (CVE)? Cross-check `requirements.txt` and `package.json` additions against known advisories. |

### 3. Compose the Review Table

```markdown
| File | Line | Area | Severity | Finding |
|------|------|------|----------|---------|
| backend/app/routers/X.py | 42 | Security | 🔴 error | Missing `Depends(get_current_user)` on protected route |
| backend/tests/test_X.py | — | Test Coverage | 🔴 error | No test for 404 when record does not exist |
| frontend/src/pages/X.tsx | 18 | Code Clarity | ⚠️ warning | Inline style used — replace with Tailwind class |
| backend/app/schemas/X.py | 7 | DRY Principle | ℹ️ info | Duplicate pagination logic; consider shared helper |
```

Severity levels:
- 🔴 **error** — Must be fixed before proceeding (security issue, broken logic, missing test)
- ⚠️ **warning** — Should be fixed but non-blocking
- ℹ️ **info** — Suggestion or style note

### 4. Determine Gate Decision

- If **any 🔴 errors**: block progression, request fixes
- If **only ⚠️/ℹ️**: approve with notes

## Output Format

**No blocking errors:**
```
Code review complete. No blocking issues.
Warnings: N | Suggestions: M

Awaiting human approval to proceed to testing.
```

**Blocking errors found:**
```
Code review complete. N blocking error(s) found (marked 🔴 above).
Fix all errors and re-run the Code Assistant before proceeding.

Awaiting human decision.
```
