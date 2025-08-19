using AutoFixture;
using AutoFixture.AutoMoq;
using DorfkisteBlazor.Application.Features.Items.Queries;
using DorfkisteBlazor.Application.Tests.TestFixtures;
using DorfkisteBlazor.Domain.Entities;
using DorfkisteBlazor.Domain.Interfaces;
using FluentAssertions;
using Moq;
using NUnit.Framework;

namespace DorfkisteBlazor.Application.Tests.Features.Items;

/// <summary>
/// Unit tests for GetItemsQueryHandler with comprehensive CQRS testing
/// </summary>
[TestFixture]
public class GetItemsQueryHandlerTests
{
    private IFixture _fixture;
    private MockRepositoryFactory _mockFactory;
    private Mock<IRepository<Item>> _mockItemRepository;
    private GetItemsQueryHandler _handler;
    private List<Item> _testItems;

    [SetUp]
    public void SetUp()
    {
        _fixture = new Fixture().Customize(new AutoMoqCustomization());
        _mockFactory = new MockRepositoryFactory();
        _testItems = CreateTestItems();
        _mockItemRepository = _mockFactory.CreateMockRepository(_testItems);
        _handler = new GetItemsQueryHandler(_mockItemRepository.Object);
    }

    [Test]
    public async Task Handle_WithValidRequest_ShouldReturnSuccessResult()
    {
        // Arrange
        var query = new GetItemsQuery
        {
            Page = 1,
            PageSize = 10,
            AvailableOnly = true
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Items.Should().NotBeEmpty();
    }

    [Test]
    public async Task Handle_WithAvailableOnlyFilter_ShouldReturnOnlyAvailableItems()
    {
        // Arrange
        var query = new GetItemsQuery
        {
            Page = 1,
            PageSize = 10,
            AvailableOnly = true
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Items.Should().OnlyContain(item => item.Available);
    }

    [Test]
    public async Task Handle_WithSearchTerm_ShouldReturnMatchingItems()
    {
        // Arrange
        var searchTerm = "drill";
        var query = new GetItemsQuery
        {
            Page = 1,
            PageSize = 10,
            SearchTerm = searchTerm
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Items.Should().OnlyContain(item =>
            item.Title.ToLower().Contains(searchTerm.ToLower()) ||
            (item.Description != null && item.Description.ToLower().Contains(searchTerm.ToLower())));
    }

    [Test]
    public async Task Handle_WithCategoryFilter_ShouldReturnItemsFromCategory()
    {
        // Arrange
        var categoryId = _testItems.First().CategoryId;
        var query = new GetItemsQuery
        {
            Page = 1,
            PageSize = 10,
            CategoryId = categoryId
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Items.Should().OnlyContain(item => item.CategoryId == categoryId);
    }

    [Test]
    public async Task Handle_WithLocationFilter_ShouldReturnItemsFromLocation()
    {
        // Arrange
        var location = "Berlin";
        var query = new GetItemsQuery
        {
            Page = 1,
            PageSize = 10,
            Location = location
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Items.Should().OnlyContain(item =>
            item.Location.ToLower().Contains(location.ToLower()));
    }

    [Test]
    public async Task Handle_WithPriceRange_ShouldReturnItemsInRange()
    {
        // Arrange
        var minPrice = 20m;
        var maxPrice = 100m;
        var query = new GetItemsQuery
        {
            Page = 1,
            PageSize = 10,
            MinPrice = minPrice,
            MaxPrice = maxPrice
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Items.Should().OnlyContain(item =>
            (item.PricePerDay >= minPrice && item.PricePerDay <= maxPrice) ||
            (item.PricePerHour >= minPrice && item.PricePerHour <= maxPrice));
    }

    [Test]
    public async Task Handle_WithConditionFilter_ShouldReturnItemsWithCondition()
    {
        // Arrange
        var condition = "neu";
        var query = new GetItemsQuery
        {
            Page = 1,
            PageSize = 10,
            Condition = condition
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Items.Should().OnlyContain(item =>
            item.Condition.ToLower() == condition.ToLower());
    }

    [Test]
    public async Task Handle_WithDeliveryFilter_ShouldReturnItemsWithDelivery()
    {
        // Arrange
        var query = new GetItemsQuery
        {
            Page = 1,
            PageSize = 10,
            DeliveryAvailable = true
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Items.Should().OnlyContain(item => item.DeliveryAvailable);
    }

    [TestCase("title", "asc")]
    [TestCase("title", "desc")]
    [TestCase("price", "asc")]
    [TestCase("price", "desc")]
    [TestCase("location", "asc")]
    [TestCase("location", "desc")]
    public async Task Handle_WithSorting_ShouldReturnSortedItems(string sortBy, string sortDirection)
    {
        // Arrange
        var query = new GetItemsQuery
        {
            Page = 1,
            PageSize = 10,
            SortBy = sortBy,
            SortDirection = sortDirection
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Items.Should().NotBeEmpty();

        // Verify sorting based on the field
        var items = result.Value.Items.ToList();
        if (items.Count > 1)
        {
            switch (sortBy.ToLower())
            {
                case "title":
                    if (sortDirection.ToLower() == "asc")
                        items.Should().BeInAscendingOrder(x => x.Title);
                    else
                        items.Should().BeInDescendingOrder(x => x.Title);
                    break;
                case "price":
                    if (sortDirection.ToLower() == "asc")
                        items.Should().BeInAscendingOrder(x => x.PricePerDay ?? x.PricePerHour ?? 0);
                    else
                        items.Should().BeInDescendingOrder(x => x.PricePerDay ?? x.PricePerHour ?? 0);
                    break;
                case "location":
                    if (sortDirection.ToLower() == "asc")
                        items.Should().BeInAscendingOrder(x => x.Location);
                    else
                        items.Should().BeInDescendingOrder(x => x.Location);
                    break;
            }
        }
    }

    [Test]
    public async Task Handle_WithPagination_ShouldReturnCorrectPage()
    {
        // Arrange
        var query = new GetItemsQuery
        {
            Page = 2,
            PageSize = 2
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Page.Should().Be(2);
        result.Value.PageSize.Should().Be(2);
        result.Value.Items.Should().HaveCountLessOrEqualTo(2);
    }

    [Test]
    public async Task Handle_ShouldReturnCorrectTotalCount()
    {
        // Arrange
        var query = new GetItemsQuery
        {
            Page = 1,
            PageSize = 2
        };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.TotalCount.Should().Be(_testItems.Count);
    }

    [Test]
    public async Task Handle_WithRepositoryException_ShouldReturnFailureResult()
    {
        // Arrange
        _mockItemRepository.Setup(r => r.GetQueryable())
            .Throws(new Exception("Database connection failed"));

        var query = new GetItemsQuery { Page = 1, PageSize = 10 };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("Error retrieving items");
        result.Error.Should().Contain("Database connection failed");
    }

    [Test]
    public async Task Handle_WithEmptyRepository_ShouldReturnEmptyResult()
    {
        // Arrange
        var emptyRepository = _mockFactory.CreateMockRepository(new List<Item>());
        var handler = new GetItemsQueryHandler(emptyRepository.Object);
        var query = new GetItemsQuery { Page = 1, PageSize = 10 };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Items.Should().BeEmpty();
        result.Value.TotalCount.Should().Be(0);
    }

    private List<Item> CreateTestItems()
    {
        var userId1 = Guid.NewGuid();
        var userId2 = Guid.NewGuid();
        var categoryId1 = Guid.NewGuid();
        var categoryId2 = Guid.NewGuid();

        return new List<Item>
        {
            new Item
            {
                Id = Guid.NewGuid(),
                Title = "Electric Drill",
                Description = "Powerful electric drill for home projects",
                Condition = "neu",
                PricePerDay = 25m,
                PricePerHour = 5m,
                Deposit = 100m,
                Available = true,
                Location = "Berlin",
                DeliveryAvailable = true,
                DeliveryFee = 10m,
                UserId = userId1,
                CategoryId = categoryId1,
                User = new User { Id = userId1, Name = "John Doe", Email = "john.doe@example.com", AvatarUrl = "avatar1.jpg" },
                Category = new Category { Id = categoryId1, Name = "Tools", Slug = "tools" },
                CreatedAt = DateTime.Now.AddDays(-10),
                UpdatedAt = DateTime.Now.AddDays(-5)
            },
            new Item
            {
                Id = Guid.NewGuid(),
                Title = "Camping Tent",
                Description = "4-person camping tent, waterproof",
                Condition = "sehr gut",
                PricePerDay = 40m,
                Deposit = 150m,
                Available = true,
                Location = "Munich",
                DeliveryAvailable = false,
                UserId = userId2,
                CategoryId = categoryId2,
                User = new User { Id = userId2, Name = "Jane Smith", Email = "jane.smith@example.com", AvatarUrl = "avatar2.jpg" },
                Category = new Category { Id = categoryId2, Name = "Outdoor", Slug = "outdoor" },
                CreatedAt = DateTime.Now.AddDays(-5),
                UpdatedAt = DateTime.Now.AddDays(-2)
            },
            new Item
            {
                Id = Guid.NewGuid(),
                Title = "Power Drill Pro",
                Description = "Professional grade power drill",
                Condition = "gut",
                PricePerDay = 35m,
                PricePerHour = 7m,
                Deposit = 120m,
                Available = false,
                Location = "Berlin",
                DeliveryAvailable = true,
                DeliveryFee = 15m,
                UserId = userId1,
                CategoryId = categoryId1,
                User = new User { Id = userId1, Name = "John Doe", Email = "john.doe@example.com", AvatarUrl = "avatar1.jpg" },
                Category = new Category { Id = categoryId1, Name = "Tools", Slug = "tools" },
                CreatedAt = DateTime.Now.AddDays(-15),
                UpdatedAt = DateTime.Now.AddDays(-1)
            }
        };
    }
}