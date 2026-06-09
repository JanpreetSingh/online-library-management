# Instructions vs Memory: Understanding the Difference

**TL;DR**: Instructions = **HOW** to do tasks | Memory = **WHY** we do things a certain way

---

## Side-by-Side Comparison

| Aspect | Instructions | Memory |
|--------|--------------|--------|
| **Purpose** | Step-by-step procedures | Persistent context & preferences |
| **Content** | Task execution workflows | Project history, decisions, patterns |
| **Changes** | Rarely (process changes) | Often (team learns & evolves) |
| **Scope** | How to execute tasks | Why we make certain choices |
| **Format** | Numbered steps, checklists | Context, rationale, "why" statements |
| **Loaded** | On-demand by agents | Automatically in conversations |
| **Example** | "Step 1: Read REQUIREMENTS.md..." | "Test coverage ≥90% because we had prod incidents" |

---

## Real Examples

### Instructions Example

**File**: `.claude/instructions/requirements-document.md`

```markdown
# Instructions: Requirements Document

## Step 3: Clarify (Critical)

Ask grouped questions using AskUserQuestion for missing testable details:

Focus areas:
- Scope boundaries (what's in/out)
- Role permissions (who can do what)
- Error cases (what should fail and how)
- Data validation rules

Example:
Ask: "What happens when a user tries to borrow an already-borrowed book?"
Options:
- Show error message (Return 409 Conflict)
- Add to waitlist (Queue the request)
```

**Purpose**: Tells the agent **HOW** to clarify requirements during the task

---

### Memory Example

**File**: `.claude/memory/testing-standards.md`

```markdown
---
name: testing-standards
type: project
---

Test verification has mandatory thresholds that gate PR creation:
- Unit tests: ≥ 90% pass rate required
- E2E tests: ≥ 80% pass rate required

**Why:** Previous production incidents caused by insufficient test coverage. 
These thresholds ensure quality before merge.

**How to apply:** 
- Always run @verify-test before creating PRs
- If below thresholds, fix failing tests before proceeding
```

**Purpose**: Tells the agent **WHY** we require these thresholds and remembers the history

---

## When to Use What

### Use Instructions For:

✅ **Process Steps**
```markdown
# Instructions: Code Review

## Step 2: Apply 7-Area Checklist

1. Correctness - Does code match requirements?
2. Security - Are there vulnerabilities?
3. Error Handling - Are failures handled?
...
```

✅ **Templates & Formats**
```markdown
## API Contract Template

### GET /api/books/{id}
**Auth**: member, librarian, admin
**Response 200**: BookResponse
**Response 404**: "Book not found"
```

✅ **Validation Checklists**
```markdown
## Before Finalizing

- [ ] Every FR has at least 2 ACs
- [ ] Every AC is testable
- [ ] NFRs include measurable thresholds
```

✅ **Examples (Good vs Bad)**
```markdown
❌ Bad: var x = getData();
✅ Good: const availableBooks = getAvailableBooks();
```

---

### Use Memory For:

✅ **Why Decisions Were Made**
```markdown
Use `!= UserRole.member` for librarian/admin checks.

**Why:** Explicit inequality pattern is clearer than 
`== UserRole.librarian || == UserRole.admin`

**How to apply:** When checking for elevated privileges,
use `user.role != UserRole.member` pattern.
```

✅ **Team Preferences**
```markdown
Code review 🔴 errors BLOCK PRs. Warnings don't.

**Why:** Security and correctness issues have caused 
production incidents. Warnings improve quality but 
don't risk user data.
```

✅ **Historical Context**
```markdown
Test thresholds: Unit ≥90%, E2E ≥80%

**Why:** Previous incident where 70% test coverage 
allowed a critical bug to reach production.
```

✅ **Project-Specific Patterns**
```markdown
Jira project key is LIB (not EPMCDMETST for features)

**How to apply:** When user provides LIB-XX ticket,
try Jira MCP first. If unavailable, ask for paste.
```

---

## How They Work Together

### Example: Code Review Task

**Agent** (`code-review-assistant`):
```markdown
You review code changes using a 7-area checklist.

Follow the procedure in `.claude/instructions/code-review-checklist.md`

Apply severity rules from `.claude/memory/code-review-preferences.md`
```

