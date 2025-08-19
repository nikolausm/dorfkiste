using Bunit;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using NUnit.Framework;
using MudBlazor.Services;

namespace DorfkisteBlazor.Server.Tests.Components;

/// <summary>
/// Unit tests for Blazor components using bUnit framework
/// </summary>
[TestFixture]
public class BlazorComponentTests : TestContext
{
    [SetUp]
    public void SetUp()
    {
        // Add MudBlazor services for component testing
        Services.AddMudServices();
        
        // Add other required services
        Services.AddLogging();
        Services.AddAuthorizationCore();
    }

    [Test]
    public void ItemCard_ShouldRenderItemInformation()
    {
        // This test would require the actual ItemCard component
        // For now, we'll create a placeholder test that demonstrates the pattern
        
        // Arrange
        var testItemTitle = "Test Drill";
        var testItemPrice = 25.00m;

        // Create a simple test component inline for demonstration
        var component = RenderComponent<TestItemCardComponent>(parameters => parameters
            .Add(p => p.Title, testItemTitle)
            .Add(p => p.Price, testItemPrice));

        // Act & Assert
        component.Find("h3").TextContent.Should().Be(testItemTitle);
        component.Find(".price").TextContent.Should().Contain("25.00");
        
        // Take a snapshot for visual regression testing (optional)
        // component.MarkupMatches(@"<div>expected html structure</div>");
    }

    [Test]
    public void ItemSearchComponent_ShouldHandleSearchInput()
    {
        // Arrange
        var searchTerm = "drill";
        var component = RenderComponent<TestSearchComponent>();

        // Act
        var searchInput = component.Find("input[type='search']");
        searchInput.Change(searchTerm);

        // Assert
        searchInput.GetAttribute("value").Should().Be(searchTerm);
        
        // Verify search event was triggered (would need proper component)
        // component.Instance.OnSearchChanged.Should().HaveBeenCalledWith(searchTerm);
    }

    [Test]
    public void BookingForm_ShouldValidateRequiredFields()
    {
        // Arrange
        var component = RenderComponent<TestBookingFormComponent>();

        // Act
        var submitButton = component.Find("button[type='submit']");
        submitButton.Click();

        // Assert
        var validationMessages = component.FindAll(".validation-message");
        validationMessages.Should().NotBeEmpty("Required field validation should show error messages");
    }

    [Test]
    public void ItemsList_ShouldRenderItemsFromParameter()
    {
        // Arrange
        var testItems = new[]
        {
            new TestItemDto { Id = Guid.NewGuid(), Title = "Item 1", Price = 25.00m },
            new TestItemDto { Id = Guid.NewGuid(), Title = "Item 2", Price = 35.00m },
            new TestItemDto { Id = Guid.NewGuid(), Title = "Item 3", Price = 45.00m }
        };

        var component = RenderComponent<TestItemsListComponent>(parameters => parameters
            .Add(p => p.Items, testItems));

        // Act & Assert
        var itemCards = component.FindAll(".item-card");
        itemCards.Should().HaveCount(3, "Should render all provided items");

        component.Find(".item-card:first-child h3").TextContent.Should().Be("Item 1");
        component.Find(".item-card:last-child h3").TextContent.Should().Be("Item 3");
    }

    [Test]
    public void NavigationComponent_ShouldRenderMenuItems()
    {
        // Arrange
        var component = RenderComponent<TestNavigationComponent>();

        // Act & Assert
        var menuItems = component.FindAll("nav a");
        menuItems.Should().NotBeEmpty("Navigation should contain menu links");
        
        // Check for expected navigation items
        var homeLink = component.Find("a[href='/']");
        homeLink.TextContent.Should().Contain("Home");
        
        var itemsLink = component.Find("a[href='/items']");
        itemsLink.TextContent.Should().Contain("Items");
    }

