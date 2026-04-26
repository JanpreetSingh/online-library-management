---
description: 'Generate structured test cases for missing or partial requirements and upload them to Jira. Use after gap analysis, before starting feature development.'
name: create-testcases
agent: agent
tools: [jira/*]
---

# Create and Upload Jira Test Cases

You are performing Step 3 of the SDLC workflow: create test cases for all missing/partial requirements and upload them to Jira.

## Pre-conditions
- Gap analysis output with the list of missing/partial requirements is available

## Steps

1. For each missing or partial requirement:
   a. Apply the `jira-testcase` skill to generate test cases
   b. Cover every acceptance criterion with at least one test case
   c. Add at least one negative/edge case per requirement
   d. Use Given/When/Then format per the Jira guidelines

2. For each test case, create a Jira issue using `jira/*` MCP tools:
   - Issue type: **Test**
   - Labels: `automation`, `regression`, `<REQ-ID>`
   - Link to parent requirement in the description

3. After all uploads, output a summary table:

| Requirement ID | Jira Test Case Keys | Count |
|----------------|---------------------|-------|
| REQ-003        | LIB-45, LIB-46, LIB-47 | 3 |

4. Report total: "Created N test cases across M requirements in Jira"
