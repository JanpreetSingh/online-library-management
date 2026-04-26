---
name: jira-testcase
description: 'Convert requirements and acceptance criteria into structured Jira test cases and upload them. Use when creating test cases, uploading to Jira, writing Given/When/Then scenarios, or mapping requirements to test coverage. Triggers on: test case, Jira, upload, acceptance criteria, Given/When/Then.'
argument-hint: 'Requirement ID(s) or JSON array of requirements to convert to test cases'
---

# Skill: Jira Test Case Creation & Upload

## When to Use
- Converting a requirement's acceptance criteria into test cases
- Uploading test cases to Jira
- Verifying test coverage before starting feature development

## Procedure

1. **Receive** — Accept requirement JSON (from `confluence-analysis` skill output)
2. **Expand** — For each acceptance criterion, generate at least one test case (happy path). Add edge cases where applicable.
3. **Format** — Structure each test case per the schema below
4. **Upload** — Use `jira/*` MCP tools to create test case issues in the configured project
5. **Link** — Link each Jira test case to its parent requirement using the requirement ID as a label
6. **Confirm** — Return a summary of created Jira issue keys

## Test Case Schema

```json
{
  "title": "TC-NNN: <short action description>",
  "type": "Test",
  "labels": ["automation", "regression", "<REQ-ID>"],
  "preconditions": "User is logged in as <role>. App is running at http://localhost:3000.",
  "steps": [
    { "step": "1", "action": "Navigate to /books", "expected": "Books page loads" }
  ],
  "expected_result": "Overall expected outcome",
  "requirement_id": "REQ-001"
}
```

## Coverage Rules
- 1 acceptance criterion → minimum 1 test case
- Role-based features → one test case per relevant role
- CRUD operations → separate test cases for create, read, update, delete
- Always include at least one negative/edge case test per requirement

## Reference Files
- [Jira guidelines](../../instructions/jira-guidelines.instructions.md)
