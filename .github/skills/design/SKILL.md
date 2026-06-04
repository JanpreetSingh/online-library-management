---
name: design
description: 'Produce architecture overview and API contract for a selected user story and publish to Confluence. Use when creating design documentation, identifying impacted files, specifying endpoints, or preparing designs for human review before coding. Triggers on: design, architecture, API contract, endpoint, impacted files, Confluence design.'
argument-hint: 'Requirements source and user story title to design (e.g., REQ-003: Book Search). Optionally prefix with a file path: "path/to/requirements.md REQ-003: Book Search". Defaults to REQUIREMENTS.md at the project root if no path is given.'
---

# Skill: Architecture Design & API Contract

## When to Use
- Producing a design document before coding starts
- Identifying which backend/frontend files will change
- Specifying API endpoint shapes for a new feature
- Publishing design to Confluence for human review

## Procedure

### 1. Read Requirements
- If a requirements file path was passed as part of the argument, read that file
- Otherwise, fall back to `REQUIREMENTS.md` at the project root
- Extract the user story, acceptance criteria, and functional/non-functional requirements
- Note all roles involved and the expected user interactions

### 2. Scan the Codebase
Use `read` and `search` tools to identify:
- Existing routers in `backend/app/routers/` that may need extending
- Existing schemas in `backend/app/schemas/` that may need new fields
- Existing models in `backend/app/models/` — note any schema migrations needed
- Existing pages in `frontend/src/pages/` that may need updating
- New files that must be created (routers, schemas, models, pages, services, types)

### 3. Compose Section A — High-Level System Architecture
Load `architecture-design.instructions.md` for technology reference, then produce:
- **Mermaid component diagram** showing Frontend, API Gateway, Backend, Database, Auth and their interactions
- **Technology choices**: list each layer and the technology used
- **Data flow**: numbered step-by-step sequence from browser to DB and back
- **Key components table**:

  | Component | Technology | Responsibility |
  |-----------|-----------|----------------|
  | Frontend  | React 18 + TypeScript + Tailwind | ... |
  | Backend   | Python FastAPI | ... |
  | Database  | PostgreSQL + SQLAlchemy | ... |
  | Auth      | JWT (python-jose) | ... |

### 4. Compose Section B — Impacted Files

```markdown
## Impacted Files

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

### 5. Compose Section C — API Contract

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

### 6. Write `ARCHITECTURE.md`
Create or update `ARCHITECTURE.md` at the project root with the following structure:
```markdown
# Architecture: <User Story Title>

## High-Level System Architecture
<Mermaid diagram>

## Technology Stack
<Key components table>

## Data Flow
<Numbered steps>

## Impacted Files
<Modified / created file list>

## API Contract
<Endpoint specifications>
```


## Output Format

```

ARCHITECTURE.md written to: <project-root>/ARCHITECTURE.md

Architecture overview: N files modified, M files created
API contract: K endpoints specified

Awaiting human review and approval before coding begins.
```

## Reference Files
- [Architecture instructions](../../instructions/architecture-design.instructions.md)
