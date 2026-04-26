---
description: 'Fetch and structure all requirements from the Confluence requirements page for the Online Library Management project. Use when starting the SDLC workflow or refreshing requirements.'
name: fetch-requirements
agent: agent
tools: [confluence/*]
---

# Fetch Requirements from Confluence

You are performing Step 1 of the SDLC workflow: fetch all requirements from Confluence.

## Steps

1. Use the `confluence/*` MCP tools to connect to Confluence
2. Fetch the **Online Library Requirements** page (ask the user for the page URL/ID if not known)
3. Extract every requirement and acceptance criterion from the page
4. Apply the `confluence-analysis` skill to normalize the content
5. Output the complete structured requirements list as a JSON array

## Output Format

```json
[
  {
    "id": "REQ-001",
    "title": "...",
    "description": "...",
    "acceptance_criteria": ["..."],
    "priority": "high | medium | low"
  }
]
```

6. Save the output to a session note so it can be referenced by the gap analysis step
7. Report the total count: "Found N requirements"