**Instructions** (`.claude/instructions/code-review-checklist.md`):
```markdown
## Area 2: Security

### Checklist
- [ ] All protected routes have Depends(get_current_user)
- [ ] Role guards check user.role correctly
- [ ] No hardcoded secrets

### Examples
❌ Missing Auth:
@router.delete("/books/{id}")
async def delete_book(id: int):
    # Anyone can delete!

✅ With Auth:
@router.delete("/books/{id}")
async def delete_book(
    id: int,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.admin:
        raise HTTPException(403)
```

**Memory** (`.claude/memory/code-review-preferences.md`):
```markdown
Code review findings have three severity levels:

🔴 error (BLOCKS PR):
- Security issues (missing auth, secrets in code)
- Missing tests
- Correctness issues

**Why:** Security and correctness issues have caused 
production incidents. Tests prevent regressions.

**How to apply:** Any 🔴 errors mean gate is ❌ BLOCKED.
Fix errors before proceeding to testing.
```

**Result**: Agent knows:
- **HOW** to review (from instructions)
- **WHY** certain things block (from memory)
- Combines both for effective review

---

## Benefits of Separation

### 1. Cleaner Agents
**Before** (everything in agent):
```markdown
# Agent: 200 lines of procedures + examples + context
```

**After** (separated):
```markdown
# Agent: 50 lines (orchestration)
# Instructions: 150 lines (how-to)
# Memory: 20 lines (why)
```

### 2. Reusability
**Instructions** can be referenced by multiple agents:
- `requirements-assistant` uses `requirements-document.md`
- `architecture-design` references same requirement format
- Both stay in sync automatically

**Memory** applies across all conversations:
- Testing thresholds remembered for all features
- Commit style consistent across all PRs

### 3. Maintainability
**Update once, benefit everywhere:**
- Change requirements format? Update one instruction file
- Team learns new pattern? Add one memory file
- All agents automatically use updated procedures

---

## Directory Structure

```
.claude/
├── agents/              ← What to do (orchestration)
│   ├── requirements-assistant.md
│   ├── code-review-assistant.md
│   └── ...
│
├── instructions/        ← How to do it (procedures)
│   ├── requirements-document.md
│   ├── code-review-checklist.md
│   └── ...
│
├── memory/             ← Why we do it (context)
│   ├── testing-standards.md
│   ├── code-review-preferences.md
│   └── ...
│
└── skills/             ← Quick operations (no procedures needed)
    ├── run-tests.md
    └── ...
```

---

## Quick Decision Guide

When adding content, ask:

**"Is this a step-by-step procedure?"**
- YES → Instructions
- NO → Keep reading

**"Is this explaining why we do something?"**
- YES → Memory
- NO → Keep reading

**"Is this project-wide context?"**
- YES → CLAUDE.md or Memory
- NO → Keep reading

**"Is this agent-specific orchestration?"**
- YES → Agent file
- NO → Reconsider

---

## Common Mistakes

### ❌ Wrong: Putting Procedures in Memory
```markdown
# memory/code-review-process.md ← Wrong location!

Step 1: Run git diff
Step 2: Check for security issues
...
```
**Fix**: This is a procedure → Move to instructions/

### ❌ Wrong: Putting Context in Instructions
```markdown
# instructions/requirements.md

We require testable ACs because we had a 
production incident in Q2 2025...
```
**Fix**: This is context/history → Move to memory/

### ❌ Wrong: Embedding Instructions in Agents
```markdown
# agents/code-review-assistant.md (300 lines)

Step 1: Run git diff
Step 2: Check for security:
- Missing auth
- Hardcoded secrets
...
(150 lines of detailed steps)
```
**Fix**: Extract to instructions/code-review-checklist.md

---

## Migration Checklist

If you find content in the wrong place:

- [ ] **Long procedures in agents?** → Extract to instructions/
- [ ] **"Why" context in instructions?** → Extract to memory/
- [ ] **Repeated procedures across agents?** → Consolidate in instructions/
- [ ] **Team preferences scattered?** → Consolidate in memory/

---

## Summary

| If You Need... | Use... | Example |
|---------------|--------|---------|
| Step-by-step how-to | **Instructions** | "Step 1: Read REQUIREMENTS.md" |
| Why we do things | **Memory** | "≥90% tests because of 2025 incident" |
| Project standards | **CLAUDE.md** | "Use Pydantic v2 ConfigDict" |
| Quick operations | **Skills** | `/run-tests` |
| Complex workflows | **Agents** | `@orchestrator-sdlc` |

**Golden Rule**: Instructions teach **processes**, Memory remembers **context**, Agents **orchestrate** both.

---

**Version**: 2026-06-06  
**Status**: ✅ Both systems now implemented
