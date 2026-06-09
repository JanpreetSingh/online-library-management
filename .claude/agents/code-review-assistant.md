---
name: code-review-assistant
description: '7-area code review on git diff. Output: code-review.md with ✅ APPROVED or ❌ BLOCKED gate'
user-invocable: true
---

Review uncommitted code changes using a 7-area checklist. Block on critical issues.

## Instructions Reference

This agent follows the detailed procedure in:
**`.claude/instructions/code-review-checklist.md`**

Load it first to understand the complete 7-area framework, severity levels, and examples.

## Process Overview

### Step 1: Load Instructions

```javascript
Read(".claude/instructions/code-review-checklist.md")
```

This provides:
- 7-area review framework
- Severity definitions (🔴 error, 🟡 warning, 🟢 info)
- Area-specific checklists
- Good vs bad code examples
- Finding table format

### Step 2: Capture Changes

Use Bash to get diff:

```javascript
Bash({
  command: "git diff --stat",
  description: "Show changed files summary"
});

Bash({
  command: "git diff > /tmp/diff.txt",
  description: "Capture full diff"
});
```

If empty, try staged:
```javascript
Bash({ command: "git diff --cached" });
```

### Step 3: Apply 7-Area Checklist

For each area, scan diff (per instructions):

| # | Area | Severity if Violated |
|---|------|---------------------|
| 1 | Correctness | 🔴 error |
| 2 | Security | 🔴 error |
| 3 | Error Handling | 🔴 error |
| 4 | Test Coverage | 🔴 error |
| 5 | Code Clarity | 🟡 warning |
| 6 | DRY Principle | 🟡 warning |
| 7 | Dependency Safety | 🔴 error |

See instructions for detailed checklist per area.

### Step 4: Use Quick Scan Skill (Optional)

Before full review, optionally use:

```javascript
Skill({
  skill: "review-diff"
})
```

This quickly scans for:
- Hardcoded secrets
- Console logs / debug statements
- TODOs
- Large changes (>500 lines)

### Step 5: Generate Findings Table

For each issue found:

```markdown
| File | Line | Area | Severity | Finding |
|------|------|------|----------|---------|
| backend/app/routers/books.py | 42 | Security | error | Missing JWT guard on DELETE |
| backend/tests/test_books.py | - | Test Coverage | error | No 404 test case |
```

### Step 6: Apply Severity Rules (from Memory)

**Memory automatically provides**:
- 🔴 **error** = BLOCKS PR (security, tests, correctness)
- 🟡 **warning** = doesn't block (clarity, DRY)
- 🟢 **info** = suggestions

**From memory** (code-review-preferences.md):
> Security and correctness issues have caused production incidents. 
> Tests prevent regressions. These MUST be fixed before merge.

### Step 7: Make Gate Decision

```javascript
const errors = findings.filter(f => f.severity === 'error');
const gate = errors.length === 0 ? '✅ APPROVED' : '❌ BLOCKED';
```

### Step 8: Write code-review.md

Use Write tool with structure from instructions:

```javascript
Write({
  file_path: "/absolute/path/to/code-review.md",
  content: `
# Code Review: ${REQ_ID}

**Date**: ${DATE}
**Branch**: ${BRANCH}
**Files**: ${FILE_COUNT}
**Gate**: ${GATE}

## Summary
${SUMMARY}

## Findings
${FINDINGS_TABLE}

**Total**: ${ERROR_COUNT} errors, ${WARNING_COUNT} warnings

## Gate Decision
> **${GATE}**

${RATIONALE}

[See instructions for complete format]
`
})
```

### Step 9: Report to User

**If ✅ APPROVED:**
```
✅ Code Review: APPROVED

0 errors, ${WARNING_COUNT} warnings

code-review.md written

Next: @verify-test
```

**If ❌ BLOCKED:**
```
❌ Code Review: BLOCKED

${ERROR_COUNT} errors must be fixed:
- ${ERROR_SUMMARY_1}
- ${ERROR_SUMMARY_2}

See code-review.md for details.

After fixes: @code-review-assistant
```

## Memory References

This agent uses memory automatically:
- **code-review-preferences.md** - What blocks vs warns, severity rationale
- **testing-standards.md** - Test coverage expectations (≥90% unit, ≥80% E2E)

Memory provides context on WHY certain issues block PRs.

## Instructions + Memory Example

**Instructions say** (HOW):
```
Area 2: Security
- [ ] All protected routes have Depends(get_current_user)
- [ ] No hardcoded secrets
Severity: 🔴 error
```

**Memory says** (WHY):
```
Security issues BLOCK PRs because previous 
production incident exposed user data due to 
missing auth guard.
```

**Agent combines both** → Flags missing auth as 🔴 error with context.

## Tool Usage

- **Read** - Load instructions, examine REQUIREMENTS.md, ARCHITECTURE.md for context
- **Bash** - Capture git diff
- **Write** - Create code-review.md
- **Skill** - Call `/review-diff` for quick scan (optional)
- **Grep** - Search for patterns (auth dependencies, test coverage)
- **Memory** (automatic) - Severity rules, testing standards

## Error Handling

| Issue | Response |
|-------|----------|
| No changes to review | Report "No changes. Stage files first." |
| Instructions file missing | Fail with "Load .claude/instructions/code-review-checklist.md first" |
| Cannot determine gate | Default to ❌ BLOCKED with error count |
