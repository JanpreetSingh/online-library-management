# Confluence Integration for Test Summary Updates

This directory contains scripts for updating Confluence pages with test execution summaries.

## Overview

The `update_confluence_test_summary.py` script automatically updates the Confluence page with test results from Playwright test execution.

## Prerequisites

1. Python 3.7 or higher
2. `requests` library: `pip install requests`
3. Confluence API credentials (EPAM account)

## Setup

### Step 1: Install Dependencies

```bash
pip install requests
```

### Step 2: Get Confluence API Token

1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Give it a name (e.g., "Online Library Management - Test Updates")
4. Copy the generated token

### Step 3: Set Environment Variables

#### On Windows (PowerShell):
```powershell
$env:CONFLUENCE_EMAIL = "your.email@epam.com"
$env:CONFLUENCE_API_TOKEN = "your-api-token-here"
```

#### On Windows (Command Prompt):
```cmd
set CONFLUENCE_EMAIL=your.email@epam.com
set CONFLUENCE_API_TOKEN=your-api-token-here
```

#### On Linux/Mac:
```bash
export CONFLUENCE_EMAIL="your.email@epam.com"
export CONFLUENCE_API_TOKEN="your-api-token-here"
```

### Step 4: Run the Script

```bash
python scripts/update_confluence_test_summary.py
```

## Configuration

The script is configured with the following defaults:

- **Confluence URL**: https://kb.epam.com
- **Page ID**: 2829894900
- **Space Key**: ~janpreetsingh_jolly@epam.com
- **Page Title**: TEST SUMMARY-Online Library Management

### Test Summary Data Structure

The script updates the page with the following information:

| Field | Description |
|-------|-------------|
| User Story ID | Jira issue ID (e.g., EPMCDMETST-40786) |
| Feature | Feature name and requirement ID (e.g., FR-3.1 - Borrow a Book) |
| Test Date | Date tests were executed |
| UI Tests | Number of UI/frontend test cases |
| API Tests | Number of API/backend test cases |
| Total Tests | Total number of test cases executed |
| Passed | Number of passed tests |
| Failed | Number of failed tests |
| Pass % | Pass percentage |
| Status | Overall QA status (e.g., PRODUCTION READY) |

## Customizing Test Data

To update the test summary for a different user story, modify the `TEST_SUMMARY` dictionary in the script:

```python
TEST_SUMMARY = {
    "user_story_id": "EPMCDMETST-XXXXX",
    "feature": "FR-X.X - Feature Name",
    "test_date": "May 15, 2026",
    "tested_by": "Playwright-Tester Agent",
    "branch": "EPMCDMETST-XXXXX",
    "ui_test_cases": 6,
    "api_test_cases": 9,
    "total_tests": 15,
    "passed": 15,
    "failed": 0,
    "pass_percentage": 100,
    "status": "PRODUCTION READY"
}
```

## Page Structure

The script creates or updates a Confluence page with the following structure:

```
# Test Execution Summary - Online Library Management

[Table with test results]

## Test Details

[Info panel with link to detailed test reports]
```

## Confluence Storage Format

The script uses Confluence storage format (XML-based) for page updates. Key features:

- Tables with structured rows and columns
- Status macros with color coding (Green for PRODUCTION READY)
- Rich text formatting
- Info panels for additional context

## Troubleshooting

### Authentication Error

**Problem**: "ERROR: Missing Confluence credentials"

**Solution**: Ensure environment variables are set correctly:
```bash
echo $CONFLUENCE_EMAIL
echo $CONFLUENCE_API_TOKEN
```

### Page Not Found (404)

**Problem**: "ERROR: Failed to fetch page. Status: 404"

**Solution**: 
1. Verify the page ID is correct
2. Check you have access to the page
3. Confirm the page URL: https://kb.epam.com/spaces/~janpreetsingh_jolly@epam.com/pages/2829894900

### Permission Denied (403)

**Problem**: "ERROR: Failed to update page. Status: 403"

**Solution**:
1. Ensure your API token is valid
2. Verify you have edit permissions on the page
3. Check if the page is locked or restricted

### Duplicate Entry Warning

**Problem**: "WARNING: User story EPMCDMETST-40786 already exists in the table"

**Solution**: The script will skip duplicate entries. If you need to update an existing entry, manually remove the old row from the Confluence page first.

## Integration with SDLC Workflow

This script is designed to be called as part of the automated SDLC workflow:

1. **Playwright tests execute** (`playwright-runner.agent.md`)
2. **Test results are collected** (pass/fail counts, test categories)
3. **This script updates Confluence** with the summary
4. **Team reviews the updated page** for QA approval

## Security Notes

1. Never commit your API token to the repository
2. Use environment variables or secure credential storage
3. Rotate API tokens regularly (every 90 days recommended)
4. Restrict API token permissions to only what's needed

## Alternative: Manual Update

If you prefer to update the Confluence page manually, use this table format:

```
| User Story ID | Feature | Test Date | UI Tests | API Tests | Total Tests | Passed | Failed | Pass % | Status |
|--------------|---------|-----------|----------|-----------|-------------|--------|--------|--------|--------|
| EPMCDMETST-40786 | FR-3.1 - Borrow a Book | May 15, 2026 | 6 | 9 | 15 | 15 | 0 | 100% | ✅ PRODUCTION READY |
```

## Future Enhancements

Potential improvements for this script:

1. Read test results directly from Playwright JSON report
2. Support for multiple page IDs (different projects)
3. Automatic screenshot uploads for failed tests
4. Integration with CI/CD pipeline (GitHub Actions)
5. Slack/Teams notifications after update
6. Historical trend analysis and charts

## Support

For issues or questions:
- Check the project documentation
- Review the Confluence REST API docs: https://developer.atlassian.com/cloud/confluence/rest/
- Contact the project maintainer

## References

- [Confluence Cloud REST API](https://developer.atlassian.com/cloud/confluence/rest/)
- [Confluence Storage Format](https://confluence.atlassian.com/doc/confluence-storage-format-790796544.html)
- [Atlassian API Tokens](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/)
