---
name: design-review
description: 'Conduct a structured design review of an architecture document before any production code is written. Use when reviewing ARCHITECTURE.md, identifying risks and gaps, documenting design decisions, or gating design before feature development. Triggers on: design review, architecture review, review architecture, risks, gaps, design decisions.'
argument-hint: 'Optional path to the design file to review (e.g., ARCHITECTURE.md). Defaults to ARCHITECTURE.md at the project root if not provided.'
---

# Skill: Design Review

## When to Use
- Reviewing an architecture document before coding starts (SDLC Step 5.5)
- Identifying security risks, completeness gaps, or consistency issues in a design
- Documenting agreed design decisions for traceability
- Gating the design: blocking 🔴 issues must be resolved before feature-dev begins

## Procedure

### 1. Read Design Source
- If a design file path was passed as the argument, read that file
- Otherwise, fall back to `ARCHITECTURE.md` at the project root
- If neither exists, stop and report: `Design source not found. Run architecture-design first.`

### 2. Read Requirements
- Read `REQUIREMENTS.md` at the project root
- Extract: user story, acceptance criteria, functional requirements, non-functional requirements
- Build a checklist of every requirement that the design must address

### 3. Review Against Five Categories

Evaluate the design systematically:

| Category | What to Check |
|----------|--------------|
| **Completeness** | Every acceptance criterion from REQUIREMENTS.md has a corresponding design element (endpoint, data flow step, model field, or UI component) |
| **Security** | Auth guards (JWT Bearer) on every non-public endpoint; no secrets in design docs; OWASP Top 10 risks (broken auth, injection, excess data exposure) called out where relevant |
| **Consistency** | Stack matches project conventions — FastAPI routers, Pydantic v2 schemas, SQLAlchemy 2.0 models, React hooks + Tailwind, axios service pattern |
| **Data Integrity** | Atomic operations identified for multi-step writes; race conditions addressed (e.g. `SELECT FOR UPDATE`); nullable FK risks noted; `available_copies` cannot go negative |
| **API Correctness** | HTTP status codes match REQUIREMENTS.md; request/response field names and types are complete; error response shapes include a `detail` field |

### 4. Produce Findings Table

Output a structured findings table:

```markdown
## Findings

| # | Risk / Gap | Category | Severity | Recommendation |
|---|-----------|----------|----------|----------------|
| 1 | `POST /api/borrow` has no rate-limiting mention | Security | ⚠️ warning | Document rate-limit strategy or note it is out of scope |
| 2 | AC-6 (concurrent borrow) not reflected in data flow | Completeness | 🔴 error | Add SELECT FOR UPDATE step to data flow |
| 3 | `due_date` field not in API contract response | API Correctness | ⚠️ warning | Add `due_date` to Response 200 shape |
```

Severity levels:
- 🔴 **error** — Must be resolved before coding starts (missing AC coverage, broken auth, data integrity risk)
- ⚠️ **warning** — Should be addressed but non-blocking
- ℹ️ **info** — Suggestion or documentation note

### 5. Determine Gate Status

- If **any 🔴 errors** are present:
  - List all errors clearly
  - State: `Design blocked. Resolve all 🔴 errors before feature development begins.`
  - Proceed to Step 7 to patch `ARCHITECTURE.md`
- If **only ⚠️ warnings and ℹ️ info**:
  - State: `Design approved with notes. Warnings should be tracked.`
  - Proceed to Step 6

### 6. Write `design-review.md`

Create or overwrite `design-review.md` at the project root with the following structure:

```markdown
# Design Review: <User Story Title>

## Review Date
<date>

## Design Source
<path to reviewed file>

## Summary
<gate status — approved / blocked>

## Findings
<findings table from Step 4>

## Agreed Design Decisions
<For each resolved finding, document the decision made:>
| Finding # | Decision |
|-----------|---------|
| 2 | Added SELECT FOR UPDATE to data flow step 9 in ARCHITECTURE.md |

## Open Items
<Warnings and info items not yet resolved — carry forward for implementation>
```

### 7. Patch `ARCHITECTURE.md` (if 🔴 errors found)

For each 🔴 error:
- Locate the relevant section in `ARCHITECTURE.md` (Data Flow, API Contract, Impacted Files, etc.)
- Apply the minimum change needed to resolve the finding
- Add a comment in `design-review.md` under "Agreed Design Decisions" noting what was changed and why

Do NOT rewrite `ARCHITECTURE.md` wholesale — make surgical, targeted edits only.

## Output Format

```
Design Review complete.

Gate status: ✅ Approved / 🔴 Blocked

Findings: N errors, M warnings, K info items

design-review.md written to: <project-root>/design-review.md
ARCHITECTURE.md patched: <yes — N changes / no>
```
