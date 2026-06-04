#!/bin/bash

# Confluence Test Summary Update Script
# This script updates the Confluence page with test execution results

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "=========================================="
echo "Confluence Test Summary Update"
echo "=========================================="
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "ERROR: Python is not installed or not in PATH"
    echo "Please install Python 3.7 or higher"
    exit 1
fi

# Use python3 if available, otherwise python
PYTHON_CMD="python3"
if ! command -v python3 &> /dev/null; then
    PYTHON_CMD="python"
fi

echo "Using Python: $PYTHON_CMD"
$PYTHON_CMD --version
echo

# Check if requests library is installed
echo "Checking dependencies..."
$PYTHON_CMD -c "import requests" 2>/dev/null || {
    echo "ERROR: 'requests' library not found"
    echo "Installing requests..."
    $PYTHON_CMD -m pip install requests
}
echo "Dependencies OK"
echo

# Check environment variables
if [ -z "$CONFLUENCE_EMAIL" ]; then
    echo "WARNING: CONFLUENCE_EMAIL environment variable not set"
    read -p "Enter your EPAM email: " CONFLUENCE_EMAIL
    export CONFLUENCE_EMAIL
fi

if [ -z "$CONFLUENCE_API_TOKEN" ]; then
    echo "WARNING: CONFLUENCE_API_TOKEN environment variable not set"
    echo
    echo "To get an API token:"
    echo "  1. Go to https://id.atlassian.com/manage-profile/security/api-tokens"
    echo "  2. Click 'Create API token'"
    echo "  3. Copy the token"
    echo
    read -s -p "Enter your Confluence API token: " CONFLUENCE_API_TOKEN
    export CONFLUENCE_API_TOKEN
    echo
fi

echo "Credentials configured"
echo "Email: $CONFLUENCE_EMAIL"
echo

# Run the Python script
echo "Running update script..."
echo
$PYTHON_CMD "$SCRIPT_DIR/update_confluence_test_summary.py"

exit_code=$?

if [ $exit_code -eq 0 ]; then
    echo
    echo "=========================================="
    echo "Update completed successfully!"
    echo "=========================================="
else
    echo
    echo "=========================================="
    echo "Update failed with exit code: $exit_code"
    echo "=========================================="
    exit $exit_code
fi
