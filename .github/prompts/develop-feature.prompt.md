---
description: 'SDLC Step 6 — Implement all tasks from the approved implementation-plan.md sequentially, one at a time in priority order, until all are done. Run after implementation-plan.md is approved and before code review.'
mode: agent
---

# SDLC Step 6 — Feature Development

**Invoke agent**: `implementation`

## Pre-conditions (must ALL be true before running)

| Check | Requirement |
|-------|-------------|
| `implementation-plan.md` exists | Implementation planning has been completed |
| Human has approved `implementation-plan.md` | Task list confirmed before coding starts |
| `design-review.md` gate shows **✅ Approved** | No unresolved 🔴 errors in architecture |
| At least one task is `ready` or `not-started` | There is work to do |

If any pre-condition is not met, stop and resolve it before proceeding.

## Invocation

To implement all tasks from the beginning:
```
@implementation
```

To resume from a specific task after an interruption:
```
@implementation resume_from=TASK-5
```

The agent works through every task in P1 → P2 → P3 order, pausing after each task's git diff for human approval before moving to the next.

## Gate

| Result | Action |
|--------|--------|
| All tasks `done ✓` in `implementation-plan.md` | ✅ **Proceed to SDLC Step 7 — Code Review** (`@code-review`) |
| Human rejects a diff | 🔴 **Apply changes**, re-run `git diff`, re-present — then continue to next task |
| A `blocked` task is reached mid-run | ⚠️ **Pause** — resolve the blocking dependency, then resume with `@implementation resume_from=TASK-N` |
| Coverage gaps remain after all tasks done | 🔴 **Blocked** — update `implementation-plan.md` with missing tasks, then re-run |

> **Do NOT run `git add` or `git commit`.** The human commits when code review is approved.

## Next Step

After **all tasks** are `done ✓` in `implementation-plan.md`, proceed to:

**SDLC Step 7** → `@code-review` — review the full diff for security, correctness, and pattern compliance before committing.
