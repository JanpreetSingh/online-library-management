# Confluence Test Publisher Agent

## Overview

The `confluence-test-publisher` agent automatically publishes Playwright test execution summaries to your Confluence TEST SUMMARY page. It extracts metrics from test reports and updates a structured table with all relevant test data.

## Purpose

After tests are executed, this agent:
1. Reads the test execution report
2. Extracts key metrics (UI tests, API tests, pass/fail counts)
3. Updates the Confluence TEST SUMMARY page
4. Maintains a historical record of all test executions

## Target Confluence Page

- **URL**: https://kb.epam.com/spaces/~janpreetsingh_jolly@epam.com/pages/2829894900/TEST+SUMMARY-Online+Library+Management
- **Page ID**: 2829894900
- **Space**: ~janpreetsingh_jolly@epam.com

## Prerequisites

1. **Confluence MCP Tools**: Ensure `confluence/*` MCP tools are configured
2. **Test Report**: A test execution report must exist (e.g., `TEST-EXECUTION-REPORT.md`)
3. **Permissions**: User must have edit access to the Confluence page

## Usage

### Option 1: Called by SDLC Orchestrator

The agent is typically invoked automatically by the `sdlc-orchestrator` after tests complete:

```
sdlc-orchestrator → verify-test → confluence-test-publisher
```

### Option 2: Manual Invocation

You can manually invoke the agent through GitHub Copilot:

```
@confluence-test-publisher publish test summary for EPMCDMETST-40786
```

Or provide the report path:

```
@confluence-test-publisher TEST-EXECUTION-REPORT.md
```

### Option 3: With Explicit Metrics

Provide metrics directly if no report file exists:

```json
{
  "userStoryId": "EPMCDMETST-40786",
  "feature": "FR-3.1 - Borrow a Book",
  "testDate": "2026-05-15",
  "uiTests": 6,
  "apiTests": 9,
  "totalTests": 15,
  "passed": 15,
  "failed": 0,
  "passPercentage": 100,
  "status": "PRODUCTION READY"
}
```

## What Gets Published

The agent updates a Confluence table with the following columns:

| Column | Description | Example |
|--------|-------------|---------|
| User Story ID | JIRA ticket ID | EPMCDMETST-40786 |
| Feature | Feature name/description | FR-3.1 - Borrow a Book |
| Test Date | Execution date | 2026-05-15 |
| UI Tests | Number of UI test cases | 6 |
| API Tests | Number of API test cases | 9 |
| Total Tests | Total test cases | 15 |
| Passed | Tests passed | 15 |
| Failed | Tests failed | 0 |
| Pass % | Pass percentage | 100% |
| Status | Overall status | ✅ PRODUCTION READY |

## Status Colors

The agent uses Confluence status macros with color coding:

- 🟢 **Green**: Passed tests, PRODUCTION READY
- 🔴 **Red**: Failed tests, FAILED, BLOCKED
- 🔵 **Blue**: UI/API test counts
- 🟡 **Yellow**: IN PROGRESS, warnings

## Example Output

```
✅ Test Summary Published to Confluence

User Story: EPMCDMETST-40786
Feature: FR-3.1 - Borrow a Book
Test Date: 2026-05-15

Test Metrics:
  UI Tests:     6
  API Tests:    9
  Total Tests:  15
  Passed:       15 ✅
  Failed:       0
  Pass Rate:    100%
  Status:       ✅ PRODUCTION READY

Confluence Page:
https://kb.epam.com/spaces/~janpreetsingh_jolly@epam.com/pages/2829894900

Action Taken: New entry created
Page Version: 42 → 43
```

## Features

### 1. Duplicate Detection
- Automatically detects if a user story already has an entry
- Updates existing entry instead of creating duplicates

### 2. Table Sorting
- Entries are sorted by test date (newest first)
- Easy to see latest test results

### 3. Table Creation
- If page has no table, creates the structure automatically
- Preserves all existing content

### 4. Version Management
- Properly increments Confluence page version
- Handles version conflicts gracefully

### 5. Metric Extraction
- Intelligently parses test reports
- Distinguishes between UI and API tests
- Calculates pass percentage automatically

## Test Report Format

The agent can extract metrics from reports structured like this:

```markdown
# Test Execution Report - EPMCDMETST-40786
## FR-3.1: Borrow a Book Feature

### Overall Test Results
- Total Tests Executed: 15
- Passed: 15 (100%)
- Failed: 0

### 1. Deployment Verification Tests (6/6 Passed)
...

### 2. API Integration Tests (5/5 Passed)
...

### 3. Business Rules Verification (4/4 Passed)
...
```

## Error Handling

### Authentication Error
```
❌ Confluence authentication failed
→ Check MCP tools configuration
→ Verify user permissions
```

### Parse Error
```
❌ Could not extract metrics from report
→ Provide explicit metrics via JSON
```

### Update Error
```
❌ Page update failed: Version conflict
→ Retry with latest version
```

### Manual Fallback
If automation fails, the agent provides a formatted table row for manual copy-paste.

## Integration with SDLC

```
┌─────────────────────┐
│ Feature Developer   │
│ (implements FR-3.1) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Playwright Runner   │
│ (writes & runs      │
│  E2E tests)         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Confluence Test     │◄── YOU ARE HERE
│ Publisher           │
│ (publishes summary) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ PR Creator          │
│ (creates PR)        │
└─────────────────────┘
```

## Related Files

- **Agent Definition**: `.github/agents/confluence-test-publisher.agent.md`
- **Skill Definition**: `.github/skills/confluence-test-publish/SKILL.md`
- **Test Report Template**: `TEST-EXECUTION-REPORT.md`
- **Orchestrator**: `.github/agents/sdlc-orchestrator.agent.md`

## Configuration

The agent uses these constants (defined in agent file):

```yaml
CONFLUENCE_PAGE_ID: 2829894900
CONFLUENCE_SPACE: ~janpreetsingh_jolly@epam.com
TABLE_COLUMNS: 10
STATUS_COLORS:
  pass: Green
  fail: Red
  info: Blue
  warning: Yellow
```

## Best Practices

1. **Always run after tests**: Don't publish until tests complete
2. **Verify report exists**: Check `TEST-EXECUTION-REPORT.md` is present
3. **Check permissions**: Ensure you can edit the Confluence page
4. **Review before publish**: Verify metrics are correct
5. **Monitor for errors**: Watch for authentication or network issues

## Troubleshooting

### Issue: "Confluence tools not found"
**Solution**: Configure Confluence MCP tools in your environment

### Issue: "Report file not found"
**Solution**: Ensure `TEST-EXECUTION-REPORT.md` exists or provide explicit metrics

### Issue: "Permission denied"
**Solution**: Request edit access to page 2829894900 from page owner

### Issue: "Version conflict"
**Solution**: Another user edited the page; agent will retry with latest version

## Example Session

```bash
# 1. Tests complete
✅ 15/15 tests passed

# 2. Agent publishes to Confluence
@confluence-test-publisher TEST-EXECUTION-REPORT.md

# 3. Confirmation
✅ Test Summary Published
   Page: https://kb.epam.com/spaces/.../2829894900
   Entry: EPMCDMETST-40786 added

# 4. Verify in browser
Navigate to Confluence page to see the new entry
```

## Support

For issues or questions:
1. Check the error message and suggested fixes
2. Review this README and skill documentation
3. Check Confluence page permissions
4. Verify MCP tools configuration
5. Contact the repository maintainer

---

**Last Updated**: 2026-05-15  
**Version**: 1.0  
**Maintainer**: GitHub Copilot Agents Team
