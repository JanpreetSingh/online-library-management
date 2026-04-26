---
description: 'Jira test case format and upload guidelines. Loaded when creating test cases, writing Given/When/Then scenarios, or uploading test cases to Jira for the Online Library Management project.'
---

# Jira Test Case Guidelines

## Format

All test cases must use **Given/When/Then** format:

```
Given: <precondition — system state and user role>
When:  <action the user performs>
Then:  <expected outcome, including UI feedback>
```

## Issue Fields

| Field | Value |
|-------|-------|
| Issue Type | Test |
| Summary | `TC-NNN: <short action description>` |
| Labels | `automation`, `regression`, `<REQ-ID>` |
| Priority | Match requirement priority |
| Description | Full Given/When/Then steps |
| Linked Requirement | REQ-ID in description and as a label |

## Naming Convention

`TC-NNN: <Role> <action> <subject>`  
Examples:
- `TC-001: Admin creates a new book`
- `TC-002: Member cannot delete a book`
- `TC-003: Guest views book list without login`

## Coverage Rules

- 1 acceptance criterion → minimum 1 test case
- Role-based features → one test case per role that has different permissions
- CRUD operations → separate test cases for each operation
- Every requirement must have at least one negative test (invalid input, unauthorized access)

## Labels

Always apply all three base labels:
- `automation` — indicates the test should be automated
- `regression` — included in regression suite
- `<REQ-ID>` — links to the requirement (e.g., `REQ-003`)

## Precondition Template

Standard preconditions by role:
- Admin: "User is logged in as admin (admin@library.com)"
- Librarian: "User is logged in as librarian"
- Member: "User is logged in as member"
- Guest: "User is not logged in"
- Common: "Application is running at http://localhost:3000"
