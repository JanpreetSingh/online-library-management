---
description: 'SDLC Step 5.7 — Break approved architecture into a prioritised implementation task list. Run after design review is approved and before feature development begins.'
mode: agent
---

# SDLC Step 5.7 — Implementation Planning

**Invoke agent**: `implementation-planning`

## Pre-conditions (must ALL be true before running)

| Check | Requirement |
|-------|-------------|
| `ARCHITECTURE.md` exists | Architecture design has been produced |
| `design-review.md` exists | Design review has been executed |
| Gate in `design-review.md` shows **✅ Approved** | No unresolved 🔴 errors remain |
| `REQUIREMENTS.md` exists | Acceptance criteria available for coverage check |

If any pre-condition is not met, stop and resolve it before proceeding.

## Invocation

```
@implementation-planning
```

To plan from a non-default architecture file:
```
@implementation-planning path/to/ARCHITECTURE.md
```

## Gate

| Result | Action |
|--------|--------|
| Coverage gaps = 0 | ✅ **Proceed to SDLC Step 6 — Feature Development** |
| Coverage gaps > 0 | 🔴 **Blocked** — update ARCHITECTURE.md to cover missing AC, then re-run |
| Any P1 task blocked | 🔴 **Blocked** — resolve dependency before assigning to developer |

## Next Step

After human approval of `implementation-plan.md`, proceed to:

**SDLC Step 6** → `@implementation` — implement tasks in TASK-N order, P1 first.
