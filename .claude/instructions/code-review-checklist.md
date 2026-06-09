# Instructions: Code Review Checklist

**Purpose**: Systematic 7-area review of code changes with clear severity levels.

---

## 7-Area Review Framework

| # | Area | Focus | Severity if Violated |
|---|------|-------|---------------------|
| 1 | **Correctness** | Does code do what requirements say? | 🔴 error |
| 2 | **Security** | Are there vulnerabilities? | 🔴 error |
| 3 | **Error Handling** | Are failures handled gracefully? | 🔴 error |
| 4 | **Test Coverage** | Are happy path AND edge cases tested? | 🔴 error |
| 5 | **Code Clarity** | Is code self-explanatory? | 🟡 warning |
| 6 | **DRY Principle** | Is logic duplicated? | 🟡 warning |
| 7 | **Dependency Safety** | Are packages secure? | 🔴 error |

---

## Area 1: Correctness

### Check Against Requirements

For each changed file, verify:
- Does behavior match REQUIREMENTS.md acceptance criteria?
- Do endpoints return correct HTTP status codes?
- Do responses match API contract from ARCHITECTURE.md?

### Examples

❌ **Incorrect:**
```python
@router.post("/books/{id}/borrow")
async def borrow_book(id: int):
    # Missing auth - anyone can borrow
    # Wrong status - should be 200, not 201
    return {"message": "Borrowed"}, 201
```

✅ **Correct:**
```python
@router.post("/books/{id}/borrow", status_code=200)
async def borrow_book(
    id: int,
    current_user: User = Depends(get_current_user)
):
    # Auth required, correct status code
    transaction = create_borrow_transaction(id, current_user.id)
    return {"transaction_id": transaction.id, "book_id": id}
```

### Findings Template

```markdown
| File | Line | Area | Severity | Finding |
|------|------|------|----------|---------|
| backend/app/routers/books.py | 42 | Correctness | error | Returns 201 Created but should return 200 OK per API contract |
| backend/app/routers/books.py | 56 | Correctness | error | Missing check for available_copies > 0 (AC from REQUIREMENTS.md) |
```

---

## Area 2: Security

### Critical Checks

**🔴 MUST FIX:**
- Missing JWT auth on protected routes
- Hardcoded secrets/credentials
- No input validation
- SQL injection vulnerabilities
- Missing role-based access control
- Sensitive data in logs/responses
- CORS misconfiguration

### Checklist

- [ ] All protected routes have `Depends(get_current_user)`
- [ ] Role guards check `user.role` correctly
- [ ] All user input validated by Pydantic schemas
- [ ] No raw SQL queries (use SQLAlchemy ORM)
- [ ] Secrets loaded from environment variables
- [ ] Passwords hashed (never plain text)
- [ ] JWT tokens validated on every request
- [ ] No sensitive data in error messages

### Examples

❌ **Missing Auth:**
```python
@router.delete("/books/{id}")
async def delete_book(id: int):
    # Anyone can delete!
    db.delete(book)
```

✅ **With Auth:**
```python
@router.delete("/books/{id}")
async def delete_book(
    id: int,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.admin:
        raise HTTPException(403, "Admin only")
    db.delete(book)
```

❌ **Hardcoded Secret:**
```python
SECRET_KEY = "my-secret-key-123"
```

✅ **From Environment:**
```python
import os
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY not set")
```

❌ **SQL Injection Risk:**
```python
query = f"SELECT * FROM books WHERE title = '{user_input}'"
db.execute(query)
```

✅ **Parameterized Query:**
```python
books = db.query(Book).filter(Book.title == user_input).all()
```

### Findings Template

```markdown
| File | Line | Area | Severity | Finding |
|------|------|------|----------|---------|
| backend/app/routers/books.py | 89 | Security | error | Missing JWT auth dependency on DELETE endpoint |
| backend/app/config.py | 5 | Security | error | SECRET_KEY hardcoded instead of os.getenv() |
```

---

