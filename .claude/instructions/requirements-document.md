# Instructions: Requirements Document

**Purpose**: Generate a complete REQUIREMENTS.md file with testable acceptance criteria.

---

## Structure

```markdown
# Requirements: [Feature Title]

**Source**: [Jira TICKET-ID | Confluence URL | Pasted Text]
**Date**: [YYYY-MM-DD]
**REQ-ID**: REQ-[NNN]

## Overview
[2-3 sentences: what is being built, why it matters, business value]

## Actors
List all user roles involved:

- **[Role Name]**: [Who they are and what they do in this feature]
- **[Role Name]**: [Description]

## Functional Requirements

### FR-1: [Action-Oriented Title]
**Description**: The system must [specific, measurable behavior]

**Acceptance Criteria**:
- ✅ AC1: [Testable condition with clear pass/fail]
- ✅ AC2: [Testable condition with expected result]
- ✅ AC3: [Testable condition]

**Priority**: High | Medium | Low

### FR-2: [Next Requirement]
[Repeat pattern]

## Non-Functional Requirements

### NFR-1: [Quality Attribute]
**Description**: [Performance/Security/Usability/Scalability need]

**Acceptance Criteria**:
- ✅ [Measurable criterion with threshold]

**Priority**: High | Medium | Low

### NFR-2: [Next NFR]
[Repeat pattern]

## Assumptions and Constraints
- [What we're assuming to be true]
- [Known limitations or constraints]
- [External dependencies we're assuming exist]

## Out of Scope
Explicitly list what is NOT included:
- [Feature/behavior that won't be implemented]
- [Related work deferred to future stories]

## Dependencies
- [Other features this depends on]
- [External systems or APIs needed]
- [Data or services that must exist]
```

---

## Writing Guidelines

### Functional Requirements

**Good FR:**
```
FR-1: Search books by keyword
Description: Users must be able to search the book catalog by entering keywords that match title, author, or ISBN.

Acceptance Criteria:
- ✅ Entering "Gatsby" returns all books with "Gatsby" in title or author
- ✅ Search is case-insensitive
- ✅ Results display within 2 seconds
- ✅ Partial matches are included (e.g., "Gat" matches "Gatsby")
- ✅ Empty results show "No books found" message
```

**Bad FR (too vague):**
```
FR-1: Book search
Description: Users can search for books.

Acceptance Criteria:
- ✅ Search works
```

### Non-Functional Requirements

**Good NFR:**
```
NFR-1: Search Performance
Description: Book search must return results quickly even with large catalogs.

Acceptance Criteria:
- ✅ Search responds within 2 seconds for catalogs up to 100,000 books
- ✅ Search handles 100 concurrent users without degradation

Priority: High
```

**Bad NFR:**
```
NFR-1: Fast search
Description: Search should be fast.
```

### Acceptance Criteria Rules

1. **Testable**: Can verify pass/fail objectively
2. **Specific**: Include exact values, thresholds, behaviors
3. **Complete**: Cover happy path AND error cases
4. **Measurable**: Use numbers, states, or observable outcomes

**Good AC:**
```
- ✅ Borrowing a book decrements available_copies by 1
- ✅ Attempting to borrow when available_copies = 0 returns 409 Conflict
- ✅ Borrowing creates a transaction record with borrowed_at timestamp
```

**Bad AC:**
```
- ✅ Users can borrow books
- ✅ Book availability updates
```

---

## Common NFR Categories

Use these as a checklist:

| Category | Example Acceptance Criteria |
|----------|----------------------------|
| **Performance** | Response time < 2s, handles 1000 concurrent users |
| **Security** | All routes require JWT, passwords hashed with bcrypt, input validated |
| **Usability** | Forms show validation errors inline, success messages auto-dismiss after 3s |
| **Accessibility** | WCAG 2.1 AA compliant, keyboard navigable |
| **Reliability** | 99.9% uptime, auto-retry failed operations |
| **Auditability** | All changes logged with user ID and timestamp |
| **Scalability** | Supports 10x current user base without architecture changes |

