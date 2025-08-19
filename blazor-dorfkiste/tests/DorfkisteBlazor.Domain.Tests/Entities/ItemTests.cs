using DorfkisteBlazor.Domain.Entities;
using DorfkisteBlazor.Domain.Tests.TestFixtures;
using FluentAssertions;
using NUnit.Framework;

namespace DorfkisteBlazor.Domain.Tests.Entities;

/// <summary>
/// Unit tests for Item entity validation and business logic
/// </summary>
[TestFixture]
public class ItemTests
{
    private TestDataBuilder _testDataBuilder;

    [SetUp]
    public void SetUp()
    {
        _testDataBuilder = new TestDataBuilder();
    }

    [Test]
    public void Item_WhenCreatedWithValidData_ShouldHaveCorrectProperties()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var categoryId = Guid.NewGuid();
        var item = _testDataBuilder.Item()
            .WithTitle("Test Drill")
            .WithUser(userId)
            .WithCategory(categoryId)
            .Build();

        // Act & Assert
        item.Title.Should().Be("Test Drill");
        item.UserId.Should().Be(userId);
        item.CategoryId.Should().Be(categoryId);
        item.Available.Should().BeTrue();
        item.PickupAvailable.Should().BeTrue();
        item.DeliveryAvailable.Should().BeFalse();
    }

    [Test]
    public void Item_WhenCreated_ShouldBeAvailableByDefault()
    {
        // Arrange & Act
        var item = _testDataBuilder.Item().Build();

        // Assert
        item.Available.Should().BeTrue();
    }

    [Test]
    public void Item_WhenCreated_ShouldHavePickupAvailableByDefault()
    {
        // Arrange & Act
        var item = _testDataBuilder.Item().Build();

        // Assert
        item.PickupAvailable.Should().BeTrue();
    }

    [Test]
    public void Item_WhenCreated_ShouldNotHaveDeliveryAvailableByDefault()
    {
        // Arrange & Act
        var item = _testDataBuilder.Item().Build();

        // Assert
        item.DeliveryAvailable.Should().BeFalse();
    }

    [TestCase("neu")]
    [TestCase("sehr gut")]
    [TestCase("gut")]
    [TestCase("gebraucht")]
    public void Item_WhenCreatedWithValidCondition_ShouldAcceptCondition(string condition)
    {
        // Arrange & Act
        var item = new Item
        {
            Title = "Test Item",
            Condition = condition,
            Location = "Test Location",
            UserId = Guid.NewGuid(),
            CategoryId = Guid.NewGuid()
        };

        // Assert
        item.Condition.Should().Be(condition);
    }

    [Test]
    public void Item_WithDeliveryEnabled_ShouldHaveValidDeliveryDetails()
    {
        // Arrange & Act
        var item = _testDataBuilder.Item()
            .WithDelivery(fee: 25m, radius: 15.0)
            .Build();

        // Assert
        item.DeliveryAvailable.Should().BeTrue();
        item.DeliveryFee.Should().Be(25m);
        item.DeliveryRadius.Should().Be(15.0);
    }

    [Test]
    public void Item_WhenMadeUnavailable_ShouldReflectStatus()
    {
        // Arrange & Act
        var item = _testDataBuilder.Item()
            .AsUnavailable()
            .Build();

        // Assert
        item.Available.Should().BeFalse();
    }

    [Test]
    public void Item_ShouldHaveValidNavigationProperties()
    {
        // Arrange & Act
        var item = _testDataBuilder.Item().Build();

        // Assert
        item.Rentals.Should().NotBeNull();
        item.Images.Should().NotBeNull();
        item.WatchlistItems.Should().NotBeNull();
    }

    [Test]
    public void Item_WithCoordinates_ShouldAcceptValidCoordinates()
    {
        // Arrange
        const double validLatitude = 52.520008;
        const double validLongitude = 13.404954;

        // Act
        var item = new Item
        {
            Title = "Test Item",
            Condition = "neu",
            Location = "Berlin",
            Latitude = validLatitude,
            Longitude = validLongitude,
            UserId = Guid.NewGuid(),
            CategoryId = Guid.NewGuid()
        };

        // Assert
        item.Latitude.Should().Be(validLatitude);
        item.Longitude.Should().Be(validLongitude);
    }

    [Test]
    public void Item_PriceValidation_ShouldAcceptValidPrices()
    {
        // Arrange & Act
        var item = new Item
        {
            Title = "Test Item",
            Condition = "neu",
            Location = "Test Location",
            PricePerDay = 50.00m,
            PricePerHour = 5.00m,
            Deposit = 100.00m,
            UserId = Guid.NewGuid(),
            CategoryId = Guid.NewGuid()
        };

        // Assert
        item.PricePerDay.Should().Be(50.00m);
        item.PricePerHour.Should().Be(5.00m);
        item.Deposit.Should().Be(100.00m);
    }

    [Test]
    public void Item_RequiredFields_ShouldBeSet()
    {
        // Arrange
        var title = "Required Title";
        var condition = "neu";
        var location = "Required Location";
        var userId = Guid.NewGuid();
        var categoryId = Guid.NewGuid();

        // Act
        var item = new Item
        {
            Title = title,
            Condition = condition,
            Location = location,
            UserId = userId,
            CategoryId = categoryId
        };

        // Assert
        item.Title.Should().Be(title);
        item.Condition.Should().Be(condition);
        item.Location.Should().Be(location);
        item.UserId.Should().Be(userId);
        item.CategoryId.Should().Be(categoryId);
    }
}