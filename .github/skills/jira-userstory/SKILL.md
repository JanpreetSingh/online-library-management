---
name: jira-userstory
description: 'Convert missing/partial requirements into structured Jira User Stories and upload them. Use when creating user stories, uploading to Jira, writing acceptance criteria, or mapping requirements to Jira issues. Triggers on: user story, Jira, upload, acceptance criteria, As a user, so that.'
argument-hint: 'Requirement ID(s) or JSON array of requirements to convert to user stories'
---

# Skill: Jira User Story Creation & Upload

---

## Action 1: User Story Creation

### When to Use
- Turning a missing/partial requirement into a structured User Story narrative
- Writing acceptance criteria from a requirement's spec
- Preparing story content before uploading to Jira

### Trigger Phrases
- "Write a user story for REQ-NNN"
- "Write acceptance criteria for REQ-NNN"
- "Compose a user story from this requirement"

### Procedure

1. **Receive** — Accept the requirement (ID, title, description, acceptance criteria, priority) from the `confluence-analysis` skill output
2. **Compose the Summary** — Write the narrative in the format:
   > `As a <role>, I want <capability> so that <benefit>`
3. **Write the Description** — One paragraph explaining the requirement's purpose and context
4. **Write the Acceptance Criteria** — Write each criterion in **Gherkin format** (Given / When / Then), one scenario per acceptance criterion from the source requirement

   ```
   Given <precondition — system state and user role>
   When  <action the user performs>
   Then  <expected outcome, including UI feedback>
   ```

### User Story Schema

```json
{
  "summary": "As a <role>, I want <capability> so that <benefit>",
  "type": "User Story",
  "labels": ["AI-Generated", "<REQ-ID>"],
  "description": "<Context and purpose of the requirement>",
  "acceptance_criteria": [
    "Given the member is logged in / When they click Borrow on an available book / Then the system records the transaction",
    "Given the book is already borrowed / When the member attempts to borrow / Then an error message is shown"
  ],
  "priority": "high | medium | low",
  "requirement_id": "<REQ-ID>"
}
```

### Writing Rules
- Role in summary must be one of: `admin`, `librarian`, `member`, `guest`
- Acceptance criteria must be written in **Gherkin format** (Given / When / Then) — one scenario per criterion
- Do not paraphrase the source requirement intent — translate it faithfully into Gherkin
- One user story per requirement ID
- Priority must match the source requirement's priority field

---

## Action 2: Upload to Jira

### When to Use
- Uploading a composed User Story to Jira before design begins
- Bulk-uploading stories for all missing/partial requirements at once
- Labelling issues for traceability back to requirements

### Trigger Phrases
- "Upload user story to Jira"
- "Upload all missing user stories to Jira"
- "Label the Jira issue for REQ-NNN"
- "Show what was created in Jira"

### Procedure

1. **Create Issue** — Call `jira/*` MCP tools to create a new issue with:
   - Issue Type: `User Story`
   - Summary: the composed narrative from Action 1
   - Description: context paragraph + acceptance criteria bullets
   - Labels: `online-library`, `<REQ-ID>`
   - Priority: matching the source requirement
2. **Bulk Mode** — If a list of requirements is provided, repeat step 1 for each one sequentially
3. **Confirm** — After all uploads, return a summary table:

```
| Requirement ID | Jira Key | Summary                                      |
|----------------|----------|----------------------------------------------|
| REQ-003        | LIB-45   | As a member, I want to borrow a book...      |
| REQ-005        | LIB-47   | As an admin, I want to manage users...       |
```

End with: "Created N user stories in Jira."

---

## Reference Files
- [Jira guidelines](../../instructions/jira-guidelines.instructions.md)
