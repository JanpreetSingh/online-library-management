---
description: 'Produce architecture overview and API contract for a selected user story and publish to Confluence. Use when starting design for a requirement, before coding begins. Step 5 of the SDLC workflow.'
name: design
agent: agent
tools: [confluence/*, read, search]
---

# Design: Architecture Overview & API Contract

You are performing Step 5 of the SDLC workflow: produce a design document for the selected user story and publish it to Confluence for human review.

## Pre-conditions
- User has approved a user story (REQ-ID and Jira key are known)
- Gap analysis confirmed this requirement is missing

## Steps

1. Accept the user story (REQ-ID, title, acceptance criteria) from the orchestrator
2. Apply the `design` skill:
   - Scan `backend/app/routers/`, `backend/app/schemas/`, `backend/app/models/`
   - Scan `frontend/src/pages/`, `frontend/src/services/`, `frontend/src/types/`
   - Identify every file to create or modify
   - Identify any database schema changes
3. Compose two sections:
   - **Architecture Overview** — files table (create/modify) + DB changes
   - **API Contract** — per-endpoint table (method, path, auth, request, response shapes)
4. Publish to Confluence page titled `Design: <User Story Title>` via `confluence/*` MCP tools

## Output

```
Design published: "Design: <Title>"
Confluence URL: <url>

Architecture overview: N files modified, M files created
API contract: K endpoints specified

Awaiting human review and approval before coding begins.
```
