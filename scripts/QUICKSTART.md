# Quick Start: Update Confluence Test Summary

This guide helps you quickly update the Confluence test summary page after running Playwright tests.

## TL;DR

```bash
# Set your credentials (one time)
export CONFLUENCE_EMAIL="your.email@epam.com"
export CONFLUENCE_API_TOKEN="your-api-token"

# Run the update
./scripts/update-confluence.sh
# or on Windows:
# powershell scripts/update-confluence.ps1
```

## Step-by-Step Guide

### 1. Get Your API Token (One-Time Setup)

1. Visit: https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Name it: "Online Library Management Test Updates"
4. Copy the token (you won't see it again!)

### 2. Set Environment Variables

#### Windows (PowerShell - Recommended):
```powershell
$env:CONFLUENCE_EMAIL = "janpreetsingh_jolly@epam.com"
$env:CONFLUENCE_API_TOKEN = "paste-your-token-here"

# Run the script
.\scripts\update-confluence.ps1
```

#### Windows (Git Bash):
```bash
export CONFLUENCE_EMAIL="janpreetsingh_jolly@epam.com"
export CONFLUENCE_API_TOKEN="paste-your-token-here"

# Run the script
./scripts/update-confluence.sh
```

#### Linux/Mac:
```bash
export CONFLUENCE_EMAIL="janpreetsingh_jolly@epam.com"
export CONFLUENCE_API_TOKEN="paste-your-token-here"

# Run the script
./scripts/update-confluence.sh
```

### 3. Run the Update Script

The script will:
- Check Python installation
- Install dependencies if needed
- Fetch the current Confluence page
- Add a new row with test results
- Save the updated page

### 4. Verify the Update

Visit the page to confirm:
https://kb.epam.com/spaces/~janpreetsingh_jolly@epam.com/pages/2829894900

## What Gets Updated?

The script adds a new row to the test summary table with:

- User Story ID: EPMCDMETST-40786
- Feature: FR-3.1 - Borrow a Book
- Test Date: May 15, 2026
- UI Tests: 6
- API Tests: 9
- Total Tests: 15
- Passed: 15
- Failed: 0
- Pass %: 100%
- Status: ✅ PRODUCTION READY

## Troubleshooting

### "requests module not found"
```bash
pip install requests
```

### "Authentication failed"
- Check your email is correct
- Verify API token is still valid (not expired)
- Ensure no extra spaces in the token

### "Page not found (404)"
- Verify you have access to the Confluence page
- Check the page URL in your browser

### "Permission denied (403)"
- Confirm you have edit permissions on the page
- Try refreshing your API token

## Update for Different User Story

1. Open `scripts/update_confluence_test_summary.py`
2. Find the `TEST_SUMMARY` dictionary (around line 21)
3. Update the values:
   ```python
   TEST_SUMMARY = {
       "user_story_id": "EPMCDMETST-XXXXX",  # Change this
       "feature": "FR-X.X - New Feature",     # Change this
       "test_date": "May 15, 2026",           # Update date
       "ui_test_cases": 6,                    # Update counts
       "api_test_cases": 9,
       "total_tests": 15,
       "passed": 15,
       "failed": 0,
       "pass_percentage": 100,
       "status": "PRODUCTION READY"           # Change status if needed
   }
   ```
4. Save and run the script again

## Security Tips

- Never commit your API token to Git
- Store token in environment variable or secure vault
- Rotate tokens every 90 days
- Use project-specific tokens with minimal permissions

## Need Help?

- See full documentation: `scripts/README-CONFLUENCE.md`
- Check Confluence REST API: https://developer.atlassian.com/cloud/confluence/rest/
- Contact project maintainer

## Success Output Example

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
