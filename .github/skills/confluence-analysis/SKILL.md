---
name: confluence-analysis
description: 'Extract and structure requirements from Confluence pages. Use when fetching requirements, reading Confluence content, parsing acceptance criteria, or preparing requirements for gap analysis. Triggers on: requirements, confluence, acceptance criteria, user stories.'
argument-hint: 'Confluence page URL or space/page title to extract requirements from'
---

# Skill: Confluence Requirement Extraction

## When to Use
- Fetching requirements from a Confluence page
- Parsing acceptance criteria from user stories
- Preparing structured requirement data for gap analysis or test case creation

## Procedure

1. **Connect** — Use `confluence/*` MCP tools to authenticate and fetch the target page
2. **Parse** — Extract all requirement blocks, user stories, and acceptance criteria
3. **Normalize** — Convert raw content into the standard requirement schema below
4. **Output** — Return as a JSON array; save to session memory if large

## Output Schema

```json
[
  {
    "id": "REQ-001",
    "title": "Short descriptive title",
    "description": "Full requirement description",
    "acceptance_criteria": ["Criterion 1", "Criterion 2"],
    "priority": "high | medium | low",
    "status": "not_implemented | partial | implemented"
  }
]
```

## Parsing Rules
- Each numbered/bulleted item under a heading like "Requirements" or "Acceptance Criteria" is one criterion
- If no explicit ID exists, auto-assign `REQ-NNN` sequentially
- Preserve original wording — do not paraphrase acceptance criteria
- If a page contains multiple sections, treat each section as a requirement group

## Reference Files
- [Confluence format guidelines](../../instructions/confluence-format.instructions.md)
