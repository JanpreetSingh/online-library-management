---
description: 'Conduct a structured design review of ARCHITECTURE.md and gate the design before feature development begins. SDLC Step 5.5 — runs after architecture-design (Step 5), before feature-dev (Step 6).'
name: design-review
agent: agent
tools: [read, search, editFiles]
---

# Design Review

You are performing **SDLC Step 5.5**: review the proposed architecture and gate the design before any production code is written.

## Pre-conditions
- `ARCHITECTURE.md` exists at the project root (Step 5 — `architecture-design` — is complete)
- `REQUIREMENTS.md` exists at the project root

## Steps

1. Invoke the `design-review` agent with `design_source = ARCHITECTURE.md`
2. The agent will:
   - Read the design and requirements
   - Review across 5 categories: Completeness, Security, Consistency, Data Integrity, API Correctness
   - Produce a findings table (🔴 error / ⚠️ warning / ℹ️ info)
   - Write `design-review.md` at the project root
   - Patch `ARCHITECTURE.md` if any 🔴 errors are found

## Gate

| Gate Status | Condition | Next Step |
|-------------|-----------|-----------|
| ✅ **Approved** | No 🔴 errors | Proceed to Step 6 (`develop-feature`) |
| 🔴 **Blocked** | Any 🔴 errors present | Resolve findings → re-run this prompt |

## Output

```
Design Review complete.

Gate status: ✅ Approved / 🔴 Blocked
Findings: N errors, M warnings, K info items

design-review.md written to: <project-root>/design-review.md
ARCHITECTURE.md patched: <yes — N changes / no>

Human approval required before feature development begins.
```
