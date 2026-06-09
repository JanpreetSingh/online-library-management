---
name: code-review-preferences
description: What issues block PRs vs what are suggestions
type: feedback
---

Code review findings have three severity levels with different blocking behavior:

**🔴 error (BLOCKS PR):**
- Security issues (missing auth, secrets in code, no input validation)
- Missing tests (no error case tests, no happy path tests)
- Correctness issues (wrong status codes, broken logic)

**🟡 warning (DOESN'T block, should fix):**
- Code clarity (unclear variable names, complex logic without comments)
- DRY violations (copy-paste code, duplicated logic)

**🟢 info (NICE to have):**
- Style suggestions
- Performance optimizations
- Refactoring opportunities

**Why:** Security and correctness issues have caused production incidents. Tests prevent regressions. Clarity and DRY improve maintainability but don't risk user data.

**How to apply:** When running @code-review-assistant, any 🔴 errors mean gate status is ❌ BLOCKED. Fix errors before proceeding to testing. Warnings can be addressed later or accepted as-is with justification.
