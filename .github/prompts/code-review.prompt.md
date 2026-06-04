---
description: 'Analyse the git diff of newly written code and produce a structured review for human sign-off. Use after coding is complete, before testing begins. Step 7 of the SDLC workflow.'
name: code-review
agent: agent
tools: [execute, read]
---

# Code Review: Analyse Git Diff

You are performing Step 7 of the SDLC workflow: review the uncommitted code changes and produce a structured sign-off report.

## Pre-conditions
- Code has been written by the `implementation` agent (Step 6)
- Human has reviewed and approved the git diff display
- No `git commit` has been made yet

## Steps

1. Apply the `code-review` skill:
   a. Run `git diff` (and `git diff --cached` if empty)
   b. Evaluate against the **7-area review checklist**:

      | Review Area | Review Question |
      |-------------|----------------|
      | **Correctness** | Does each component behave as specified in `REQUIREMENTS.md`? Do endpoints return the exact status codes and payload shapes in the acceptance criteria? |
      | **Security** | Are secrets excluded from source and output? Is all user input validated at the API boundary? JWT guards on protected routes? No OWASP Top 10 issues? |
      | **Error Handling** | Are all API failures, missing records, and empty result sets handled gracefully with correct HTTP status codes? No unhandled exceptions producing a 500? |
      | **Test Coverage** | Do tests cover the happy path **and** edge cases — `Not Found` (404), `Conflict` (409), `Unauthorized` (401), `Forbidden` (403), missing-field / malformed-input? |
      | **Code Clarity** | Are function and variable names self-explanatory? Is logic easy to follow? Are complex decisions documented inline? |
      | **DRY Principle** | Is there duplicated logic that could be a shared helper? Flag copy-paste patterns across routers, schemas, or components. |
      | **Dependency Safety** | Are any newly added/updated packages known to be vulnerable (CVE)? Cross-check `requirements.txt` and `package.json` changes. |

   c. Produce a review table with columns: **File \| Line \| Area \| Severity \| Finding**

2. Determine gate status:
   - 🔴 **error** present → block, request fixes from Code Assistant (Step 6)
   - ⚠️ / ℹ️ only → approve with notes

## Output

**No blocking errors:**
```
Code review complete. No blocking issues.
Warnings: N | Suggestions: M

| File | Line | Area | Severity | Finding |
|------|------|------|----------|---------|
| ...  |  ... | ...  | ⚠️ warning | ... |

Awaiting human approval to proceed to testing.
```

**Blocking errors:**
```
Code review complete. N blocking error(s) found (marked 🔴 above).
Please fix errors and re-run the Code Assistant (Step 6) before proceeding.

Awaiting human decision.
```