## Area 3: Error Handling

### Required Error Cases

Every endpoint must handle:
- **404 Not Found** - Resource doesn't exist
- **409 Conflict** - State conflict (e.g., already borrowed)
- **401 Unauthorized** - Missing/invalid JWT
- **403 Forbidden** - Valid JWT, wrong role
- **422 Validation Error** - Invalid input (Pydantic auto-handles)

### Examples

❌ **Missing Error Handling:**
```python
@router.get("/books/{id}")
async def get_book(id: int):
    book = db.query(Book).filter(Book.id == id).first()
    return book  # Returns None if not found - wrong!
```

✅ **With Error Handling:**
```python
@router.get("/books/{id}")
async def get_book(id: int):
    book = db.query(Book).filter(Book.id == id).first()
    if not book:
        raise HTTPException(404, f"Book with id {id} not found")
    return book
```

❌ **Generic Error Message:**
```python
except Exception as e:
    raise HTTPException(500, "Error")
```

✅ **Specific Error Message:**
```python
except ValueError as e:
    raise HTTPException(400, f"Invalid input: {str(e)}")
except BookNotAvailableError:
    raise HTTPException(409, "Book is not available for borrowing")
```

### Checklist

- [ ] 404 for missing resources
- [ ] 409 for conflicts (duplicate, already exists, etc.)
- [ ] 400 for invalid input beyond Pydantic validation
- [ ] Human-readable error messages
- [ ] No unhandled exceptions that return 500

### Findings Template

```markdown
| File | Line | Area | Severity | Finding |
|------|------|------|----------|---------|
| backend/app/routers/books.py | 67 | Error Handling | error | No 404 check when book not found |
| backend/app/routers/borrow.py | 34 | Error Handling | error | No 409 handling for duplicate borrow |
```

---

## Area 4: Test Coverage

### Required Tests

For every endpoint:
- ✅ Happy path test (200/201 success)
- ✅ 404 Not Found test
- ✅ 401 Unauthorized test (if auth required)
- ✅ 403 Forbidden test (if role-based)
- ✅ 409 Conflict test (if applicable)
- ✅ 422 Validation test (invalid input)

### Examples

❌ **Only Happy Path:**
```python
def test_delete_book(client, admin_token):
    response = client.delete("/books/1", headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 204
    # Missing: 404, 401, 403 tests
```

✅ **Complete Coverage:**
```python
def test_delete_book_success(client, admin_token):
    response = client.delete("/books/1", headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 204

def test_delete_book_not_found(client, admin_token):
    response = client.delete("/books/99999", headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 404

def test_delete_book_unauthorized(client):
    response = client.delete("/books/1")
    assert response.status_code == 401

def test_delete_book_forbidden(client, member_token):
    response = client.delete("/books/1", headers={"Authorization": f"Bearer {member_token}"})
    assert response.status_code == 403
```

### Checklist

- [ ] At least one test per endpoint
- [ ] Tests cover happy path
- [ ] Tests cover all error cases (404, 401, 403, 409, 422)
- [ ] Edge cases tested (boundary values, empty results, etc.)
- [ ] Frontend: Tests cover UI interactions AND API calls

### Findings Template

```markdown
| File | Line | Area | Severity | Finding |
|------|------|------|----------|---------|
| backend/tests/test_books.py | - | Test Coverage | error | No 404 test case for GET /books/{id} |
| backend/tests/test_borrow.py | - | Test Coverage | error | No 409 conflict test for duplicate borrow |
```

---

## Area 5: Code Clarity

### Checks (Non-Blocking)

- Variable names are descriptive
- Function names describe what they do
- Complex logic has explanatory comments
- No magic numbers without explanation
- Consistent naming conventions

### Examples

❌ **Unclear:**
```python
def process(x, y):
    z = x * y * 0.12
    return z
```

✅ **Clear:**
```python
def calculate_late_fee(days_overdue: int, daily_rate: float) -> float:
    TAX_RATE = 0.12
    subtotal = days_overdue * daily_rate
    total_with_tax = subtotal * (1 + TAX_RATE)
    return total_with_tax
```