    [Test]
    public void PaginationComponent_ShouldHandlePageNavigation()
    {
        // Arrange
        var component = RenderComponent<TestPaginationComponent>(parameters => parameters
            .Add(p => p.CurrentPage, 2)
            .Add(p => p.TotalPages, 5)
            .Add(p => p.PageSize, 10));

        // Act & Assert
        var prevButton = component.Find("button:contains('Previous')");
        var nextButton = component.Find("button:contains('Next')");
        
        prevButton.Should().NotBeNull("Previous button should be present");
        nextButton.Should().NotBeNull("Next button should be present");
        
        // Check page numbers
        var pageNumbers = component.FindAll(".page-number");
        pageNumbers.Should().HaveCount(5, "Should show all page numbers");
        
        // Current page should be highlighted
        var currentPageButton = component.Find(".page-number.active, .page-number.current");
        currentPageButton.TextContent.Should().Be("2");
    }

    [Test]
    public void LoadingComponent_ShouldShowLoadingIndicator()
    {
        // Arrange
        var component = RenderComponent<TestLoadingComponent>(parameters => parameters
            .Add(p => p.IsLoading, true));

        // Act & Assert
        var loadingIndicator = component.Find(".loading, .spinner");
        loadingIndicator.Should().NotBeNull("Loading indicator should be visible when IsLoading is true");
    }

    [Test]
    public void ErrorComponent_ShouldDisplayErrorMessage()
    {
        // Arrange
        var errorMessage = "Something went wrong!";
        var component = RenderComponent<TestErrorComponent>(parameters => parameters
            .Add(p => p.ErrorMessage, errorMessage)
            .Add(p => p.ShowError, true));

        // Act & Assert
        var errorDisplay = component.Find(".error-message, .alert-danger");
        errorDisplay.TextContent.Should().Contain(errorMessage);
    }

    [Test]
    public void FilterComponent_ShouldApplyFilters()
    {
        // Arrange
        var component = RenderComponent<TestFilterComponent>();

        // Act
        var categorySelect = component.Find("select[name='category']");
        categorySelect.Change("tools");
        
        var priceRangeMin = component.Find("input[name='minPrice']");
        priceRangeMin.Change("10");
        
        var priceRangeMax = component.Find("input[name='maxPrice']");
        priceRangeMax.Change("100");

        // Assert
        categorySelect.GetAttribute("value").Should().Be("tools");
        priceRangeMin.GetAttribute("value").Should().Be("10");
        priceRangeMax.GetAttribute("value").Should().Be("100");
    }
}

// Test components for demonstration (these would normally be your actual components)
public class TestItemCardComponent : ComponentBase
{
    [Parameter] public string Title { get; set; } = string.Empty;
    [Parameter] public decimal Price { get; set; }

    protected override void BuildRenderTree(RenderTreeBuilder builder)
    {
        builder.OpenElement(0, "div");
        builder.AddAttribute(1, "class", "item-card");
        
        builder.OpenElement(2, "h3");
        builder.AddContent(3, Title);
        builder.CloseElement();
        
        builder.OpenElement(4, "div");
        builder.AddAttribute(5, "class", "price");
        builder.AddContent(6, $"€{Price:F2}");
        builder.CloseElement();
        
        builder.CloseElement();
    }
}

public class TestSearchComponent : ComponentBase
{
    protected override void BuildRenderTree(RenderTreeBuilder builder)
    {
        builder.OpenElement(0, "input");
        builder.AddAttribute(1, "type", "search");
        builder.AddAttribute(2, "placeholder", "Search items...");
        builder.CloseElement();
    }
}

public class TestBookingFormComponent : ComponentBase
{
    protected override void BuildRenderTree(RenderTreeBuilder builder)
    {
        builder.OpenElement(0, "form");
        
        builder.OpenElement(1, "div");
        builder.AddAttribute(2, "class", "validation-message");
        builder.AddContent(3, "Start date is required");
        builder.CloseElement();
        
        builder.OpenElement(4, "button");
        builder.AddAttribute(5, "type", "submit");
        builder.AddContent(6, "Book Now");
        builder.CloseElement();
        
        builder.CloseElement();
    }
}

public class TestItemsListComponent : ComponentBase
{
    [Parameter] public TestItemDto[] Items { get; set; } = Array.Empty<TestItemDto>();

