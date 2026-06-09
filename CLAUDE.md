# Online Library Management - Claude Code Project

## Project Overview

Full-stack library management system with role-based access control, book catalog management, borrowing/returns, and automated SDLC workflow.

---

## Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **ORM**: SQLAlchemy 2.0
- **Validation**: Pydantic v2 (use `ConfigDict` not `Config`)
- **Database**: PostgreSQL 15
- **Auth**: JWT tokens via `python-jose`
- **Testing**: pytest with `TestClient`

### Frontend
- **Framework**: React 18 with TypeScript 5
- **Styling**: Tailwind CSS (NO inline styles, NO CSS modules)
- **State**: React Context API
- **HTTP**: Fetch API with custom service layer
- **Testing**: Playwright for E2E

### DevOps
- **Containers**: Docker Compose
- **Ports**: Backend 8000, Frontend 3000
- **CI/CD**: GitLab CI (automated via orchestrator)

---

## Coding Standards

### Backend Patterns

**1. FastAPI Routers**
```python
from fastapi import APIRouter, Depends, HTTPException
from app.models import User
from app.schemas import BookCreate, BookResponse
from app.auth import get_current_user

router = APIRouter(prefix="/api/books", tags=["books"])

@router.post("", response_model=BookResponse, status_code=201)
async def create_book(
    book: BookCreate,
    current_user: User = Depends(get_current_user)
):
    # Implementation
    pass
```

**2. Pydantic Schemas (v2)**
```python
from pydantic import BaseModel, ConfigDict

class BookBase(BaseModel):
    title: str
    author: str
    isbn: str

class BookCreate(BookBase):
    pass

class BookResponse(BookBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)
```

**3. Role-Based Auth Guards**
```python
# Use inequality pattern for member exclusion
if current_user.role != UserRole.member:
    # Librarian or Admin only
    pass

# Use equality for specific roles
if current_user.role == UserRole.admin:
    # Admin only
    pass
```

**4. Error Responses**
- `404` - Resource not found
- `401` - Missing or invalid JWT
- `403` - Valid JWT, wrong role
- `409` - Conflict (duplicate, already borrowed, etc.)
- `422` - Validation error (Pydantic auto-handles)
- `500` - Unhandled exception (avoid these)

### Frontend Patterns

**1. Functional Components Only**
```typescript
import { useState, useEffect } from 'react';

interface BookPageProps {
  bookId: string;
}

export function BookPage({ bookId }: BookPageProps) {
  const [book, setBook] = useState<Book | null>(null);
  
  useEffect(() => {
    // Fetch book
  }, [bookId]);
  
  return (
    <div className="container mx-auto p-4">
      {/* Tailwind classes only */}
    </div>
  );
}
```

**2. Service Layer Pattern**
```typescript
// src/services/bookService.ts
export const bookService = {
  async getBook(id: string): Promise<Book> {
    const response = await fetch(`/api/books/${id}`);
    if (!response.ok) throw new Error('Failed to fetch book');
    return response.json();
  }
};
```

**3. Tailwind Only**
- ✅ `className="bg-blue-500 hover:bg-blue-600"`
- ❌ `style={{ backgroundColor: 'blue' }}`
- ❌ CSS modules

### Testing Patterns

**1. Backend Unit Tests (pytest)**
```python
def test_create_book_success(client, admin_token):
    response = client.post(
        "/api/books",
        json={"title": "Test Book", "author": "Author", "isbn": "123"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 201
    assert response.json()["title"] == "Test Book"

def test_create_book_unauthorized(client):
    response = client.post("/api/books", json={...})
    assert response.status_code == 401
```

**2. E2E Tests (Playwright)**
```typescript
test('should borrow book successfully', async ({ page }) => {
  await page.goto('http://localhost:3000/books/1');
  await page.click('[data-testid="borrow-button"]');
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});

test('should return 409 when book already borrowed', async ({ request }) => {
  const response = await request.post('http://localhost:8000/api/borrow/1');
  expect(response.status()).toBe(409);
});
```

---

## SDLC Workflow

### Start a New Feature

When implementing a new feature from a Jira ticket:

```bash
@orchestrator-sdlc LIB-XX
```

This runs the 8-step workflow:
1. **Requirements** → REQUIREMENTS.md
2. **Architecture** → ARCHITECTURE.md
3. **Design Review** → design-review.md (gate)
4. **Implementation Plan** → implementation-plan.md
5. **Implementation** → Code changes
6. **Code Review** → code-review.md (gate)
7. **Testing** → verify-test-result.md (gate)
8. **PR Creation** → Pull Request

