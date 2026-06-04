# Confluence Test Summary Update Script (PowerShell)
# This script updates the Confluence page with test execution results

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Confluence Test Summary Update" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
$pythonCmd = $null
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonCmd = "python"
} elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
    $pythonCmd = "python3"
} else {
    Write-Host "ERROR: Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.7 or higher from https://www.python.org/downloads/"
    exit 1
}

Write-Host "Using Python: $pythonCmd"
& $pythonCmd --version
Write-Host ""

# Check if requests library is installed
Write-Host "Checking dependencies..."
$requestsInstalled = & $pythonCmd -c "import requests" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: 'requests' library not found" -ForegroundColor Yellow
    Write-Host "Installing requests..."
    & $pythonCmd -m pip install requests
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install requests library" -ForegroundColor Red
        exit 1
    }
}
Write-Host "Dependencies OK" -ForegroundColor Green
Write-Host ""

# Check environment variables
if (-not $env:CONFLUENCE_EMAIL) {
    Write-Host "WARNING: CONFLUENCE_EMAIL environment variable not set" -ForegroundColor Yellow
    $email = Read-Host "Enter your EPAM email"
    $env:CONFLUENCE_EMAIL = $email
}

if (-not $env:CONFLUENCE_API_TOKEN) {
    Write-Host "WARNING: CONFLUENCE_API_TOKEN environment variable not set" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To get an API token:"
    Write-Host "  1. Go to https://id.atlassian.com/manage-profile/security/api-tokens"
    Write-Host "  2. Click 'Create API token'"
    Write-Host "  3. Copy the token"
    Write-Host ""
    $secureToken = Read-Host "Enter your Confluence API token" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureToken)
    $token = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    $env:CONFLUENCE_API_TOKEN = $token
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
}

Write-Host "Credentials configured" -ForegroundColor Green
Write-Host "Email: $env:CONFLUENCE_EMAIL"
Write-Host ""

# Run the Python script
Write-Host "Running update script..." -ForegroundColor Cyan
Write-Host ""

$scriptPath = Join-Path $ScriptDir "update_confluence_test_summary.py"
& $pythonCmd $scriptPath

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "Update completed successfully!" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Red
    Write-Host "Update failed with exit code: $LASTEXITCODE" -ForegroundColor Red
    Write-Host "==========================================" -ForegroundColor Red
    exit $LASTEXITCODE
}
