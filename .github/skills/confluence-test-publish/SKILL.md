---
name: confluence-test-publish
description: 'Publish Playwright test execution summaries to Confluence TEST SUMMARY page. Extracts metrics from test reports and updates the Confluence table with structured test data. Use when publishing test results, updating test summary tables, reporting QA metrics, or syncing test execution status to Confluence.'
argument-hint: 'Path to test execution report (e.g., TEST-EXECUTION-REPORT.md) or user story ID'
---

# Skill: Confluence Test Summary Publisher

## When to Use
- After Playwright tests have been executed and report is generated
- When test execution summary needs to be published to Confluence
- To update the central TEST SUMMARY page with new test metrics
- To track test pass/fail rates across user stories

## Pre-conditions
- Test execution report exists (TEST-EXECUTION-REPORT.md or Playwright report)
- Confluence MCP tools are available (`confluence/*`)
- User has access to the target Confluence page (Page ID: 2829894900)

## Target Page
- **URL**: https://kb.epam.com/spaces/~janpreetsingh_jolly@epam.com/pages/2829894900/TEST+SUMMARY-Online+Library+Management
- **Page ID**: 2829894900
- **Space**: ~janpreetsingh_jolly@epam.com

## Procedure

### 1. Extract Test Metrics from Report

Read the test execution report and extract:
- **User Story ID**: JIRA ticket ID (e.g., EPMCDMETST-40786)
- **Feature Name**: Short description (e.g., FR-3.1 - Borrow a Book)
- **Test Date**: Execution date (YYYY-MM-DD)
- **UI Tests**: Number of UI/frontend test cases
- **API Tests**: Number of API/backend test cases
- **Total Tests**: Total test cases executed
- **Passed**: Number of tests passed
- **Failed**: Number of tests failed
- **Pass Percentage**: (Passed / Total) * 100
- **Status**: Overall status (PRODUCTION READY, FAILED, BLOCKED, IN PROGRESS)

**Example extraction logic:**
```typescript
// From TEST-EXECUTION-REPORT.md
const metrics = {
  userStoryId: "EPMCDMETST-40786",
  feature: "FR-3.1 - Borrow a Book",
  testDate: "2026-05-15",
  uiTests: 6,        // Count from "Deployment Verification Tests" section
  apiTests: 9,       // Count from "API Integration Tests" + "Business Rules" sections
  totalTests: 15,
  passed: 15,
  failed: 0,
  passPercentage: 100,
  status: "PRODUCTION READY"
};
```

### 2. Fetch Current Confluence Page

Use Confluence MCP tool:
```
confluence/get-page --page-id 2829894900
```

This returns the current page content in storage format (XML).

### 3. Parse Existing Table

Check if a test summary table exists:
- If table exists: Parse the current rows to check for duplicates
- If table doesn't exist: Prepare to create new table structure

**Table Structure:**
```
| User Story ID | Feature | Test Date | UI Tests | API Tests | Total Tests | Passed | Failed | Pass % | Status |
```

### 4. Prepare New Entry

Create a new table row using Confluence storage format:

```xml
<tr>
  <td><strong>EPMCDMETST-40786</strong></td>
  <td>FR-3.1 - Borrow a Book</td>
  <td>2026-05-15</td>
  <td><ac:structured-macro ac:name="status" ac:schema-version="1">
    <ac:parameter ac:name="colour">Blue</ac:parameter>
    <ac:parameter ac:name="title">6</ac:parameter>
  </ac:structured-macro></td>
  <td><ac:structured-macro ac:name="status" ac:schema-version="1">
    <ac:parameter ac:name="colour">Blue</ac:parameter>
    <ac:parameter ac:name="title">9</ac:parameter>
  </ac:structured-macro></td>
  <td><strong>15</strong></td>
  <td><ac:structured-macro ac:name="status" ac:schema-version="1">
    <ac:parameter ac:name="colour">Green</ac:parameter>
    <ac:parameter ac:name="title">15</ac:parameter>
  </ac:structured-macro></td>
  <td><ac:structured-macro ac:name="status" ac:schema-version="1">
    <ac:parameter ac:name="colour">Red</ac:parameter>
    <ac:parameter ac:name="title">0</ac:parameter>
  </ac:structured-macro></td>
  <td><strong>100%</strong></td>
  <td><ac:structured-macro ac:name="status" ac:schema-version="1">
    <ac:parameter ac:name="colour">Green</ac:parameter>
    <ac:parameter ac:name="title">PRODUCTION READY</ac:parameter>
  </ac:structured-macro></td>
</tr>
```

