---
description: 'Confluence page format and parsing rules for the Online Library Management requirements page. Loaded when reading Confluence, extracting requirements, or parsing acceptance criteria.'
---

# Confluence Format Guidelines

## Expected Page Structure

The Online Library Requirements Confluence page follows this format:

```
h1. Online Library Management - Requirements

h2. <Module Name>  (e.g., "User Management", "Book Management")

h3. REQ-NNN: <Requirement Title>
**Description**: ...
**Priority**: High | Medium | Low
**Acceptance Criteria**:
  * Criterion 1
  * Criterion 2
  * Criterion 3
```

## Parsing Rules

1. Every `h3` heading that starts with `REQ-` is a requirement
2. Bullet points under "Acceptance Criteria" are individual criteria — preserve exact wording
3. If `Priority` is missing, default to `medium`
4. If no REQ-ID prefix exists, auto-assign sequentially (`REQ-001`, `REQ-002`, ...)
5. Tables in a requirement section are additional context — include in `description`

## Normalization Output Schema

```json
{
  "id": "REQ-001",
  "title": "Short requirement title (from h3 heading)",
  "module": "Module name (from h2 heading)",
  "description": "Full description text",
  "acceptance_criteria": [
    "Criterion 1 (verbatim)",
    "Criterion 2 (verbatim)"
  ],
  "priority": "high | medium | low"
}
```

## Edge Cases

- If a page uses numbered lists instead of bullets for criteria → treat each numbered item as a criterion
- If a requirement spans multiple pages → fetch all pages and merge
- If Confluence content is in wiki markup → convert to plain text before parsing
- If a `status` macro is present (e.g., "Done", "In Progress") → capture as `confluence_status` field
