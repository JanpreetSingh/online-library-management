---
description: 'Structure and authoring rules for the root REQUIREMENTS.md document generated from a single user story.'
applyTo: "REQUIREMENTS.md"
---

# REQUIREMENTS.md Structure

## Purpose

- Document the final agreed functional and non-functional requirements for one user story
- Capture decisions, assumptions, and scope boundaries without reproducing the full chat log

## Required Sections

Use these headings in this order:

```markdown
# Requirements
## Source
## Original User Story
## Resolved Clarifications
## Functional Requirements
## Non-Functional Requirements
## Acceptance Criteria
## Assumptions and Constraints
## Out of Scope
```

## Authoring Rules

- Keep requirements atomic, testable, and implementation-agnostic unless the user explicitly requests a technical constraint
- Use numbered lists for `Functional Requirements`, `Non-Functional Requirements`, and `Acceptance Criteria`
- Use short bullet lists for `Resolved Clarifications`, `Assumptions and Constraints`, and `Out of Scope`
- If the source came from Jira or Confluence, record the identifier or URL in `Source`
- If information remains uncertain, record it under `Assumptions and Constraints` only after user acknowledgement
- Do not include tool traces, MCP details, or a transcript of the conversation
- Do not leave placeholder text in the final saved file

## Content Expectations

### Source

- include source type, reference, and capture date

### Original User Story

- include the original story in one short paragraph or quote block

### Resolved Clarifications

- list only the final decisions that changed or sharpened the source story

### Functional Requirements

- describe user-visible capability, business rules, validations, permissions, and error behavior

### Non-Functional Requirements

- include only relevant qualities such as security, performance, auditability, availability, usability, accessibility, compliance, or localization

### Acceptance Criteria

- phrase criteria as observable outcomes
- preserve source wording when already precise; otherwise rewrite for clarity without changing intent

## Template

```markdown
# Requirements

## Source
- Type:
- Reference:
- Captured:

## Original User Story
> ...

## Resolved Clarifications
- ...

## Functional Requirements
1. ...

## Non-Functional Requirements
1. ...

## Acceptance Criteria
1. ...

## Assumptions and Constraints
- ...

## Out of Scope
- ...
```