---
description: 'Update application documentation in Confluence after a feature is deployed. Use after deployment is confirmed healthy, as the final step before looping to the next user story. Step 10 of the SDLC workflow.'
name: document
agent: agent
tools: [confluence/*, read, search]
---

# Documentation: Update Confluence App Docs

You are performing Step 10 of the SDLC workflow: update the application documentation in Confluence to reflect the newly deployed feature.

## Pre-conditions
- Deployment (Step 9) confirmed healthy
- User story ID, title, and list of modified files are available from the orchestrator

## Steps

1. Accept from the orchestrator:
   - User story ID and title
   - List of files created/modified during implementation

2. Scan modified files using `read` and `search` tools to extract:
   - New API endpoints (path, method, auth requirement, response shape)
   - New UI pages or components (route path, purpose, required role)
   - Any new environment variables or config changes

3. Compose the documentation section:

```markdown
## Feature: <User Story Title>
**Requirement ID**: REQ-NNN  
**Jira**: LIB-XX  
**Status**: Deployed — <date>

### What was added
<Brief user-facing description>

### API Changes
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/... | member | ... |

### UI Changes
| Route | Page | Required Role | Description |
|-------|------|--------------|-------------|
| /... | XPage.tsx | member | ... |

### Environment / Config Changes
<List new env vars, or "None">
```

4. Append this section to the Confluence page titled `Application Documentation — Online Library Management` using `confluence/*` MCP tools. Do NOT overwrite existing content.

## Output

```
Documentation updated: "Application Documentation — Online Library Management"
Confluence URL: <url>
Section added: "Feature: <User Story Title>"

Awaiting human review.
```
