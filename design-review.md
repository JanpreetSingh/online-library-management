# Design Review: FR-3.1 Borrow a Book

## Review Date
2026-06-02

## Design Source
`ARCHITECTURE.md` (project root)

## Summary

🔴 **BLOCKED** — 1 blocking error found and resolved. ARCHITECTURE.md has been patched.
Human reviewer has acknowledged findings. Gate status: ✅ **Approved with open items.**

---

## Findings

| # | Risk / Gap | Category | Severity | Recommendation |
|---|-----------|----------|----------|----------------|
| 1 | Data flow Step 6 said "Guest role check → 403" but REQUIREMENTS.md Assumptions state admin and librarian must also be rejected. API contract correctly listed all three — internal inconsistency would mislead implementers into only blocking guests. | Consistency | 🔴 error | **Resolved** — data flow Step 6 patched (see Agreed Decisions) |
| 2 | REQUIREMENTS.md internal conflict: AC5 says "403 for unauthenticated" but NFR1 says "401 for missing token". Design correctly follows HTTP RFC but the decision is undocumented. | API Correctness | ⚠️ warning | Document: 401 for missing/invalid JWT per NFR1; 403 for valid JWT with wrong role per AC5 |
| 3 | No DB-level `CHECK (available_copies >= 0)` constraint documented — relies solely on app-level enforcement via `SELECT FOR UPDATE`. | Data Integrity | ⚠️ warning | Add `CHECK (available_copies >= 0)` to books table or document rationale for app-only enforcement |
| 4 | PostgreSQL transaction isolation level not specified. `SELECT FOR UPDATE` behaviour depends on isolation level. | Data Integrity | ⚠️ warning | Document: PostgreSQL READ COMMITTED + `SELECT FOR UPDATE` is the accepted isolation strategy |
| 5 | No rate-limiting strategy mentioned for `POST /api/borrow/{book_id}`. A single member could flood the endpoint causing DB load. | Security | ⚠️ warning | Confirm rate-limiting handled at nginx layer or document deferral to infrastructure |
| 6 | `book_id` path parameter UUID format validation not documented — malformed IDs hit the DB before validation, risking a 500 instead of a clean 422. | Security | ⚠️ warning | Validate UUID format at router level or document accepted failure mode |
| 7 | `due_date` appears in DB schema, data flow, and API response but REQUIREMENTS.md explicitly marks due dates and loan periods **out of scope** for this story. | Completeness | ℹ️ info | Defer `due_date` to the return-flow story, or document as a technical prerequisite and acknowledge the scope decision |

---

## Agreed Design Decisions

| Finding # | Decision |
|-----------|---------|
| 1 | **Resolved** — `ARCHITECTURE.md` Data Flow Step 6 patched from `"Guest role check → 403 Forbidden"` to `"Non-member role check (guest, admin, librarian) → 403 Forbidden"`. Aligns data flow with the API contract and with REQUIREMENTS.md Assumptions ("admin and librarian roles are not in scope for this story"). |

---

## Open Items

The following warnings and info items are non-blocking but must be tracked during implementation:

| Finding # | Item | Owner |
|-----------|------|-------|
| 2 | Document the 401 vs 403 split decision in implementation notes — 401 for missing/invalid JWT (NFR1), 403 for valid JWT with insufficient role (AC5) | Developer |
| 3 | Add `CHECK (available_copies >= 0)` to `books` table DB migration, or explicitly document that app-level `SELECT FOR UPDATE` enforcement is accepted | Developer |
| 4 | Document PostgreSQL READ COMMITTED + `SELECT FOR UPDATE` as the accepted isolation strategy in implementation notes | Developer |
| 5 | Confirm rate-limiting is handled at the nginx layer and document; or raise as infrastructure ticket | Tech Lead |
| 6 | Add UUID format validation at the router or document the accepted failure mode (SQLAlchemy format error → 500 vs explicit 422) | Developer |
| 7 | Decide: defer `due_date` to the return-flow story, or acknowledge as a technical prerequisite with explicit justification | Tech Lead |
