---
description: 'Generate structured Jira User Stories for missing or partial requirements and upload them to Jira. Use after gap analysis, before design begins.'
name: create-userstories
agent: agent
tools: [jira/*]
---

# Create and Upload Jira User Stories

You are performing Step 3 of the SDLC workflow: create User Stories for all missing/partial requirements and upload them to Jira.

## Pre-conditions
- Gap analysis output with the list of missing/partial requirements is available

## Steps

1. For each missing or partial requirement:
   a. Apply the `jira-userstory` skill to compose the User Story
   b. Write the summary in narrative form: `As a <role>, I want <capability> so that <benefit>`
   c. List all acceptance criteria (verbatim from the source requirement) as bullets
   d. Set priority to match the source requirement

2. For each user story, create a Jira issue using `jira/*` MCP tools:
   - Issue type: **User Story**
   - Labels: `online-library`, `<REQ-ID>`
   - Fields: Summary, Description (with acceptance criteria)

3. After all uploads, output a summary table:

| Requirement ID | Jira User Story Key | Summary |
|----------------|---------------------|---------|
| REQ-003        | LIB-45 | As a member, I want to borrow a book... |

4. Report total: "Created N user stories in Jira"
5. Store the REQ-ID → Jira key mapping for use in later steps (design, documentation)
