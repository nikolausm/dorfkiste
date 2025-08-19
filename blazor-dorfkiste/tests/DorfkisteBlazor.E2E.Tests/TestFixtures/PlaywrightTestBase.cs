using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Playwright;
using Microsoft.Playwright.NUnit;
using NUnit.Framework;

namespace DorfkisteBlazor.E2E.Tests.TestFixtures;

/// <summary>
/// Base class for Playwright E2E tests with web application factory integration
/// </summary>
[Parallelizable(ParallelScope.Self)]
public abstract class PlaywrightTestBase : PageTest
{
    protected WebApplicationFactory<Program> Factory { get; private set; } = null!;
    protected string BaseUrl { get; private set; } = null!;

    [OneTimeSetUp]
    public void OneTimeSetUp()
    {
        Factory = new CustomWebApplicationFactory<Program>();
        BaseUrl = Factory.CreateClient().BaseAddress?.ToString() ?? "https://localhost:5001";
    }

    [OneTimeTearDown]
    public void OneTimeTearDown()
    {
        Factory?.Dispose();
    }

    [SetUp]
    public async Task SetUpBase()
    {
        // Configure page for testing
        await Page.SetViewportSizeAsync(1920, 1080);
        await Page.SetExtraHTTPHeadersAsync(new Dictionary<string, string>
        {
            {"Accept-Language", "en-US,en;q=0.9"}
        });

        // Navigate to base URL
        await Page.GotoAsync(BaseUrl);
    }

    /// <summary>
    /// Helper method to login a test user
    /// </summary>
    protected async Task LoginTestUserAsync(string email = "test@example.com", string password = "Test123!")
    {
        await Page.GotoAsync($"{BaseUrl}/Identity/Account/Login");
        
        await Page.FillAsync("[name='Input.Email']", email);
        await Page.FillAsync("[name='Input.Password']", password);
        await Page.ClickAsync("button[type='submit']");
        
        // Wait for redirect after login
        await Page.WaitForURLAsync($"{BaseUrl}/**");
    }

    /// <summary>
    /// Helper method to wait for an element with timeout
    /// </summary>
    protected async Task<IElementHandle?> WaitForElementAsync(string selector, int timeoutMs = 5000)
    {
        try
        {
            return await Page.WaitForSelectorAsync(selector, new PageWaitForSelectorOptions 
            { 
                Timeout = timeoutMs 
            });
        }
        catch (TimeoutException)
        {
            return null;
        }
    }

    /// <summary>
    /// Helper method to take a screenshot for debugging
    /// </summary>
    protected async Task TakeScreenshotAsync(string name)
    {
        var screenshotPath = Path.Combine(TestContext.CurrentContext.WorkDirectory, "screenshots");
        Directory.CreateDirectory(screenshotPath);
        
        await Page.ScreenshotAsync(new PageScreenshotOptions
        {
            Path = Path.Combine(screenshotPath, $"{name}_{DateTime.Now:yyyyMMdd_HHmmss}.png"),
            FullPage = true
        });
    }

    /// <summary>
    /// Helper method to check if running in CI environment
    /// </summary>
    protected bool IsRunningInCI()
    {
        return !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("CI")) ||
               !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("GITHUB_ACTIONS"));
    }
}

/// <summary>
/// Custom web application factory for E2E testing
/// </summary>
public class CustomWebApplicationFactory<TStartup> : WebApplicationFactory<TStartup> where TStartup : class
{
    protected override void ConfigureWebHost(Microsoft.AspNetCore.Hosting.IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        
        builder.ConfigureServices(services =>
        {
            // Configure test-specific services here
            // For example, replace external services with test doubles
        });
    }
}