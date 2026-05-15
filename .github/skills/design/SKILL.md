---
name: design
description: 'Produce architecture overview and API contract for a selected user story and publish to Confluence. Use when creating design documentation, identifying impacted files, specifying endpoints, or preparing designs for human review before coding. Triggers on: design, architecture, API contract, endpoint, impacted files, Confluence design.'
argument-hint: 'User story ID and title to design (e.g., REQ-003: Book Search)'
---

# Skill: Architecture Design & API Contract

## When to Use
- Producing a design document before coding starts
- Identifying which backend/frontend files will change
- Specifying API endpoint shapes for a new feature
- Publishing design to Confluence for human review

## Procedure

### 1. Read the User Story
- Accept requirement ID, title, and acceptance criteria from the orchestrator
- Note all roles involved and the expected user interactions

### 2. Scan the Codebase
Use `read` and `search` tools to identify:
- Existing routers in `backend/app/routers/` that may need extending
- Existing schemas in `backend/app/schemas/` that may need new fields
- Existing models in `backend/app/models/` — note any schema migrations needed
- Existing pages in `frontend/src/pages/` that may need updating
- New files that must be created (routers, schemas, models, pages, services, types)

### 3. Compose the Architecture Overview

```markdown
## Architecture Overview

### Files to Modify
| File | Change |
|------|--------|
| backend/app/routers/books.py | Add POST /books/{id}/borrow endpoint |
| frontend/src/App.tsx | Register /borrow route |

### Files to Create
| File | Purpose |
|------|---------|
| backend/app/routers/borrow.py | Borrow/return transaction endpoints |
| frontend/src/pages/BorrowPage.tsx | Borrow book UI |

### Database Changes
- New table: `transactions` (id, user_id, book_id, borrowed_at, returned_at)
- OR: No schema changes required
```

### 4. Compose the API Contract

For each new or modified endpoint:
```markdown
## API Contract

### POST /api/borrow/{book_id}
- **Auth**: member, librarian, admin
- **Request body**: none
- **Response 200**: `{ "transaction_id": int, "book_id": int, "borrowed_at": datetime }`
- **Response 404**: `{ "detail": "Book not found" }`
- **Response 409**: `{ "detail": "Book already borrowed" }`
```

### 5. Publish to Confluence
Create or update a Confluence page titled `Design: <User Story Title>` using `confluence/*` MCP tools. Include both sections above.

## Output Format

```
Design published: "Design: <Title>"
Confluence URL: <url>

Architecture overview: N files modified, M files created
API contract: K endpoints specified

Awaiting human review and approval before coding begins.
```

## Reference Files
- [Architecture instructions](../../instructions/architecture.instructions.md)
