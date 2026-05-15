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

### 2. Review Criteria

Evaluate the diff against:

| Category | What to Check |
|----------|--------------|
| **Security** | No hardcoded secrets; inputs validated by Pydantic at API boundary; JWT guard on protected routes; no SQL injection via raw queries |
| **Correctness** | Logic matches the acceptance criteria of the user story; edge cases handled |
| **Architecture** | Backend follows patterns in `backend/app/routers/`; frontend uses functional components + Tailwind only; no inline styles |
| **Tests** | pytest unit tests present for every new backend endpoint |
| **Regression** | No existing routes, imports, or types silently broken |
| **OWASP Top 10** | Check for broken auth, injection, insecure direct object references, sensitive data exposure |

### 3. Compose the Review Table

```markdown
| File | Line | Severity | Finding |
|------|------|----------|---------|
| backend/app/routers/X.py | 42 | 🔴 error | Missing `Depends(get_current_user)` on protected route |
| frontend/src/pages/X.tsx | 18 | ⚠️ warning | Inline style used — replace with Tailwind class |
| backend/app/schemas/X.py | 7 | ℹ️ info | Consider adding a `Config` class for ORM mode |
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