---

## Assumptions vs Out of Scope

**Assumptions**: Things we believe to be true
```
## Assumptions
- PostgreSQL database is already provisioned
- Users are authenticated via existing JWT system
- Book catalog is pre-populated
```

**Out of Scope**: Things we explicitly won't do
```
## Out of Scope
- Book recommendations based on user history (future story)
- Integration with external book APIs (deferred)
- Mobile app support (web only for v1)
```

---

## Dependencies

List what must exist or be built first:

```
## Dependencies
- User authentication system (already exists)
- Book catalog API endpoints (already exists)
- PostgreSQL database with books table (already exists)
- Email service for notifications (needs to be set up)
```

---

## REQ-ID Numbering

Use sequential numbers:
- REQ-001, REQ-002, REQ-003...
- Or derive from Jira ticket: LIB-45 → REQ-045

---

## Validation Checklist

Before finalizing, verify:

- [ ] Every FR has at least 2 ACs
- [ ] Every AC is testable (has clear pass/fail)
- [ ] NFRs include measurable thresholds
- [ ] Actors are clearly defined
- [ ] Out of scope is explicit (prevents scope creep)
- [ ] Dependencies are listed
- [ ] No ambiguous terms ("fast", "good", "user-friendly")
- [ ] Error cases are covered (not just happy path)

---

## Examples by Feature Type

### CRUD Feature
```
FR-1: Create book record
- ✅ POST /books with valid data returns 201 Created
- ✅ Missing required field returns 422 Validation Error
- ✅ Duplicate ISBN returns 409 Conflict

FR-2: Read book record
- ✅ GET /books/{id} with valid ID returns book data
- ✅ GET /books/{id} with invalid ID returns 404 Not Found
```

### Search/Filter Feature
```
FR-1: Filter books by availability
- ✅ Selecting "Available" shows only books with available_copies > 0
- ✅ Selecting "All" shows all books
- ✅ Filter updates results without page reload
```

### Business Logic Feature
```
FR-1: Book borrowing
- ✅ Member can borrow available book (available_copies > 0)
- ✅ Borrowing decrements available_copies by 1
- ✅ Cannot borrow when available_copies = 0 (returns 409)
- ✅ Cannot borrow if user has 3+ active borrows (returns 403)
- ✅ Transaction record created with user_id, book_id, borrowed_at
```

---

## Anti-Patterns to Avoid

❌ **Vague ACs**
```
- Users can manage their profile
- System handles errors gracefully
```

✅ **Specific ACs**
```
- Users can update email, password, and display name via /profile
- Invalid email format returns 422 with message "Invalid email format"
```

❌ **Missing error cases**
```
FR-1: Delete book
- ✅ Deleting a book removes it from catalog
```

✅ **Complete coverage**
```
FR-1: Delete book
- ✅ DELETE /books/{id} with valid ID returns 204 No Content
- ✅ DELETE /books/{id} with invalid ID returns 404 Not Found
- ✅ DELETE /books/{id} when book has active borrows returns 409 Conflict
- ✅ Only admin role can delete books (librarian/member get 403)
```

❌ **Technical implementation details**
```
FR-1: Use React hooks to fetch data
AC: useEffect should call API
```

✅ **User-facing behavior**
```
FR-1: Display book details
AC: Navigating to /books/{id} shows title, author, ISBN, and availability
```

---

## Tips

1. **Start broad, refine narrow**: Begin with high-level FRs, then drill into specific ACs
2. **Think in user journeys**: Walk through the user's path step-by-step
3. **Cover the edge cases**: What happens when things go wrong?
4. **Use examples**: Concrete examples make ACs clearer
5. **Review with stakeholders**: Verify assumptions before coding
6. **Update as you learn**: Requirements evolve during implementation - keep them current
