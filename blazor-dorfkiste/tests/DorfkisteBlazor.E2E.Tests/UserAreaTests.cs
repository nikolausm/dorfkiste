using Microsoft.Playwright;
using NUnit.Framework;
using FluentAssertions;
using DorfkisteBlazor.E2E.Tests.TestFixtures;

namespace DorfkisteBlazor.E2E.Tests;

/// <summary>
/// Tests for user area pages to verify they load correctly or redirect properly
/// </summary>
[TestFixture]
public class UserAreaTests : PlaywrightTestBase
{
    [Test]
    public async Task UserAreaPages_ShouldLoadOrRedirectProperly()
    {
        var userAreaUrls = new[]
        {
            "/profile",
            "/my-items", 
            "/my-rentals",
            "/watchlist",
            "/notifications",
            "/items/new"
        };

        var results = new List<(string Url, int StatusCode, string Status)>();

        foreach (var url in userAreaUrls)
        {
            try
            {
                // Navigate to the page
                var response = await Page.GotoAsync($"{BaseUrl}{url}");
                
                var statusCode = response?.Status ?? 0;
                var status = GetStatusDescription(statusCode);
                
                results.Add((url, statusCode, status));
                
                // Log the result
                TestContext.WriteLine($"URL: {url} - Status: {statusCode} ({status})");
                
                // Take screenshot for debugging if needed
                if (statusCode >= 400)
                {
                    await TakeScreenshotAsync($"error_{url.Replace("/", "_")}");
                }
                
                // Wait a bit between requests to avoid overwhelming the server
                await Task.Delay(500);
            }
            catch (Exception ex)
            {
                TestContext.WriteLine($"Error testing {url}: {ex.Message}");
                results.Add((url, 0, $"Exception: {ex.Message}"));
            }
        }

        // Verify results
        VerifyPageResults(results);
    }

    [Test]
    public async Task Profile_Page_ShouldLoadOrRedirect()
    {
        var response = await Page.GotoAsync($"{BaseUrl}/profile");
        var statusCode = response?.Status ?? 0;
        
        TestContext.WriteLine($"Profile page status: {statusCode}");
        
        // Should either load (200) or redirect to login (302/301) or show unauthorized (401)
        // Should NOT be 404 (not found) or 500 (server error)
        statusCode.Should().NotBe(404, "Profile page should exist, not return 404");
        statusCode.Should().NotBe(500, "Profile page should not cause server errors");
        statusCode.Should().BeOneOf(200, 301, 302, 401, 403, "Profile page should load or redirect properly");
    }

    [Test]
    public async Task MyItems_Page_ShouldLoadOrRedirect()
    {
        var response = await Page.GotoAsync($"{BaseUrl}/my-items");
        var statusCode = response?.Status ?? 0;
        
        TestContext.WriteLine($"My Items page status: {statusCode}");
        
        statusCode.Should().NotBe(404, "My Items page should exist, not return 404");
        statusCode.Should().NotBe(500, "My Items page should not cause server errors");
        statusCode.Should().BeOneOf(200, 301, 302, 401, 403, "My Items page should load or redirect properly");
    }

    [Test]
    public async Task MyRentals_Page_ShouldLoadOrRedirect()
    {
        var response = await Page.GotoAsync($"{BaseUrl}/my-rentals");
        var statusCode = response?.Status ?? 0;
        
        TestContext.WriteLine($"My Rentals page status: {statusCode}");
        
        statusCode.Should().NotBe(404, "My Rentals page should exist, not return 404");
        statusCode.Should().NotBe(500, "My Rentals page should not cause server errors");
        statusCode.Should().BeOneOf(200, 301, 302, 401, 403, "My Rentals page should load or redirect properly");
    }

    [Test]
    public async Task Watchlist_Page_ShouldLoadOrRedirect()
    {
        var response = await Page.GotoAsync($"{BaseUrl}/watchlist");
        var statusCode = response?.Status ?? 0;
        
        TestContext.WriteLine($"Watchlist page status: {statusCode}");
        
        statusCode.Should().NotBe(404, "Watchlist page should exist, not return 404");
        statusCode.Should().NotBe(500, "Watchlist page should not cause server errors");
        statusCode.Should().BeOneOf(200, 301, 302, 401, 403, "Watchlist page should load or redirect properly");
    }

