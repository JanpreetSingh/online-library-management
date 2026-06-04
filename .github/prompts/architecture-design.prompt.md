---
description: 'Produce architecture overview and API contract for a selected user story and publish to Confluence. Use when starting design for a requirement, before coding begins. Step 5 of the SDLC workflow.'
name: architecture-design
agent: agent
tools: [confluence/*, read, search, editFiles]
---

# Design: Architecture Overview & API Contract

You are performing Step 5 of the SDLC workflow: produce a design document for the selected user story and publish it to Confluence for human review.

## Pre-conditions
- User has approved a user story (REQ-ID and Jira key are known)
- Gap analysis confirmed this requirement is missing

## Steps

1. Read `REQUIREMENTS.md` at the project root to extract the user story, acceptance criteria, and functional/non-functional requirements.
2. Apply the `architecture-design` skill:
   - Load `architecture-design.instructions.md` for technology reference
   - Scan `backend/app/routers/`, `backend/app/schemas/`, `backend/app/models/`
   - Scan `frontend/src/pages/`, `frontend/src/services/`, `frontend/src/types/`
   - Identify every file to create or modify
   - Identify any database schema changes
3. Compose three sections:
   - **Section A — High-Level System Architecture**: Mermaid component diagram, technology choices, data flow, key components table
   - **Section B — Impacted Files**: files table (create/modify) + DB changes
   - **Section C — API Contract**: per-endpoint table (method, path, auth, request, response shapes)
4. Write `ARCHITECTURE.md` at the project root with all three sections.
5. Publish to Confluence page titled `Design: <User Story Title>` via `confluence/*` MCP tools. Include all sections.

## Output

```
Design published: "Design: <Title>"
Confluence URL: <url>

ARCHITECTURE.md written to: <project-root>/ARCHITECTURE.md

Architecture overview: N files modified, M files created
API contract: K endpoints specified

Awaiting human review and approval before coding begins.
```
