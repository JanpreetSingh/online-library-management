# Requirements — FR-3.1 Borrow a Book

## Source
- Type: Jira Story
- Reference: [EPMCDMETST-40786](https://jiraeu.epam.com/browse/EPMCDMETST-40786)
- Captured: 2026-06-02

## Original User Story
> As a library member, I want to borrow an available book from the catalog, so that I can take it out on loan and the system accurately tracks availability.

## Resolved Clarifications
- Maximum concurrent active borrows per member is **5**.
- Eligibility is determined solely by the `member` role; no suspended/blocked flag exists in this story.
- Due dates and loan periods are out of scope for this story.
- Return flow is handled by a separate story and is out of scope here.
- HTTP `409 Conflict` is returned when no copies are available or the borrow limit is reached.
- HTTP `403 Forbidden` is returned when the requester is unauthenticated or lacks the `member` role.
- No specific performance SLA is defined for this story.
- Audit logging of failed borrow attempts is not required; standard server-level logs apply.

## Functional Requirements
1. An authenticated user with the `member` role may submit a borrow request for a book identified by its `bookId`.
2. The system must reject the request with a clear error message if the book has zero available copies.
3. The system must reject the request with a clear error message if the member already has 5 active (unreturned) borrow transactions.
4. The system must reject the request with a clear error message if the requester is unauthenticated or does not hold the `member` role.
5. On a successful borrow, the system must create a borrow transaction record containing at minimum: `bookId`, `userId`, `borrowDate`, and `status = Borrowed`.
6. On a successful borrow, the book's `availableCopies` must be decremented by exactly 1 and must never fall below 0.
7. The decrement of `availableCopies` and the creation of the borrow transaction must be performed atomically; a partial update (transaction created but copies not decremented, or vice versa) is not permitted.
8. Under concurrent borrow attempts for the last available copy, at most one request must succeed; all others must receive an error response with no transaction created and no inventory change.

## Non-Functional Requirements
1. **Security** — The borrow endpoint must require a valid JWT bearer token; requests without a valid token must be rejected with `401 Unauthorized` before any business logic executes.
2. **Authorization** — Role enforcement must occur server-side; client-supplied role claims must not be trusted without server-side JWT validation.
3. **Data integrity** — The atomic decrement and transaction creation must be enforced at the database level (e.g., via a database transaction with appropriate isolation) to prevent race conditions.
4. **Consistency** — `availableCopies` must never go negative regardless of concurrent requests.
5. **Error clarity** — All rejection responses must include a human-readable `detail` field describing the reason (no copies, borrow limit reached, access denied).
6. **Idempotency awareness** — Duplicate borrow requests (same `userId` + `bookId` with an active transaction) behaviour (reject or allow) must be explicitly defined and documented during implementation.

## Acceptance Criteria
1. Given I am authenticated with the `member` role and the book has at least 1 available copy and I have fewer than 5 active borrows, when I submit a borrow request, then a borrow transaction is created with `bookId`, `userId`, `borrowDate`, and `status = Borrowed`, and `availableCopies` is decremented by 1.
2. Given a book has 0 available copies, when I attempt to borrow it, then the request is rejected with HTTP `409` and a clear error message, and no transaction is created.
3. Given I already have 5 active borrow transactions, when I attempt to borrow another book, then the request is rejected with HTTP `409` and a clear error message, and no transaction is created.
4. Given I successfully borrow a book, then the book's `availableCopies` is decremented by 1 and cannot go below 0.
5. Given I am unauthenticated or hold a role other than `member`, when I attempt to borrow, then access is denied with HTTP `403` and no inventory or transaction changes occur.
6. Given concurrent borrow attempts for the last available copy, when all requests are processed, then exactly one borrow transaction is created, `availableCopies` is decremented exactly once (to 0), and all other concurrent requests receive an error response.

## Assumptions and Constraints
- The `member` role is the only role permitted to borrow; admin and librarian roles are not in scope for this story.
- No suspended/blocked member flag is checked in this story; eligibility = valid JWT + `member` role.
- Due dates, loan periods, and overdue handling are not part of this story.
- Borrow limit of 5 is a fixed business rule for this iteration; it is not configurable via UI or API in this story.
- Standard server-level access logs are sufficient for observability; no dedicated audit event table is required.

## Out of Scope
- Payment processing, fines, or overdue fees.
- Reservation or hold queues.
- Book return flow (separate story).
- Due date assignment or loan period management.
- Notifications (e.g., email/SMS on borrow confirmation).
- Admin/librarian override of borrow eligibility rules.