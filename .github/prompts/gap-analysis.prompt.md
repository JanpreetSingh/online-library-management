---
description: 'Compare the fetched Confluence requirements against the current codebase to identify what is implemented and what is missing. Use after fetching requirements, before creating test cases.'
name: gap-analysis
agent: agent
tools: [read, search]
---

# Gap Analysis: Requirements vs Codebase

You are performing Step 2 of the SDLC workflow: identify which requirements are missing from the current implementation.

## Pre-conditions
- Requirements JSON from the `fetch-requirements` prompt is available

## Steps

1. For each requirement in the requirements list:
   a. Search `backend/app/routers/` for related endpoints
   b. Search `frontend/src/pages/` and `frontend/src/services/` for related UI/service code
   c. Check `frontend/src/App.tsx` for registered routes
   d. Check `IMPLEMENTED_REQUIREMENTS.md` if it exists

2. Classify each requirement as:
   - `implemented` — fully present in both backend and frontend
   - `partial` — backend exists but no frontend (or vice versa)
   - `missing` — no code found for this requirement

3. Output two sections:

### ✅ Implemented Requirements
| ID | Title | Notes |
|----|-------|-------|

### ❌ Missing / Partial Requirements
| ID | Title | Status | Gap Description |
|----|-------|--------|-----------------|

4. Summarise: "N requirements fully implemented, M partial, K missing"
5. The missing/partial list becomes the input for the `create-userstories` prompt