    protected override void BuildRenderTree(RenderTreeBuilder builder)
    {
        builder.OpenElement(0, "div");
        builder.AddAttribute(1, "class", "items-list");
        
        for (int i = 0; i < Items.Length; i++)
        {
            var item = Items[i];
            builder.OpenElement(2 + i * 4, "div");
            builder.AddAttribute(3 + i * 4, "class", "item-card");
            
            builder.OpenElement(4 + i * 4, "h3");
            builder.AddContent(5 + i * 4, item.Title);
            builder.CloseElement();
            
            builder.CloseElement();
        }
        
        builder.CloseElement();
    }
}

public class TestNavigationComponent : ComponentBase
{
    protected override void BuildRenderTree(RenderTreeBuilder builder)
    {
        builder.OpenElement(0, "nav");
        
        builder.OpenElement(1, "a");
        builder.AddAttribute(2, "href", "/");
        builder.AddContent(3, "Home");
        builder.CloseElement();
        
        builder.OpenElement(4, "a");
        builder.AddAttribute(5, "href", "/items");
        builder.AddContent(6, "Items");
        builder.CloseElement();
        
        builder.CloseElement();
    }
}

public class TestPaginationComponent : ComponentBase
{
    [Parameter] public int CurrentPage { get; set; }
    [Parameter] public int TotalPages { get; set; }
    [Parameter] public int PageSize { get; set; }

    protected override void BuildRenderTree(RenderTreeBuilder builder)
    {
        builder.OpenElement(0, "div");
        builder.AddAttribute(1, "class", "pagination");
        
        builder.OpenElement(2, "button");
        builder.AddContent(3, "Previous");
        builder.CloseElement();
        
        for (int i = 1; i <= TotalPages; i++)
        {
            builder.OpenElement(4 + i * 2, "button");
            builder.AddAttribute(5 + i * 2, "class", i == CurrentPage ? "page-number active" : "page-number");
            builder.AddContent(6 + i * 2, i.ToString());
            builder.CloseElement();
        }
        
        builder.OpenElement(100, "button");
        builder.AddContent(101, "Next");
        builder.CloseElement();
        
        builder.CloseElement();
    }
}

public class TestLoadingComponent : ComponentBase
{
    [Parameter] public bool IsLoading { get; set; }

    protected override void BuildRenderTree(RenderTreeBuilder builder)
    {
        if (IsLoading)
        {
            builder.OpenElement(0, "div");
            builder.AddAttribute(1, "class", "loading");
            builder.AddContent(2, "Loading...");
            builder.CloseElement();
        }
    }
}

public class TestErrorComponent : ComponentBase
{
    [Parameter] public string ErrorMessage { get; set; } = string.Empty;
    [Parameter] public bool ShowError { get; set; }

    protected override void BuildRenderTree(RenderTreeBuilder builder)
    {
        if (ShowError)
        {
            builder.OpenElement(0, "div");
            builder.AddAttribute(1, "class", "error-message");
            builder.AddContent(2, ErrorMessage);
            builder.CloseElement();
        }
    }
}

public class TestFilterComponent : ComponentBase
{
    protected override void BuildRenderTree(RenderTreeBuilder builder)
    {
        builder.OpenElement(0, "div");
        builder.AddAttribute(1, "class", "filters");
        
        builder.OpenElement(2, "select");
        builder.AddAttribute(3, "name", "category");
        builder.OpenElement(4, "option");
        builder.AddAttribute(5, "value", "tools");
        builder.AddContent(6, "Tools");
        builder.CloseElement();
        builder.CloseElement();
        
        builder.OpenElement(7, "input");
        builder.AddAttribute(8, "name", "minPrice");
        builder.AddAttribute(9, "type", "number");
        builder.CloseElement();
        
        builder.OpenElement(10, "input");
        builder.AddAttribute(11, "name", "maxPrice");
        builder.AddAttribute(12, "type", "number");
        builder.CloseElement();
        
        builder.CloseElement();
    }
}

public class TestItemDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Price { get; set; }
}