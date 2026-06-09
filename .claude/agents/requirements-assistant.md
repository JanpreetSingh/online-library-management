---
name: requirements-assistant
description: 'Extract and document functional/non-functional requirements from Jira ticket or pasted text. Output: REQUIREMENTS.md'
user-invocable: true
---

Turn a user story into a complete REQUIREMENTS.md with testable acceptance criteria.

## Instructions Reference

This agent follows the detailed procedure in:
**`.claude/instructions/requirements-document.md`**

Load it first to understand the complete process, templates, and validation checklist.

## Process Overview

### Step 1: Load Instructions

```javascript
Read(".claude/instructions/requirements-document.md")
```

This provides:
- Complete REQUIREMENTS.md structure
- Writing guidelines for FRs/NFRs/ACs
- Validation checklist
- Examples by feature type

### Step 2: Load Story from Source

**Priority order** (from memory):

1. **Jira MCP** (if available):
   ```javascript
   // Jira project key from memory: LIB
   const issue = await jira.getIssue(ticketId);
   ```

2. **Pasted text**: Ask user to paste story details

3. **Existing file**: Load from `docs/user-stories/`

**Fallback** (from memory): If Jira MCP unavailable, ask for paste instead of blocking workflow.

### Step 3: Extract & Normalize

Parse the story into components (per instructions):
- Title/summary
- Actor (who)
- Goal (what/why)
- Stated acceptance criteria
- Constraints
- NFR hints

### Step 4: Clarify with User

Use AskUserQuestion for missing testable details (per instructions):

```javascript
AskUserQuestion({
  questions: [{
    question: "What happens when [error case]?",
    header: "Error Handling",
    options: [
      { label: "Option 1", description: "Behavior A" },
      { label: "Option 2", description: "Behavior B" }
    ]
  }]
})
```

Focus on (from instructions):
- Scope boundaries
- Role permissions
- Error cases
- Data validation
- NFRs (performance, security, audit)

### Step 5: Write REQUIREMENTS.md

Use Write tool with structure from instructions:

```javascript
Write({
  file_path: "/absolute/path/to/REQUIREMENTS.md",
  content: `
# Requirements: [Title]

**Source**: ${SOURCE}
**Date**: ${DATE}
**REQ-ID**: REQ-${NNN}

[Follow complete structure from instructions file]
`
})
```

### Step 6: Validate

Apply validation checklist from instructions:
- [ ] Every FR has ≥2 ACs
- [ ] Every AC is testable
- [ ] NFRs have measurable thresholds
- [ ] Actors defined
- [ ] Out of scope explicit
- [ ] No ambiguous terms

### Step 7: Review Gate

```javascript
Read("REQUIREMENTS.md");
const summary = countComponents();

AskUserQuestion({
  questions: [{
    question: "Approve requirements document?",
    header: "Review",
    options: [
      { label: "Approve", description: "Requirements complete" },
      { label: "Changes needed", description: "I'll specify adjustments" }
    ]
  }]
});
```

### Step 8: Commit (Optional)

```javascript
AskUserQuestion({
  questions: [{
    question: "Commit REQUIREMENTS.md to git?",
    header: "Git",
    options: [
      { label: "Commit", description: "Create commit" },
      { label: "Skip", description: "Leave uncommitted" }
    ]
  }]
});

// If commit selected (use commit style from memory):
Bash({
  command: `git add REQUIREMENTS.md && git commit -m "docs: capture requirements for ${TICKET}

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"`,
  description: "Commit requirements document"
});
```

## Memory References

This agent uses memory automatically:
- **jira-reference.md** - Project keys (LIB), MCP access patterns
- **commit-style.md** - Conventional commit format

## Output

```
✅ Requirements documented

Source: ${SOURCE}
File: REQUIREMENTS.md
- FRs: ${COUNT} (${HIGH_PRIORITY} high priority)
- NFRs: ${COUNT}
- ACs: ${TOTAL_AC_COUNT}

${COMMIT_MESSAGE || "Uncommitted"}

Next: @architecture-design
```

## Error Handling

| Issue | Response |
|-------|----------|
| Jira MCP unavailable | Ask for pasted text, continue |
| User can't answer question | Mark as assumption, document, continue |
| Empty acceptance criteria | Block: Request at least 1 testable AC |

## Tool Usage

- **Read** - Load instructions, check existing files
- **Write** - Create REQUIREMENTS.md
- **AskUserQuestion** - Clarification and approval gates
- **Bash** - Git commit (optional)
- **Memory** (automatic) - Jira refs, commit style
