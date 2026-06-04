# Confluence Update Script - Usage Examples

## Example 1: First Time Setup (Windows PowerShell)

```powershell
# Step 1: Get API token from Atlassian
# Visit: https://id.atlassian.com/manage-profile/security/api-tokens
# Click "Create API token" and copy it

# Step 2: Set environment variables
$env:CONFLUENCE_EMAIL = "janpreetsingh_jolly@epam.com"
$env:CONFLUENCE_API_TOKEN = "ATATT3xFfGF0..."  # Your token here

# Step 3: Install dependencies (if needed)
python -m pip install requests

# Step 4: Run the update script
cd C:\Users\JanpreetSinghJolly\gitlab_epam\online-library-management
.\scripts\update-confluence.ps1
```

### Expected Output:
```
==========================================
Confluence Test Summary Update
==========================================

Using Python: python
Python 3.11.0
Checking dependencies...
Dependencies OK

Credentials configured
Email: janpreetsingh_jolly@epam.com

Running update script...

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

==========================================
Update completed successfully!
==========================================
```

## Example 2: Quick Update (Linux/Mac/Git Bash)

```bash
# One-liner (with credentials set)
export CONFLUENCE_EMAIL="janpreetsingh_jolly@epam.com" && \
export CONFLUENCE_API_TOKEN="ATATT3xFfGF0..." && \
./scripts/update-confluence.sh
```

## Example 3: Update for Different User Story

Edit `scripts/update_confluence_test_summary.py`:

```python
# Line 21-32: Modify TEST_SUMMARY dictionary
TEST_SUMMARY = {
    "user_story_id": "EPMCDMETST-40787",        # New user story
    "feature": "FR-3.2 - Return a Book",        # New feature
    "test_date": "May 16, 2026",                # New date
    "tested_by": "Playwright-Tester Agent",
    "branch": "EPMCDMETST-40787",               # New branch
    "ui_test_cases": 8,                         # Updated counts
    "api_test_cases": 12,
    "total_tests": 20,
    "passed": 19,
    "failed": 1,
    "pass_percentage": 95,
    "status": "IN TESTING"                      # Different status
}
```

Then run:
```bash
./scripts/update-confluence.sh
```

## Example 4: Troubleshooting Authentication

```bash
# Check if Python is installed
python --version
# or
python3 --version

# Check if requests library is installed
python -c "import requests; print('requests version:', requests.__version__)"

# Test if environment variables are set
echo "Email: $CONFLUENCE_EMAIL"
echo "Token: ${CONFLUENCE_API_TOKEN:0:10}..."  # Shows first 10 chars only

# Manually test Confluence API access
curl -u "$CONFLUENCE_EMAIL:$CONFLUENCE_API_TOKEN" \
  "https://kb.epam.com/rest/api/content/2829894900?expand=version" \
  -H "Accept: application/json"
```

## Example 5: Running Without Wrapper Script (Direct Python)

```bash
# Set environment variables
export CONFLUENCE_EMAIL="janpreetsingh_jolly@epam.com"
export CONFLUENCE_API_TOKEN="your-token-here"

# Run Python script directly
cd /path/to/online-library-management
python scripts/update_confluence_test_summary.py
```

## Example 6: Batch Update (Multiple User Stories)

Create a file `batch_update.sh`:

```bash
#!/bin/bash

# Set credentials once
export CONFLUENCE_EMAIL="janpreetsingh_jolly@epam.com"
export CONFLUENCE_API_TOKEN="your-token-here"

# Define test summaries
declare -A stories=(
    ["EPMCDMETST-40786"]="FR-3.1:Borrow a Book:15:15:0:PRODUCTION READY"
    ["EPMCDMETST-40787"]="FR-3.2:Return a Book:20:19:1:IN TESTING"
    ["EPMCDMETST-40788"]="FR-3.3:Reserve a Book:18:18:0:PRODUCTION READY"
)

# Update each one
for story_id in "${!stories[@]}"; do
    echo "Updating $story_id..."
    # Modify the Python script with new values
    # Run the update
    python scripts/update_confluence_test_summary.py
    sleep 2  # Rate limiting
done

echo "All updates complete!"
```

## Example 7: Integration with CI/CD Pipeline

### GitHub Actions Workflow:

```yaml
name: Update Confluence Test Summary

on:
  workflow_dispatch:  # Manual trigger
  push:
    branches:
      - 'EPMCDMETST-*'
    paths:
      - 'playwright-report/**'

jobs:
  update-confluence:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: pip install requests
      
      - name: Update Confluence
        env:
          CONFLUENCE_EMAIL: ${{ secrets.CONFLUENCE_EMAIL }}
          CONFLUENCE_API_TOKEN: ${{ secrets.CONFLUENCE_API_TOKEN }}
        run: python scripts/update_confluence_test_summary.py
      
      - name: Notify
        run: echo "Confluence updated successfully!"
```

### GitLab CI/CD Pipeline:

