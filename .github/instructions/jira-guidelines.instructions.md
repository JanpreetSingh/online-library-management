---
description: 'Jira User Story format and upload guidelines. Loaded when creating user stories, writing acceptance criteria, or uploading user stories to Jira for the Online Library Management project.'
---

# Jira User Story Guidelines

## Format

All user stories must follow the standard narrative format:

```
As a <role>,
I want <capability or action>,
So that <business benefit or outcome>.
```

## Issue Fields

| Field | Value |
|-------|-------|
| Issue Type | User Story |
| Summary | `As a <role>, I want <capability> so that <benefit>` |
| Labels | `online-library`, `<REQ-ID>` |
| Priority | Match source requirement priority |
| Description | Context paragraph + Acceptance Criteria bullet list |
| Linked Requirement | REQ-ID included as a label |

## Naming Convention

Summary must follow the narrative format exactly:  
- `As a member, I want to borrow a book so that I can read it at home`
- `As an admin, I want to view all users so that I can manage accounts`
- `As a guest, I want to browse the book catalogue so that I can find books without registering`

## Acceptance Criteria Format

All acceptance criteria must be written in **Gherkin format** (Given / When / Then). List each scenario under a `h3. Acceptance Criteria` heading in the description:

```
h3. Acceptance Criteria

Given <precondition — system state and user role>
When  <action the user performs>
Then  <expected outcome, including UI feedback>

Given <precondition for next scenario>
When  <action>
Then  <expected outcome>
```

**Example:**
```
Given the member is logged in
When they click "Borrow" on an available book
Then the system records the borrow date and shows a confirmation message

Given the book is already borrowed
When the member attempts to borrow it
Then an error message "Book not available" is displayed
```

## Writing Rules

- Role must be one of: `admin`, `librarian`, `member`, `guest`
- Acceptance criteria must be in **Gherkin format** (Given / When / Then) — one scenario per criterion
- Do not paraphrase the source requirement intent — translate it faithfully into Gherkin
- One User Story per requirement ID
- Priority must match the source requirement
- Include the REQ-ID in both the label field and the description footer

## Labels

Always apply both base labels:
- `AI-Generated` — Suggests the issue was created by an AI agent
- `<REQ-ID>` — links to the source requirement (e.g., `REQ-003`)
