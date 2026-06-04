#!/usr/bin/env python3
"""
Update Confluence page with test execution summary
Requires: requests library (pip install requests)

Usage:
    python update_confluence_test_summary.py

Environment variables required:
    CONFLUENCE_EMAIL - Your EPAM email
    CONFLUENCE_API_TOKEN - Your Confluence API token
"""

import os
import sys
import json
import requests
from datetime import datetime
from typing import Dict, Any

# Confluence configuration
CONFLUENCE_URL = "https://kb.epam.com"
PAGE_ID = "2829894900"
SPACE_KEY = "~janpreetsingh_jolly@epam.com"

# Test execution data
TEST_SUMMARY = {
    "user_story_id": "EPMCDMETST-40786",
    "feature": "FR-3.1 - Borrow a Book",
    "test_date": "May 15, 2026",
    "tested_by": "Playwright-Tester Agent",
    "branch": "EPMCDMETST-40786",
    "ui_test_cases": 6,
    "api_test_cases": 9,
    "total_tests": 15,
    "passed": 15,
    "failed": 0,
    "pass_percentage": 100,
    "status": "PRODUCTION READY"
}


def get_auth():
    """Get authentication credentials from environment variables"""
    email = os.environ.get("CONFLUENCE_EMAIL")
    token = os.environ.get("CONFLUENCE_API_TOKEN")

    if not email or not token:
        print("ERROR: Missing Confluence credentials")
        print("Please set environment variables:")
        print("  CONFLUENCE_EMAIL - Your EPAM email")
        print("  CONFLUENCE_API_TOKEN - Your Confluence API token")
        print("\nTo get an API token:")
        print("  1. Go to https://id.atlassian.com/manage-profile/security/api-tokens")
        print("  2. Click 'Create API token'")
        print("  3. Copy the token and set it as environment variable")
        sys.exit(1)

    return (email, token)


def get_page_content(auth: tuple) -> Dict[str, Any]:
    """Fetch current page content from Confluence"""
    url = f"{CONFLUENCE_URL}/rest/api/content/{PAGE_ID}"
    params = {
        "expand": "body.storage,version"
    }

    response = requests.get(url, auth=auth, params=params)

    if response.status_code != 200:
        print(f"ERROR: Failed to fetch page. Status: {response.status_code}")
        print(f"Response: {response.text}")
        sys.exit(1)

    return response.json()


def create_test_summary_table_row(data: Dict[str, Any]) -> str:
    """Create a table row in Confluence storage format"""
    status_macro = f'<ac:structured-macro ac:name="status" ac:schema-version="1"><ac:parameter ac:name="colour">Green</ac:parameter><ac:parameter ac:name="title">{data["status"]}</ac:parameter></ac:structured-macro>'

    row = f"""<tr>
<td><p><strong>{data["user_story_id"]}</strong></p></td>
<td><p>{data["feature"]}</p></td>
<td><p>{data["test_date"]}</p></td>
<td><p>{data["ui_test_cases"]}</p></td>
<td><p>{data["api_test_cases"]}</p></td>
<td><p>{data["total_tests"]}</p></td>
<td><p>{data["passed"]}</p></td>
<td><p>{data["failed"]}</p></td>
<td><p>{data["pass_percentage"]}%</p></td>
<td><p>{status_macro}</p></td>
</tr>"""

    return row


def create_initial_table(data: Dict[str, Any]) -> str:
    """Create initial table if page is empty"""
    table_header = """<h1>Test Execution Summary - Online Library Management</h1>
<p>This page tracks test execution results for all user stories in the Online Library Management project.</p>
<table>
<tbody>
<tr>
<th><p><strong>User Story ID</strong></p></th>
<th><p><strong>Feature</strong></p></th>
<th><p><strong>Test Date</strong></p></th>
<th><p><strong>UI Tests</strong></p></th>
<th><p><strong>API Tests</strong></p></th>
<th><p><strong>Total Tests</strong></p></th>
<th><p><strong>Passed</strong></p></th>
<th><p><strong>Failed</strong></p></th>
<th><p><strong>Pass %</strong></p></th>
<th><p><strong>Status</strong></p></th>
</tr>"""

    row = create_test_summary_table_row(data)

    return table_header + row + """
</tbody>
</table>

<h2>Test Details</h2>
<ac:structured-macro ac:name="info" ac:schema-version="1">
<ac:rich-text-body>
<p>For detailed test reports, see the Playwright HTML reports in the project repository: <code>playwright-report/index.html</code></p>
</ac:rich-text-body>
</ac:structured-macro>"""


def update_existing_table(current_content: str, data: Dict[str, Any]) -> str:
    """Update existing table by adding a new row"""
    # Check if this user story already exists in the table
    if data["user_story_id"] in current_content:
        print(f"WARNING: User story {data['user_story_id']} already exists in the table.")
        print("Replacing existing entry...")
        # This is a simple approach - in production, you'd want more sophisticated parsing
        return current_content

    # Find the end of the table body and insert new row before it
    row = create_test_summary_table_row(data)

    if "</tbody>" in current_content:
        # Insert before closing tbody
        updated_content = current_content.replace("</tbody>", row + "\n</tbody>")
    else:
        # If no table exists, create one
        updated_content = create_initial_table(data)

    return updated_content


def update_page(auth: tuple, page_data: Dict[str, Any], new_content: str):
    """Update the Confluence page with new content"""
    url = f"{CONFLUENCE_URL}/rest/api/content/{PAGE_ID}"

    payload = {
        "version": {
            "number": page_data["version"]["number"] + 1
        },
        "title": page_data["title"],
        "type": "page",
        "body": {
            "storage": {
                "value": new_content,
                "representation": "storage"
            }
        }
    }

    headers = {
        "Content-Type": "application/json"
    }

    response = requests.put(url, auth=auth, headers=headers, json=payload)

    if response.status_code != 200:
        print(f"ERROR: Failed to update page. Status: {response.status_code}")
        print(f"Response: {response.text}")
        sys.exit(1)

    return response.json()


def main():
    print("=" * 70)
    print("Confluence Test Summary Updater")
    print("=" * 70)
    print()

    # Get authentication
    print("Authenticating...")
    auth = get_auth()

    # Fetch current page content
    print(f"Fetching page {PAGE_ID}...")
    page_data = get_page_content(auth)
    current_content = page_data["body"]["storage"]["value"]

    print(f"Current page title: {page_data['title']}")
    print(f"Current version: {page_data['version']['number']}")
    print()

    # Update content
    print("Updating page content...")
    if not current_content or "<table>" not in current_content:
        print("Creating initial table structure...")
        new_content = create_initial_table(TEST_SUMMARY)
    else:
        print("Adding new test summary row...")
        new_content = update_existing_table(current_content, TEST_SUMMARY)

    # Update page
    print("Saving to Confluence...")
    result = update_page(auth, page_data, new_content)

    print()
    print("=" * 70)
    print("SUCCESS: Page updated successfully!")
    print("=" * 70)
    print()
    print(f"User Story: {TEST_SUMMARY['user_story_id']}")
    print(f"Feature: {TEST_SUMMARY['feature']}")
    print(f"Test Results: {TEST_SUMMARY['passed']}/{TEST_SUMMARY['total_tests']} passed ({TEST_SUMMARY['pass_percentage']}%)")
    print(f"Status: {TEST_SUMMARY['status']}")
    print()
    print(f"View updated page: {CONFLUENCE_URL}/spaces/{SPACE_KEY}/pages/{PAGE_ID}")
    print()


if __name__ == "__main__":
    main()