### Severity: 🟡 Warning (Not Blocking)

These are suggestions for improvement but don't block PR approval.

### Findings Template

```markdown
| File | Line | Area | Severity | Finding |
|------|------|------|----------|---------|
| backend/app/routers/books.py | 78 | Code Clarity | warning | Variable name `x` is not descriptive, suggest `available_copies` |
```

---

## Area 6: DRY Principle

### Checks (Non-Blocking)

- No copy-paste code
- Shared logic extracted to helpers
- Common patterns use utilities/dependencies

### Examples

❌ **Duplicated:**
```python
# In routers/books.py
if not book:
    raise HTTPException(404, "Book not found")

# In routers/authors.py
if not author:
    raise HTTPException(404, "Author not found")

# In routers/users.py
if not user:
    raise HTTPException(404, "User not found")
```

✅ **Extracted:**
```python
# In utils/errors.py
def raise_not_found(entity: str, id: int):
    raise HTTPException(404, f"{entity} with id {id} not found")

# Usage
raise_not_found("Book", book_id)
raise_not_found("Author", author_id)
```

### Severity: 🟡 Warning (Not Blocking)

### Findings Template

```markdown
| File | Line | Area | Severity | Finding |
|------|------|------|----------|---------|
| backend/app/routers/books.py | 45-48 | DRY | warning | Pagination logic duplicated from users router, extract to common utility |
```

---

## Area 7: Dependency Safety

### Checks

- No known vulnerabilities (CVEs)
- Versions pinned (not `package>=1.0`)
- Unnecessary dependencies removed

### How to Check

```bash
# Python
pip list --outdated
pip-audit  # Check for vulnerabilities

# Node
npm audit
npm outdated
```

### Findings Template

```markdown
| File | Line | Area | Severity | Finding |
|------|------|------|----------|---------|
| backend/requirements.txt | 12 | Dependency Safety | error | requests==2.25.0 has CVE-2023-32681, upgrade to 2.31.0+ |
```

---

## Severity Levels

| Severity | Symbol | Meaning | Blocks PR? |
|----------|--------|---------|------------|
| **error** | 🔴 | MUST fix before merge | ✅ Yes |
| **warning** | 🟡 | SHOULD fix but not blocking | ❌ No |
| **info** | 🟢 | Nice to have, suggestion | ❌ No |

---

## Review Process

1. **Capture diff**: `git diff` or `git diff --cached`
2. **Apply 7 areas**: Check each area systematically
3. **Record findings**: Use table format
4. **Count errors**: Sum 🔴 errors
5. **Gate decision**: 
   - 0 errors → ✅ APPROVED
   - >0 errors → ❌ BLOCKED
6. **Write code-review.md**: Full review document
7. **Report gate status**: Show to user

---

## Final Checklist

Before completing review:

- [ ] Checked all 7 areas
- [ ] Every changed file reviewed
- [ ] All findings recorded in table
- [ ] Severity assigned correctly
- [ ] Gate decision made (APPROVED/BLOCKED)
- [ ] code-review.md written
- [ ] User informed of next steps

---

## Output Format

```markdown
# Code Review: REQ-XXX

**Gate**: ✅ APPROVED | ❌ BLOCKED

## Summary
[2-3 sentences about code quality]

## Findings
| File | Line | Area | Severity | Finding |
|------|------|------|----------|---------|
| ... | ... | ... | ... | ... |

**Total**: X errors, Y warnings, Z info

## Gate Decision
> **✅ APPROVED** | **❌ BLOCKED**

[Rationale]

**Blockers** (if any):
- [ ] Fix auth on DELETE endpoint
- [ ] Add 404 test case

**Warnings**:
- Improve variable naming

## Next Steps
✅ APPROVED → Proceed to testing: @verify-test
❌ BLOCKED → Fix errors, then: @code-review-assistant
```
