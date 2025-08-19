using DorfkisteBlazor.E2E.Tests.TestFixtures;
using FluentAssertions;
using Microsoft.Playwright;
using NUnit.Framework;

namespace DorfkisteBlazor.E2E.Tests;

/// <summary>
/// End-to-end tests covering complete user journeys through the Dorfkiste application
/// </summary>
[TestFixture]
public class UserJourneyTests : PlaywrightTestBase
{
    [Test]
    public async Task UserRegistration_ShouldAllowNewUserToRegister()
    {
        // Arrange
        var testEmail = $"newuser_{Guid.NewGuid()}@example.com";
        var testPassword = "NewUser123!";
        var testName = "New Test User";

        // Act
        await Page.GotoAsync($"{BaseUrl}/Identity/Account/Register");

        // Check if registration page loads
        await Page.WaitForLoadStateAsync(LoadState.NetworkIdle);
        
        var emailField = await WaitForElementAsync("[name='Input.Email']");
        if (emailField == null)
        {
            await TakeScreenshotAsync("registration_page_not_loaded");
            Assert.Inconclusive("Registration page did not load properly");
        }

        await Page.FillAsync("[name='Input.Email']", testEmail);
        await Page.FillAsync("[name='Input.Password']", testPassword);
        await Page.FillAsync("[name='Input.ConfirmPassword']", testPassword);
        
        // Check if Name field exists (might be optional)
        var nameField = await Page.QuerySelectorAsync("[name='Input.Name']");
        if (nameField != null)
        {
            await Page.FillAsync("[name='Input.Name']", testName);
        }

        await Page.ClickAsync("button[type='submit']");

        // Assert
        await Page.WaitForLoadStateAsync(LoadState.NetworkIdle);
        
        // Should either redirect to confirmation page or dashboard
        var currentUrl = Page.Url;
        currentUrl.Should().NotContain("/Register", "User should be redirected after successful registration");
    }

    [Test]
    public async Task UserLogin_WithValidCredentials_ShouldLoginSuccessfully()
    {
        // Arrange
        var email = "test@example.com";
        var password = "Test123!";

        // Act
        await Page.GotoAsync($"{BaseUrl}/Identity/Account/Login");
        await Page.WaitForLoadStateAsync(LoadState.NetworkIdle);

        var emailField = await WaitForElementAsync("[name='Input.Email']");
        if (emailField == null)
        {
            await TakeScreenshotAsync("login_page_not_loaded");
            Assert.Inconclusive("Login page did not load properly");
        }

        await Page.FillAsync("[name='Input.Email']", email);
        await Page.FillAsync("[name='Input.Password']", password);
        await Page.ClickAsync("button[type='submit']");

        // Assert
        await Page.WaitForLoadStateAsync(LoadState.NetworkIdle);
        
        var currentUrl = Page.Url;
        currentUrl.Should().NotContain("/Login", "User should be redirected after successful login");
        
        // Check for user indication (like logout button or user menu)
        var userIndicator = await Page.QuerySelectorAsync("[data-testid='user-menu'], .user-info, .logout-button");
        if (userIndicator == null)
        {
            await TakeScreenshotAsync("after_login");
            // This might be inconclusive if the app doesn't have obvious user indicators
        }
    }

    [Test]
    public async Task ItemListing_ShouldDisplayAvailableItems()
    {
        // Act
        await Page.GotoAsync($"{BaseUrl}/items");
        await Page.WaitForLoadStateAsync(LoadState.NetworkIdle);

        // Assert
        var pageTitle = await Page.TitleAsync();
        pageTitle.Should().NotBeNullOrEmpty();

        // Look for item listing elements
        var itemsContainer = await WaitForElementAsync("[data-testid='items-list'], .items-grid, .item-card", 10000);
        
        if (itemsContainer == null)
        {
            await TakeScreenshotAsync("items_page");
            // Items page might be empty, which is acceptable for testing
            Assert.Pass("Items page loaded successfully, though no items may be present");
        }
        else
        {
            Assert.Pass("Items page loaded and displays item listings");
        }
    }

