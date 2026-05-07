---
description: 'Analyse the git diff of newly written code and produce a structured review for human sign-off. Use after coding is complete, before testing begins. Step 7 of the SDLC workflow.'
name: code-review
agent: agent
tools: [execute, read]
---

# Code Review: Analyse Git Diff

You are performing Step 7 of the SDLC workflow: review the uncommitted code changes and produce a structured sign-off report.

## Pre-conditions
- Code has been written by the `feature-developer` (Step 6)
- Human has reviewed and approved the git diff display
- No `git commit` has been made yet

## Steps

1. Apply the `code-review` skill:
   a. Run `git diff` (and `git diff --cached` if empty)
   b. Evaluate against: security, correctness, architecture patterns, tests, regression, OWASP Top 10
   c. Produce a review table with columns: File | Line | Severity | Finding

2. Determine gate status:
   - 🔴 **error** present → block, request fixes from Code Assistant
   - ⚠️ / ℹ️ only → approve with notes

## Output

**No blocking errors:**
```
Code review complete. No blocking issues.
Warnings: N | Suggestions: M

| File | Line | Severity | Finding |
|------|------|----------|---------|
| ...  |  ... | ⚠️ warning | ... |

Awaiting human approval to proceed to testing.
```

**Blocking errors:**
```
Code review complete. N blocking error(s) found (marked 🔴 above).
Please fix errors and re-run the Code Assistant (Step 6) before proceeding.

Awaiting human decision.
```
