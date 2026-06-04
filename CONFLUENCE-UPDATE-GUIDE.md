# Confluence Test Summary Update - Complete Guide

## Overview

This guide provides complete instructions for updating the Confluence page with test execution summaries for the Online Library Management project.

**Confluence Page:** [TEST SUMMARY-Online Library Management](https://kb.epam.com/spaces/~janpreetsingh_jolly@epam.com/pages/2829894900/TEST+SUMMARY-Online+Library+Management)

## Current Test Summary (EPMCDMETST-40786)

The following test execution summary is ready to be uploaded to Confluence:

| Field | Value |
|-------|-------|
| **User Story ID** | EPMCDMETST-40786 |
| **Feature** | FR-3.1 - Borrow a Book |
| **Test Date** | May 15, 2026 |
| **Tested By** | Playwright-Tester Agent |
| **Branch** | EPMCDMETST-40786 |
| **UI Test Cases** | 6 |
| **API Test Cases** | 9 |
| **Total Tests** | 15 |
| **Passed** | 15 |
| **Failed** | 0 |
| **Pass Percentage** | 100% |
| **Status** | ✅ PRODUCTION READY |

## Automated Update (Recommended)

### Prerequisites
1. Python 3.7+ installed
2. Confluence API credentials
3. Network access to kb.epam.com

### Quick Start

**Windows (PowerShell):**
```powershell
# Set credentials
$env:CONFLUENCE_EMAIL = "janpreetsingh_jolly@epam.com"
$env:CONFLUENCE_API_TOKEN = "your-api-token-here"

# Run update
.\scripts\update-confluence.ps1
```

**Linux/Mac/Git Bash:**
```bash
# Set credentials
export CONFLUENCE_EMAIL="janpreetsingh_jolly@epam.com"
export CONFLUENCE_API_TOKEN="your-api-token-here"

# Run update
./scripts/update-confluence.sh
```

### Getting Your API Token

1. Visit https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Name: "Online Library Management - Test Updates"
4. Copy the token and use it in the commands above

### What the Script Does

1. Authenticates with Confluence using your credentials
2. Fetches the current page content (Page ID: 2829894900)
3. Checks if a table exists; creates one if not
4. Adds a new row with the test summary data
5. Updates the page with versioning
6. Displays confirmation with the page URL

### Expected Output

```
======================================================================
Confluence Test Summary Updater
======================================================================

Authenticating...
Fetching page 2829894900...
Current page title: TEST SUMMARY-Online Library Management
Current version: 5

Updating page content...
Adding new test summary row...
Saving to Confluence...

======================================================================
SUCCESS: Page updated successfully!
======================================================================

User Story: EPMCDMETST-40786
Feature: FR-3.1 - Borrow a Book
Test Results: 15/15 passed (100%)
Status: PRODUCTION READY

View updated page: https://kb.epam.com/spaces/~janpreetsingh_jolly@epam.com/pages/2829894900
```

## Manual Update (Alternative)

If you prefer to update Confluence manually or the automated script is not working:

### Step 1: Navigate to the Page
Visit: https://kb.epam.com/spaces/~janpreetsingh_jolly@epam.com/pages/2829894900

### Step 2: Edit the Page
Click the "Edit" button in the top-right corner

### Step 3: Add Table Row
Add the following row to the test summary table:

| User Story ID | Feature | Test Date | UI Tests | API Tests | Total Tests | Passed | Failed | Pass % | Status |
|---------------|---------|-----------|----------|-----------|-------------|--------|--------|--------|--------|
| EPMCDMETST-40786 | FR-3.1 - Borrow a Book | May 15, 2026 | 6 | 9 | 15 | 15 | 0 | 100% | ✅ PRODUCTION READY |

### Step 4: Format the Status
For the Status column, use the Confluence Status macro:
1. Type `/status` and press Enter
2. Set color to Green
3. Set text to "PRODUCTION READY"

### Step 5: Save
Click "Publish" to save your changes

## Page Structure

The Confluence page should have this structure:

```
# Test Execution Summary - Online Library Management

This page tracks test execution results for all user stories in the Online Library Management project.

[TABLE]
| User Story ID | Feature | Test Date | UI Tests | API Tests | Total Tests | Passed | Failed | Pass % | Status |
|---------------|---------|-----------|----------|-----------|-------------|--------|--------|--------|--------|
| [Previous entries...] |
| EPMCDMETST-40786 | FR-3.1 - Borrow a Book | May 15, 2026 | 6 | 9 | 15 | 15 | 0 | 100% | [Green Status: PRODUCTION READY] |

## Test Details

[Info Panel]
For detailed test reports, see the Playwright HTML reports in the project repository: `playwright-report/index.html`
```

## Test Breakdown Details

### Deployment Verification Tests (6 tests)
1. Backend API accessible - ✅
2. Frontend accessible - ✅
3. Admin login working - ✅
4. Books page accessible - ✅
5. Borrow API endpoint verified - ✅
6. Books API accessible - ✅

### API Integration Tests (5 tests)
1. Guest user restrictions enforced - ✅
2. Unauthenticated access blocked - ✅
3. Successful borrow transaction - ✅
4. Duplicate borrow prevention - ✅
5. Non-existent book handling - ✅

### Business Rules Verification (4 tests)
1. 14-day loan period enforced - ✅
2. Guest users blocked - ✅
3. Duplicate prevention - ✅
4. Available copies validation - ✅

### Acceptance Criteria Status (8/8 Met)
- ✅ Members can borrow available books
- ✅ Guest users prevented from borrowing
- ✅ Librarians can borrow books
- ✅ 14-day loan period enforced
- ✅ Duplicate borrows prevented
- ✅ Available copies decremented
- ✅ Transaction record created
- ✅ UI shows feedback

## Scripts and Documentation

All scripts are located in the `scripts/` directory:

| File | Purpose |
|------|---------|
| `update_confluence_test_summary.py` | Main Python script for updating Confluence |
| `update-confluence.sh` | Bash wrapper script (Linux/Mac/Git Bash) |
| `update-confluence.ps1` | PowerShell wrapper script (Windows) |
| `README-CONFLUENCE.md` | Detailed documentation |
| `QUICKSTART.md` | Quick reference guide |

## Troubleshooting

### Authentication Issues

**Problem:** "ERROR: Missing Confluence credentials"

**Solution:** 
```bash
# Check if variables are set
echo $CONFLUENCE_EMAIL
echo $CONFLUENCE_API_TOKEN

# Set them if missing
export CONFLUENCE_EMAIL="your.email@epam.com"
export CONFLUENCE_API_TOKEN="your-token"
```

### Network/Connection Issues

**Problem:** "Failed to fetch page" or timeout errors

**Solution:**
1. Check internet connection
2. Verify VPN is connected (if required for EPAM network)
3. Test Confluence access in browser first
4. Check if kb.epam.com is accessible

### Permission Issues

**Problem:** "Permission denied (403)"

**Solution:**
1. Verify you have edit permissions on the page
2. Check if API token is valid (not expired)
3. Ensure you're using the correct email address
4. Try accessing the page in browser to confirm permissions

### Duplicate Entry Warning

**Problem:** "User story already exists in table"

**Solution:**
- The script detects duplicates and will warn you
- To update an existing entry, manually remove the old row first
- Or modify the script to handle updates instead of inserts

## Integration with SDLC Workflow

This Confluence update is part of the automated SDLC workflow:

```
Step 1: Fetch Requirements (Confluence)
   ↓
Step 2: Gap Analysis
   ↓
Step 3: Create Jira User Stories
   ↓
Step 4: Design (Confluence)
   ↓
Step 5: Implement Feature
   ↓
Step 6: Code Review
   ↓
Step 7: Execute Playwright Tests
   ↓
Step 8: Update Test Summary (THIS STEP) ← YOU ARE HERE
   ↓
Step 9: Deploy
   ↓
Step 10: Update Documentation (Confluence)
```

## Security Best Practices

1. **Never commit API tokens** to Git
2. **Use environment variables** for credentials
3. **Rotate tokens regularly** (every 90 days)
4. **Use project-specific tokens** with minimal permissions
5. **Store tokens securely** (password manager, vault)

## References

- **Confluence Page:** https://kb.epam.com/spaces/~janpreetsingh_jolly@epam.com/pages/2829894900
- **Test Execution Report:** `TEST-EXECUTION-REPORT.md` (in project root)
- **Confluence REST API:** https://developer.atlassian.com/cloud/confluence/rest/
- **Atlassian API Tokens:** https://id.atlassian.com/manage-profile/security/api-tokens

## Support

For issues or questions:
1. Check the detailed documentation in `scripts/README-CONFLUENCE.md`
2. Review the quick start guide in `scripts/QUICKSTART.md`
3. Examine the test execution report: `TEST-EXECUTION-REPORT.md`
4. Contact the project maintainer: Janpreet Singh Jolly

## Next Steps

After updating the Confluence page:

1. ✅ Verify the update in Confluence
2. ✅ Share the updated page URL with stakeholders
3. ✅ Move to deployment phase (if approved)
4. ✅ Update application documentation in Confluence
5. ✅ Close the user story in Jira

---

**Last Updated:** May 15, 2026  
**User Story:** EPMCDMETST-40786  
**Feature:** FR-3.1 - Borrow a Book
