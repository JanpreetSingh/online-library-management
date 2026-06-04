# Code Review — FR-3.1 Borrow a Book (EPMCDMETST-40786)

**Date**: 2026-06-03
**Reviewer**: GitHub Copilot (code-review-assistant)
**Branch**: EPMCDMETST-40786
**Files reviewed**: backend/app/models/book.py, backend/app/models/borrow_transaction.py, backend/app/auth/dependencies.py, backend/app/routers/borrow.py, backend/tests/test_borrow.py, frontend/nginx.conf

---

## Review Checklist Results

| File | Line | Area | Severity | Finding |
|------|------|------|----------|---------|
| backend/app/routers/borrow.py | 3 | Code Clarity | warning | `from sqlalchemy import select` is imported but never used. All queries use `db.query()` ORM style. Remove the dead import. |
| backend/tests/test_borrow.py | — | Test Coverage | warning | No test for malformed UUID path param returning `422 Unprocessable Entity`. TASK-10 introduced `book_id: uuid.UUID` validation but no test covers the rejection path (e.g. `POST /api/borrow/not-a-uuid`). |
| backend/tests/test_borrow.py | — | Test Coverage | warning | No concurrency test for AC-6 ("concurrent borrow of last copy — exactly one succeeds"). The requirement is explicitly called out in REQUIREMENTS.md FR-8 and AC-6. A thread-based or async test is absent. |
| backend/app/routers/borrow.py | 50 | Correctness | info | Active borrow count check runs before the book existence check. A member at their 5-borrow limit targeting a non-existent book receives 409 instead of 404. Reordering (fetch + lock book first, then check count) would give the more accurate response, and the WITH_FOR_UPDATE lock is already needed anyway. |
| backend/app/models/borrow_transaction.py | — | Correctness | info | `due_date` column is `nullable=False` with no default. If a caller constructs a BorrowTransaction without supplying `due_date` the DB will raise an integrity error rather than FastAPI returning a clean 422. The business logic always sets it, so this is low-risk, but the expected value (borrowed_at + 14 days) could be noted in the column definition. |
| frontend/nginx.conf | — | Security | info | `proxy_set_header X-Real-IP $remote_addr` forwards the direct connection IP. If this container is behind an upstream load balancer, `$remote_addr` will be the proxy IP, not the client IP, making IP-based rate limiting ineffective. Consider also forwarding `X-Forwarded-For` and configuring `set_real_ip_from` if a load balancer sits in front. |

---

## Summary

| Severity | Count |
|----------|-------|
| error | 0 |
| warning | 3 |
| info | 3 |

---

## Gate Decision

Review complete. No blocking issues found.
Warnings: 3 | Suggestions: 3

Awaiting human approval to proceed to testing (Step 8 — Playwright E2E).