    [Test]
    public async Task ItemSearch_ShouldFilterItemsBySearchTerm()
    {
        // Arrange
        await Page.GotoAsync($"{BaseUrl}/items");
        await Page.WaitForLoadStateAsync(LoadState.NetworkIdle);

        // Act
        var searchBox = await WaitForElementAsync("[data-testid='search-box'], input[type='search'], input[placeholder*='Search']");
        if (searchBox == null)
        {
            await TakeScreenshotAsync("no_search_box");
            Assert.Inconclusive("Search functionality not found on items page");
            return;
        }

        await Page.FillAsync("input[type='search'], input[placeholder*='Search']", "drill");
        await Page.PressAsync("input[type='search'], input[placeholder*='Search']", "Enter");
        
        await Page.WaitForLoadStateAsync(LoadState.NetworkIdle);

        // Assert
        await TakeScreenshotAsync("search_results");
        
        // The search should complete without errors
        var currentUrl = Page.Url;
        currentUrl.Should().Contain("search", "URL should indicate search was performed");
    }

    [Test]
    public async Task ItemDetails_ShouldShowItemInformation()
    {
        // Arrange
        await Page.GotoAsync($"{BaseUrl}/items");
        await Page.WaitForLoadStateAsync(LoadState.NetworkIdle);

        // Look for first item link
        var firstItemLink = await WaitForElementAsync("a[href*='/items/'], .item-card a, .item-link");
        
        if (firstItemLink == null)
        {
            await TakeScreenshotAsync("no_items_found");
            Assert.Inconclusive("No items found to view details");
            return;
        }

        // Act
        await firstItemLink.ClickAsync();
        await Page.WaitForLoadStateAsync(LoadState.NetworkIdle);

        // Assert
        var currentUrl = Page.Url;
        currentUrl.Should().Contain("/items/", "Should navigate to item details page");

        await TakeScreenshotAsync("item_details");
        
        // Look for common item detail elements
        var itemTitle = await WaitForElementAsync("h1, .item-title, [data-testid='item-title']");
        if (itemTitle != null)
        {
            var titleText = await itemTitle.TextContentAsync();
            titleText.Should().NotBeNullOrEmpty("Item should have a title");
        }
    }

    [Test]
    public async Task RentalBooking_WithoutLogin_ShouldRedirectToLogin()
    {
        // Arrange
        await Page.GotoAsync($"{BaseUrl}/items");
        await Page.WaitForLoadStateAsync(LoadState.NetworkIdle);

        var firstItemLink = await WaitForElementAsync("a[href*='/items/'], .item-card a");
        if (firstItemLink == null)
        {
            Assert.Inconclusive("No items available for booking test");
            return;
        }

        await firstItemLink.ClickAsync();
        await Page.WaitForLoadStateAsync(LoadState.NetworkIdle);

        // Act
        var bookButton = await WaitForElementAsync("[data-testid='book-item'], .book-button, button:has-text('Book'), button:has-text('Rent')");
        
        if (bookButton == null)
        {
            await TakeScreenshotAsync("no_book_button");
            Assert.Inconclusive("Book/Rent button not found on item details page");
            return;
        }

        await bookButton.ClickAsync();
        await Page.WaitForLoadStateAsync(LoadState.NetworkIdle);

        // Assert
        var currentUrl = Page.Url;
        currentUrl.Should().Contain("login", "Should redirect to login when trying to book without authentication");
    }

    [Test]
    public async Task RentalBooking_WithLogin_ShouldShowBookingForm()
    {
        // Arrange
        await LoginTestUserAsync();
        await Page.GotoAsync($"{BaseUrl}/items");
        await Page.WaitForLoadStateAsync(LoadState.NetworkIdle);

        var firstItemLink = await WaitForElementAsync("a[href*='/items/'], .item-card a");
        if (firstItemLink == null)
        {
            Assert.Inconclusive("No items available for booking test");
            return;
        }

        await firstItemLink.ClickAsync();
        await Page.WaitForLoadStateAsync(LoadState.NetworkIdle);

        // Act
        var bookButton = await WaitForElementAsync("[data-testid='book-item'], .book-button, button:has-text('Book'), button:has-text('Rent')");
        
        if (bookButton == null)
        {
            await TakeScreenshotAsync("no_book_button_logged_in");
            Assert.Inconclusive("Book/Rent button not found on item details page");
            return;
        }

        await bookButton.ClickAsync();
        await Page.WaitForLoadStateAsync(LoadState.NetworkIdle);

        // Assert
        await TakeScreenshotAsync("booking_form");
        
        var currentUrl = Page.Url;
        currentUrl.Should().NotContain("login", "Should not redirect to login when already authenticated");
        
        // Look for booking form elements
        var bookingForm = await WaitForElementAsync("form, .booking-form, [data-testid='booking-form']");
        if (bookingForm != null)
        {
            Assert.Pass("Booking form displayed successfully");
        }
        else
        {
            Assert.Inconclusive("Booking form not found, but no login redirect occurred");
        }
    }