**Status Macro Colors:**
- Green: Pass counts, PRODUCTION READY
- Red: Fail counts, FAILED, BLOCKED
- Blue: UI/API test counts
- Yellow: IN PROGRESS, warnings

### 5. Check for Duplicates

Search for existing entry with the same User Story ID:
- If found: Replace the existing row with updated data
- If not found: Append new row to table

Sort entries by test date (newest first).

### 6. Update Confluence Page

Use Confluence MCP tool:
```
confluence/update-page --page-id 2829894900 --title "TEST SUMMARY-Online Library Management" --content <updated_xml> --version <current_version + 1>
```

**Important:**
- Must increment version number
- Preserve all existing content
- Use proper XML/HTML escaping

### 7. Verify Update

Fetch the page again to confirm:
```
confluence/get-page --page-id 2829894900
```

Check that the new entry appears in the table.

## Input Format

The orchestrator will call this skill with either:

**Option 1: Report path**
```
/confluence-test-publish TEST-EXECUTION-REPORT.md
```

**Option 2: Explicit metrics**
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

## Output Format

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

Action Taken: [New entry created | Existing entry updated]
Page Version: 42 → 43
```

## Error Handling

### Authentication Error
```
❌ Confluence authentication failed
→ Verify Confluence credentials are configured
→ Check user has edit permissions on page 2829894900
```

### Parse Error
```
❌ Could not extract metrics from report
Missing fields: [uiTests, apiTests]
→ Provide explicit metrics via JSON input
```

### Update Error
```
❌ Confluence page update failed: Version conflict
→ Page was modified by another user
→ Retry with latest version number
```

### Fallback: Manual Update
If automated update fails, provide formatted table row for manual copy-paste:
```
| EPMCDMETST-40786 | FR-3.1 - Borrow a Book | 2026-05-15 | 6 | 9 | 15 | 15 | 0 | 100% | PRODUCTION READY |
```

## Example Workflow

```bash
# 1. Run Playwright tests
npx playwright test

# 2. Generate report (already done by playwright-runner agent)
# TEST-EXECUTION-REPORT.md exists

# 3. Publish to Confluence
/confluence-test-publish TEST-EXECUTION-REPORT.md
```

## Table Creation (First Time)

If the Confluence page is empty or has no table, create this structure:

```xml
<h2>Test Execution Summary</h2>
<p>This page tracks test execution results for all user stories in the Online Library Management project.</p>
<p><strong>Last Updated:</strong> 2026-05-15</p>

<table data-layout="default">
  <tbody>
    <tr>
      <th><strong>User Story ID</strong></th>
      <th><strong>Feature</strong></th>
      <th><strong>Test Date</strong></th>
      <th><strong>UI Tests</strong></th>
      <th><strong>API Tests</strong></th>
      <th><strong>Total Tests</strong></th>
      <th><strong>Passed</strong></th>
      <th><strong>Failed</strong></th>
      <th><strong>Pass %</strong></th>
      <th><strong>Status</strong></th>
    </tr>
    <!-- Entries go here -->
  </tbody>
</table>
```

## Integration with SDLC Workflow

This skill is typically called by the `sdlc-orchestrator` after:
1. Feature is developed (`feature-developer` agent)
2. Tests are written and executed (`playwright-runner` agent)
3. Test report is generated

The workflow is:
```
sdlc-orchestrator 
  → feature-developer (implements feature)
  → playwright-runner (writes & runs tests)
  → confluence-test-publisher (publishes summary) ← THIS SKILL
  → pr-creator (creates pull request)
```

## Reference Files
- Test Report Template: [TEST-EXECUTION-REPORT.md](../../../TEST-EXECUTION-REPORT.md)
- Confluence Agent: [confluence-test-publisher.agent.md](../../agents/confluence-test-publisher.agent.md)
- Playwright Reports: `playwright-report/index.html`
