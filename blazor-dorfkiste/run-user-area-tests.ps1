#!/usr/bin/env pwsh

# User Area Test Script for Dorfkiste Blazor Application
# Tests all user-related pages for proper response codes

Write-Host "=== Dorfkiste User Area Tests ===" -ForegroundColor Green
Write-Host "Testing user area pages for proper response codes..." -ForegroundColor Yellow

# Change to the E2E test directory
Set-Location "tests/DorfkisteBlazor.E2E.Tests"

# Install Playwright browsers if not already installed
Write-Host "Installing Playwright browsers..." -ForegroundColor Yellow
dotnet build
pwsh bin/Debug/net8.0/playwright.ps1 install

# Run the specific user area tests
Write-Host "Running User Area Tests..." -ForegroundColor Yellow
dotnet test --filter "FullyQualifiedName~UserAreaTests" --logger:"console;verbosity=detailed" --logger:"trx;LogFileName=UserAreaTestResults.trx"

# Check if tests passed
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ All User Area Tests Passed!" -ForegroundColor Green
} else {
    Write-Host "❌ Some User Area Tests Failed!" -ForegroundColor Red
    Write-Host "Check the test output above for details." -ForegroundColor Yellow
}

# Return to root directory
Set-Location "../.."

Write-Host "=== Test Summary ===" -ForegroundColor Green
Write-Host "The following user area pages were tested:" -ForegroundColor White
Write-Host "  • /profile - User profile page" -ForegroundColor Cyan
Write-Host "  • /my-items - User's items listing" -ForegroundColor Cyan  
Write-Host "  • /my-rentals - User's rental history" -ForegroundColor Cyan
Write-Host "  • /watchlist - User's watchlist" -ForegroundColor Cyan
Write-Host "  • /notifications - User notifications" -ForegroundColor Cyan
Write-Host "  • /items/new - Create new item page" -ForegroundColor Cyan

Write-Host "`nExpected behavior:" -ForegroundColor Yellow
Write-Host "  • Status 200 (OK) - if page loads successfully" -ForegroundColor White
Write-Host "  • Status 302 (Redirect) - if redirected to login" -ForegroundColor White
Write-Host "  • Status 401 (Unauthorized) - if authentication required" -ForegroundColor White
Write-Host "  • Status 403 (Forbidden) - if user lacks permissions" -ForegroundColor White
Write-Host "  • Should NOT be 404 (Not Found) or 500 (Server Error)" -ForegroundColor Red

exit $LASTEXITCODE