---
name: implementation-planning
description: 'Break an approved architecture down into a prioritised, dependency-ordered task list. Use when generating a task breakdown from ARCHITECTURE.md, ordering tasks by dependency, identifying blocked tasks, or producing implementation-plan.md before feature development begins. Triggers on: implementation plan, task breakdown, dependency order, blocked tasks, sprint plan.'
argument-hint: 'Optional path to the architecture file to plan from (e.g., ARCHITECTURE.md). Defaults to ARCHITECTURE.md at the project root if not provided.'
---

# Skill: Implementation Planning

## When to Use
- After design review is approved (SDLC Step 5.7)
- Breaking an architecture document into concrete, actionable development tasks
- Identifying task dependencies and blocked work before coding starts
- Producing a prioritised task list for the developer to execute in order

## Procedure

### 1. Read Architecture Source
- If a file path was passed as the argument, read that file
- Otherwise, fall back to `ARCHITECTURE.md` at the project root
- If neither exists, stop and report: `Architecture source not found. Run architecture-design first.`

### 2. Read Supporting Documents
- Read `REQUIREMENTS.md` to cross-reference acceptance criteria against planned tasks
- Read `design-review.md` if it exists — carry forward any open items as implementation notes on relevant tasks

### 3. Extract Work Items

From the architecture document, extract all discrete units of work across these areas:

| Area | What to Extract |
|------|----------------|
| **Database** | New tables, schema changes, migrations, constraints, indexes |
| **Backend models** | New SQLAlchemy model files |
| **Backend schemas** | New Pydantic v2 schema files |
| **Backend routers** | New or modified endpoint files |
| **Backend auth** | Changes to dependencies.py, jwt.py, passwords.py |
| **Backend tests** | pytest test files per new endpoint |
| **Frontend types** | New TypeScript interface files |
| **Frontend services** | New axios service files |
| **Frontend pages** | New or modified page components |
| **Frontend routing** | Route registration changes in App.tsx |
| **Configuration** | docker-compose, nginx, env changes |

### 4. Assign Dependencies and Priority

For each task:
- Assign a **priority** (P1 = must-do first / critical path, P2 = can start after P1 unblocked, P3 = parallel or optional)
- Assign **depends_on** (IDs of tasks that must complete first)
- Mark status as `ready` (no blockers) or `blocked` (waiting on another task)

Dependency rules:
- DB migration must complete before models, which must complete before schemas, which must complete before routers
- Backend router must exist before frontend service can be validated end-to-end
- Frontend types must exist before frontend service and pages
- Tests can be written in parallel with the router but must run after the router is complete

### 5. Produce the Task List

Format each task as:

```markdown
### TASK-N: <Title>
- **Area**: Backend / Frontend / Database / Config
- **Priority**: P1 / P2 / P3
- **Depends on**: TASK-X, TASK-Y (or "none")
- **Status**: ready / blocked
- **Files**:
  - `path/to/file.py` — create / modify
- **Description**: What exactly needs to be done
- **AC coverage**: Which acceptance criteria this task satisfies (e.g., AC-1, AC-4)
- **Open items from design-review**: Any relevant warnings or info items to address here
```

### 6. Write `implementation-plan.md`

Create or overwrite `implementation-plan.md` at the project root with the following structure:

```markdown
# Implementation Plan: <User Story Title>

## Source
Architecture: <path>
Requirements: REQUIREMENTS.md
Design Review: design-review.md (if exists)

## Summary
Total tasks: N
Critical path: TASK-1 → TASK-2 → ... → TASK-N
Blocked tasks: N (list IDs)
Estimated parallel tracks: N

## Critical Path
<Ordered list of tasks that must execute sequentially>

## Parallel Tracks
<Groups of tasks that can run concurrently once their dependencies are met>

## Task Breakdown
<All tasks in dependency order — P1 first, then P2, then P3>

## Blocked Tasks
<Tasks that cannot start until a dependency completes — list blocker and what is needed>
```

### 7. Validate Coverage

Cross-check the task list against `REQUIREMENTS.md` acceptance criteria:
- Every AC must be covered by at least one task
- Flag any AC with no corresponding task as a gap

If gaps are found, add a `## Coverage Gaps` section at the end of `implementation-plan.md`.

## Output Format

```
Implementation Planning complete.

Total tasks: N
Critical path length: N tasks
Parallel tracks: N
Blocked tasks: N
Coverage gaps: N (0 = all AC covered)

implementation-plan.md written to: <project-root>/implementation-plan.md
```