```yaml
update-confluence:
  stage: test
  script:
    - pip install requests
    - python scripts/update_confluence_test_summary.py
  variables:
    CONFLUENCE_EMAIL: $CONFLUENCE_EMAIL
    CONFLUENCE_API_TOKEN: $CONFLUENCE_API_TOKEN
  only:
    - branches
  when: manual
```

## Example 8: Error Handling

### Scenario: Invalid Token
```bash
$ ./scripts/update-confluence.sh

Authenticating...
ERROR: Failed to fetch page. Status: 401
Response: {"statusCode":401,"message":"Unauthorized"}

# Solution: Generate new API token and update environment variable
```

### Scenario: Page Not Found
```bash
ERROR: Failed to fetch page. Status: 404
Response: {"statusCode":404,"message":"Page not found"}

# Solution: Verify page ID and permissions
# Check: https://kb.epam.com/pages/viewinfo.action?pageId=2829894900
```

### Scenario: Network Timeout
```bash
ERROR: Failed to connect to kb.epam.com
Timeout: Connection timed out after 30 seconds

# Solution: Check VPN connection, network access, and firewall settings
```

## Example 9: Customizing the Table Format

Modify the `create_test_summary_table_row` function in the Python script:

```python
def create_test_summary_table_row(data: Dict[str, Any]) -> str:
    """Create a table row with custom formatting"""
    
    # Add color coding based on pass percentage
    if data["pass_percentage"] == 100:
        color = "Green"
    elif data["pass_percentage"] >= 90:
        color = "Yellow"
    else:
        color = "Red"
    
    status_macro = f'<ac:structured-macro ac:name="status" ac:schema-version="1">'
    status_macro += f'<ac:parameter ac:name="colour">{color}</ac:parameter>'
    status_macro += f'<ac:parameter ac:name="title">{data["status"]}</ac:parameter>'
    status_macro += '</ac:structured-macro>'
    
    # Add emoji indicators
    emoji = "✅" if data["failed"] == 0 else "⚠️"
    
    row = f"""<tr>
<td><p><strong>{data["user_story_id"]}</strong></p></td>
<td><p>{emoji} {data["feature"]}</p></td>
...
```

## Example 10: Reading Test Results from File

Extend the script to read from `TEST-EXECUTION-REPORT.md`:

```python
def parse_test_report(report_file):
    """Parse test execution report and extract summary"""
    with open(report_file, 'r') as f:
        content = f.read()
    
    # Extract key metrics using regex
    import re
    
    story_id = re.search(r'## ([A-Z]+-\d+)', content).group(1)
    feature = re.search(r'## (.+Feature)', content).group(1)
    total_tests = int(re.search(r'Total Tests: (\d+)', content).group(1))
    passed = int(re.search(r'Passed: (\d+)', content).group(1))
    failed = int(re.search(r'Failed: (\d+)', content).group(1))
    
    return {
        "user_story_id": story_id,
        "feature": feature,
        "total_tests": total_tests,
        "passed": passed,
        "failed": failed,
        "pass_percentage": round((passed / total_tests) * 100, 2)
    }

# Usage:
# TEST_SUMMARY = parse_test_report('TEST-EXECUTION-REPORT.md')
```

## Quick Command Reference

| Task | Command |
|------|---------|
| Install dependencies | `pip install requests` |
| Set email (bash) | `export CONFLUENCE_EMAIL="your@email.com"` |
| Set token (bash) | `export CONFLUENCE_API_TOKEN="token"` |
| Set email (PowerShell) | `$env:CONFLUENCE_EMAIL="your@email.com"` |
| Set token (PowerShell) | `$env:CONFLUENCE_API_TOKEN="token"` |
| Run update (bash) | `./scripts/update-confluence.sh` |
| Run update (PowerShell) | `.\scripts\update-confluence.ps1` |
| Run Python directly | `python scripts/update_confluence_test_summary.py` |
| Check Python syntax | `python -m py_compile scripts/*.py` |
| View Confluence page | Open browser to page URL |
| Clear credentials | `unset CONFLUENCE_EMAIL CONFLUENCE_API_TOKEN` |

## Tips and Best Practices

1. **Store credentials securely**: Use a password manager or environment variable manager
2. **Test first**: Always test on a personal space before updating the official page
3. **Version control**: Keep the script in Git but never commit credentials
4. **Rate limiting**: Wait 1-2 seconds between consecutive updates
5. **Backup**: Take a snapshot of the Confluence page before bulk updates
6. **Validate data**: Review test summary values before running the script
7. **Monitor logs**: Check script output for errors or warnings
8. **Team coordination**: Communicate with team before automated updates

## Resources

- Script documentation: `scripts/README-CONFLUENCE.md`
- Quick start guide: `scripts/QUICKSTART.md`
- Main guide: `CONFLUENCE-UPDATE-GUIDE.md`
- Confluence REST API: https://developer.atlassian.com/cloud/confluence/rest/
- Python requests library: https://requests.readthedocs.io/