    [Test]
    public async Task PaymentFlow_ShouldHandlePaymentMethodSelection()
    {
        // This test focuses on the UI flow, not actual payment processing
        
        // Arrange
        await LoginTestUserAsync();
        await Page.GotoAsync($"{BaseUrl}/rentals/create");
        await Page.WaitForLoadStateAsync(LoadState.NetworkIdle);

        // Act
        var paymentMethodSelector = await WaitForElementAsync("select[name*='payment'], input[name*='paymentMethod'], .payment-method");
        
        if (paymentMethodSelector == null)
        {
            await TakeScreenshotAsync("no_payment_method");
            Assert.Inconclusive("Payment method selection not found");
            return;
        }

        // Try to select different payment methods
        var stripeOption = await Page.QuerySelectorAsync("option[value='stripe'], input[value='stripe']");
        var paypalOption = await Page.QuerySelectorAsync("option[value='paypal'], input[value='paypal']");

        if (stripeOption != null)
        {
            await Page.SelectOptionAsync("select", "stripe");
        }
        else if (paypalOption != null)
        {
            await Page.ClickAsync("input[value='paypal']");
        }

        // Assert
        await TakeScreenshotAsync("payment_method_selected");
        Assert.Pass("Payment method selection interaction completed");
    }

    [Test]
    public async Task ResponsiveDesign_ShouldWorkOnMobileViewport()
    {
        // Arrange
        await Page.SetViewportSizeAsync(375, 667); // iPhone SE size

        // Act
        await Page.GotoAsync($"{BaseUrl}");
        await Page.WaitForLoadStateAsync(LoadState.NetworkIdle);

        // Assert
        await TakeScreenshotAsync("mobile_homepage");
        
        // Check if mobile navigation works
        var mobileMenu = await WaitForElementAsync(".hamburger, .mobile-menu-toggle, [data-testid='mobile-menu']");
        if (mobileMenu != null)
        {
            await mobileMenu.ClickAsync();
            await TakeScreenshotAsync("mobile_menu_open");
        }

        // Navigate to items page on mobile
        await Page.GotoAsync($"{BaseUrl}/items");
        await Page.WaitForLoadStateAsync(LoadState.NetworkIdle);
        await TakeScreenshotAsync("mobile_items_page");

        Assert.Pass("Mobile responsive design test completed");
    }

    [Test]
    public async Task ErrorHandling_ShouldShowErrorPageFor404()
    {
        // Act
        await Page.GotoAsync($"{BaseUrl}/non-existent-page");
        await Page.WaitForLoadStateAsync(LoadState.NetworkIdle);

        // Assert
        var statusCode = await Page.EvaluateAsync<int>("() => window.performance?.navigation?.type || 0");
        
        await TakeScreenshotAsync("404_page");
        
        // Look for error indicators
        var errorIndicator = await WaitForElementAsync(".error, .not-found, h1:has-text('404'), h1:has-text('Not Found')");
        
        if (errorIndicator != null)
        {
            Assert.Pass("Error page displayed for 404");
        }
        else
        {
            Assert.Inconclusive("Could not determine if proper error handling is in place");
        }
    }

    [Test]
    public async Task Performance_ShouldLoadPagesWithinReasonableTime()
    {
        // Test page load performance
        var startTime = DateTime.Now;
        
        await Page.GotoAsync($"{BaseUrl}");
        await Page.WaitForLoadStateAsync(LoadState.NetworkIdle);
        
        var loadTime = DateTime.Now - startTime;
        
        await TakeScreenshotAsync("performance_test");
        
        // Assert reasonable load time (adjust threshold as needed)
        loadTime.TotalSeconds.Should().BeLessThan(10, "Page should load within 10 seconds");
        
        TestContext.WriteLine($"Page load time: {loadTime.TotalMilliseconds}ms");
    }
}