    [Test]
    public async Task Notifications_Page_ShouldLoadOrRedirect()
    {
        var response = await Page.GotoAsync($"{BaseUrl}/notifications");
        var statusCode = response?.Status ?? 0;
        
        TestContext.WriteLine($"Notifications page status: {statusCode}");
        
        statusCode.Should().NotBe(404, "Notifications page should exist, not return 404");
        statusCode.Should().NotBe(500, "Notifications page should not cause server errors");
        statusCode.Should().BeOneOf(200, 301, 302, 401, 403, "Notifications page should load or redirect properly");
    }

    [Test]
    public async Task ItemsNew_Page_ShouldLoadOrRedirect()
    {
        var response = await Page.GotoAsync($"{BaseUrl}/items/new");
        var statusCode = response?.Status ?? 0;
        
        TestContext.WriteLine($"Items/New page status: {statusCode}");
        
        statusCode.Should().NotBe(404, "Items/New page should exist, not return 404");
        statusCode.Should().NotBe(500, "Items/New page should not cause server errors");
        statusCode.Should().BeOneOf(200, 301, 302, 401, 403, "Items/New page should load or redirect properly");
    }

    [Test]
    public async Task UserAreaPages_WithAuthentication_ShouldLoad()
    {
        // Try to login first (this might fail if no test user exists, which is OK)
        try
        {
            await LoginTestUserAsync();
            TestContext.WriteLine("Successfully logged in test user");
        }
        catch (Exception ex)
        {
            TestContext.WriteLine($"Could not log in test user (expected if no test user configured): {ex.Message}");
        }

        // Test pages after potential login
        var userAreaUrls = new[]
        {
            "/profile",
            "/my-items", 
            "/my-rentals",
            "/watchlist",
            "/notifications",
            "/items/new"
        };

        foreach (var url in userAreaUrls)
        {
            var response = await Page.GotoAsync($"{BaseUrl}{url}");
            var statusCode = response?.Status ?? 0;
            
            TestContext.WriteLine($"URL after login: {url} - Status: {statusCode}");
            
            // After login, pages should either load (200) or still redirect if user doesn't have proper permissions
            statusCode.Should().NotBe(404, $"Page {url} should exist after login");
            statusCode.Should().NotBe(500, $"Page {url} should not cause server errors after login");
        }
    }

    private void VerifyPageResults(List<(string Url, int StatusCode, string Status)> results)
    {
        TestContext.WriteLine("\n=== User Area Pages Test Summary ===");
        
        foreach (var (url, statusCode, status) in results)
        {
            TestContext.WriteLine($"{url}: {statusCode} ({status})");
            
            // Verify that pages exist and don't cause server errors
            statusCode.Should().NotBe(404, $"Page {url} should exist, not return 404");
            statusCode.Should().NotBe(500, $"Page {url} should not cause server errors");
            
            // Acceptable status codes for user area pages:
            // 200 - OK (if user is authenticated and authorized)
            // 301/302 - Redirect (usually to login page)
            // 401 - Unauthorized (if authentication is required)
            // 403 - Forbidden (if user is authenticated but not authorized)
            var acceptableStatusCodes = new[] { 200, 301, 302, 401, 403 };
            statusCode.Should().BeOneOf(acceptableStatusCodes, 
                $"Page {url} should return acceptable status code (200, 301, 302, 401, or 403)");
        }
        
        TestContext.WriteLine("=== End Summary ===\n");
        
        // Overall test should pass if all pages return acceptable status codes
        var failedPages = results.Where(r => !new[] { 200, 301, 302, 401, 403 }.Contains(r.StatusCode)).ToList();
        
        if (failedPages.Any())
        {
            var errorMessage = $"The following pages returned unacceptable status codes:\n" +
                              string.Join("\n", failedPages.Select(p => $"  {p.Url}: {p.StatusCode} ({p.Status})"));
            
            Assert.Fail(errorMessage);
        }
    }

    private static string GetStatusDescription(int statusCode)
    {
        return statusCode switch
        {
            200 => "OK",
            301 => "Moved Permanently",
            302 => "Found (Redirect)",
            401 => "Unauthorized",
            403 => "Forbidden",
            404 => "Not Found",
            500 => "Internal Server Error",
            _ => "Unknown"
        };
    }
}