### Manual Steps (if needed)

```bash
# Individual steps
@requirements-assistant LIB-XX
@architecture-design
@design-review
@implementation-planning
@implementation
@code-review-assistant
@verify-test
@pr-creator
```

### Quality Gates

Three mandatory gates must pass:
- **Design Review**: No 🔴 errors
- **Code Review**: No 🔴 errors
- **Test Verification**: Unit ≥90%, E2E ≥80%

---

## File Structure

```
online-library-management/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app + CORS
│   │   ├── routers/             # API endpoints
│   │   ├── models/              # SQLAlchemy models
│   │   ├── schemas/             # Pydantic schemas
│   │   └── auth.py              # JWT dependencies
│   └── tests/                   # pytest tests
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Router + routes
│   │   ├── pages/               # Page components
│   │   ├── components/          # Reusable components
│   │   ├── services/            # API services
│   │   ├── types/               # TypeScript types
│   │   └── context/             # Auth context
│   └── public/
├── tests/
│   └── e2e/                     # Playwright specs
├── .claude/
│   ├── agents/                  # SDLC agents
│   ├── skills/                  # Reusable skills
│   └── memory/                  # Project memory
├── REQUIREMENTS.md              # Current feature requirements
├── ARCHITECTURE.md              # Current feature architecture
├── implementation-plan.md       # Current feature tasks
├── CHANGELOG.md                 # Release notes
└── docker-compose.yml           # Local dev environment
```

---

## Common Operations

### Running Tests

```bash
# Backend unit tests
cd backend && python -m pytest tests/ -v

# E2E tests (requires app running)
npx playwright test

# Specific E2E test
npx playwright test tests/e2e/books.spec.ts
```

### Starting Development Environment

```bash
# Full stack with Docker
docker-compose up -d

# Or manually
cd backend && uvicorn app.main:app --reload --port 8000
cd frontend && npm run dev
```

### Git Workflow

```bash
# Create feature branch from ticket
git checkout -b EPMCDMETST-XXXXX

# Run SDLC workflow
@orchestrator-sdlc EPMCDMETST-XXXXX

# Workflow handles: code → commit → test → PR
```

---

## Important Notes

### Database Migrations

When models change:
1. Create migration: `alembic revision --autogenerate -m "description"`
2. Review migration file
3. Apply: `alembic upgrade head`

### Environment Variables

Required in `.env`:
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/library
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### MCP Integrations

If using Jira/Confluence MCP:
- Jira: `@jira/get-issue`, `@jira/update-issue`
- Confluence: `@confluence/get-page`, `@confluence/publish-page`

Fallback: Manual paste or GitHub issues if MCP unavailable

---

## Workflow Preferences

### When to Use Each Agent

| Scenario | Command |
|----------|---------|
| New Jira feature ticket | `@orchestrator-sdlc LIB-XX` |
| Update requirements only | `@requirements-assistant LIB-XX` |
| Review existing code | `@code-review-assistant` |
| Run tests for current branch | `@verify-test` |
| Create PR for completed feature | `@pr-creator` |

### Human Review Gates

Every workflow step requires explicit approval:
- Review the generated artifact
- Reply `'approve'` or `'continue'` to proceed
- Request changes if needed

This ensures:
- Quality control at each stage
- Alignment with requirements
- Early issue detection

---

## Anti-Patterns to Avoid

❌ **Don't:**
- Use inline styles in React components
- Use class components
- Write raw SQL queries
- Hardcode credentials or secrets
- Skip tests
- Commit without running tests
- Force push to master
- Use `Config` class in Pydantic (use `ConfigDict`)
- Use `!= UserRole.admin` for admin-only checks (use equality)

✅ **Do:**
- Use Tailwind utility classes
- Use functional components with hooks
- Use SQLAlchemy ORM
- Use environment variables for config
- Write unit + E2E tests
- Run tests before commit
- Create PRs from feature branches
- Use `model_config = ConfigDict(from_attributes=True)`
- Use `== UserRole.admin` for specific role checks

---

## Getting Help

- SDLC workflow issues: Check `.claude/agents/README.md`
- Coding questions: See patterns above or ask in conversation
- Test failures: Check `verify-test-result.md` for details
- MCP issues: Verify `.claude/mcp.json` or workspace settings

---

## Version

- **Project**: Online Library Management v1.0
- **SDLC Agents**: v1.0 (Claude Code framework)
- **Last Updated**: 2026-06-06
