using AutoFixture;
using AutoFixture.AutoMoq;
using DorfkisteBlazor.Application.Features.Rentals.Commands;
using DorfkisteBlazor.Application.Tests.TestFixtures;
using DorfkisteBlazor.Domain.Entities;
using DorfkisteBlazor.Domain.Interfaces;
using FluentAssertions;
using Moq;
using NUnit.Framework;

namespace DorfkisteBlazor.Application.Tests.Features.Rentals;

/// <summary>
/// Unit tests for CreateRentalCommandHandler with comprehensive business logic testing
/// </summary>
[TestFixture]
public class CreateRentalCommandHandlerTests
{
    private IFixture _fixture;
    private MockRepositoryFactory _mockFactory;
    private Mock<IRepository<Rental>> _mockRentalRepository;
    private Mock<IRepository<Item>> _mockItemRepository;
    private Mock<IRepository<PlatformSettings>> _mockSettingsRepository;
    private Mock<IUnitOfWork> _mockUnitOfWork;
    private CreateRentalCommandHandler _handler;
    private List<Item> _testItems;
    private List<Rental> _testRentals;
    private List<PlatformSettings> _testSettings;

    [SetUp]
    public void SetUp()
    {
        _fixture = new Fixture().Customize(new AutoMoqCustomization());
        _mockFactory = new MockRepositoryFactory();
        
        _testItems = CreateTestItems();
        _testRentals = CreateTestRentals();
        _testSettings = CreateTestSettings();

        _mockItemRepository = _mockFactory.CreateMockRepository(_testItems);
        _mockRentalRepository = _mockFactory.CreateMockRepository(_testRentals);
        _mockSettingsRepository = _mockFactory.CreateMockRepository(_testSettings);
        _mockUnitOfWork = _mockFactory.CreateMockUnitOfWork();

        _handler = new CreateRentalCommandHandler(
            _mockRentalRepository.Object,
            _mockItemRepository.Object,
            _mockSettingsRepository.Object,
            _mockUnitOfWork.Object);
    }

    [Test]
    public async Task Handle_WithValidRequest_ShouldCreateRentalSuccessfully()
    {
        // Arrange
        var item = _testItems.First(i => i.Available);
        var command = new CreateRentalCommand
        {
            ItemId = item.Id,
            RenterId = Guid.NewGuid(),
            StartDate = DateTime.Now.AddDays(1),
            EndDate = DateTime.Now.AddDays(7),
            PaymentMethod = "stripe",
            DeliveryRequested = false
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.RentalId.Should().NotBeEmpty();
        result.Value.Status.Should().Be("pending");
        result.Value.PaymentStatus.Should().Be("pending");
    }

    [Test]
    public async Task Handle_WithNonExistentItem_ShouldReturnFailure()
    {
        // Arrange
        var command = new CreateRentalCommand
        {
            ItemId = Guid.NewGuid(), // Non-existent item
            RenterId = Guid.NewGuid(),
            StartDate = DateTime.Now.AddDays(1),
            EndDate = DateTime.Now.AddDays(7),
            PaymentMethod = "stripe"
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be("Item not found");
    }

    [Test]
    public async Task Handle_WithUnavailableItem_ShouldReturnFailure()
    {
        // Arrange
        var unavailableItem = _testItems.First(i => !i.Available);
        var command = new CreateRentalCommand
        {
            ItemId = unavailableItem.Id,
            RenterId = Guid.NewGuid(),
            StartDate = DateTime.Now.AddDays(1),
            EndDate = DateTime.Now.AddDays(7),
            PaymentMethod = "stripe"
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be("Item is not available for rental");
    }

    [Test]
    public async Task Handle_WhenRenterIsOwner_ShouldReturnFailure()
    {
        // Arrange
        var item = _testItems.First(i => i.Available);
        var command = new CreateRentalCommand
        {
            ItemId = item.Id,
            RenterId = item.UserId, // Same as owner
            StartDate = DateTime.Now.AddDays(1),
            EndDate = DateTime.Now.AddDays(7),
            PaymentMethod = "stripe"
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be("You cannot rent your own item");
    }

    [Test]
    public async Task Handle_WithConflictingRental_ShouldReturnFailure()
    {
        // Arrange
        var existingRental = _testRentals.First();
        var command = new CreateRentalCommand
        {
            ItemId = existingRental.ItemId,
            RenterId = Guid.NewGuid(),
            StartDate = existingRental.StartDate.AddDays(1), // Overlapping dates
            EndDate = existingRental.EndDate.AddDays(1),
            PaymentMethod = "stripe"
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be("Item is already booked for the selected dates");
    }

    [Test]
    public async Task Handle_WithDeliveryRequestedButNotAvailable_ShouldReturnFailure()
    {
        // Arrange
        var itemWithoutDelivery = _testItems.First(i => i.Available && !i.DeliveryAvailable);
        var command = new CreateRentalCommand
        {
            ItemId = itemWithoutDelivery.Id,
            RenterId = Guid.NewGuid(),
            StartDate = DateTime.Now.AddDays(1),
            EndDate = DateTime.Now.AddDays(7),
            PaymentMethod = "stripe",
            DeliveryRequested = true
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be("Delivery is not available for this item");
    }

    [Test]
    public async Task Handle_WithDeliveryRequestedButNoAddress_ShouldReturnFailure()
    {
        // Arrange
        var itemWithDelivery = _testItems.First(i => i.Available && i.DeliveryAvailable);
        var command = new CreateRentalCommand
        {
            ItemId = itemWithDelivery.Id,
            RenterId = Guid.NewGuid(),
            StartDate = DateTime.Now.AddDays(1),
            EndDate = DateTime.Now.AddDays(7),
            PaymentMethod = "stripe",
            DeliveryRequested = true,
            DeliveryAddress = null
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be("Delivery address is required when requesting delivery");
    }

    [Test]
    public async Task Handle_WithInvalidDateRange_ShouldReturnFailure()
    {
        // Arrange
        var item = _testItems.First(i => i.Available);
        var command = new CreateRentalCommand
        {
            ItemId = item.Id,
            RenterId = Guid.NewGuid(),
            StartDate = DateTime.Now.AddDays(7),
            EndDate = DateTime.Now.AddDays(1), // End date before start date
            PaymentMethod = "stripe"
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Be("End date must be after start date");
    }

    [Test]
    public async Task Handle_ShouldCalculatePricesCorrectly()
    {
        // Arrange
        var item = _testItems.First(i => i.Available && i.PricePerDay.HasValue);
        var rentalDays = 5;
        var expectedBasePrice = item.PricePerDay.Value * rentalDays;
        var expectedPlatformFee = expectedBasePrice * 0.10m; // 10% platform fee
        var expectedTotalPrice = expectedBasePrice + expectedPlatformFee;

        var command = new CreateRentalCommand
        {
            ItemId = item.Id,
            RenterId = Guid.NewGuid(),
            StartDate = DateTime.Now.AddDays(1),
            EndDate = DateTime.Now.AddDays(1 + rentalDays),
            PaymentMethod = "stripe",
            DeliveryRequested = false
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeTrue();
        result.Value.TotalPrice.Should().Be(expectedTotalPrice);
        result.Value.PlatformFee.Should().Be(expectedPlatformFee);
        result.Value.DeliveryFee.Should().Be(0);
        result.Value.DepositRequired.Should().Be(item.Deposit ?? 0);
    }

    [Test]
    public async Task Handle_WithDelivery_ShouldIncludeDeliveryFeeInTotal()
    {
        // Arrange
        var item = _testItems.First(i => i.Available && i.DeliveryAvailable && i.PricePerDay.HasValue && i.DeliveryFee.HasValue);
        var rentalDays = 3;
        var expectedBasePrice = item.PricePerDay.Value * rentalDays;
        var expectedDeliveryFee = item.DeliveryFee.Value;
        var expectedPlatformFee = (expectedBasePrice + expectedDeliveryFee) * 0.10m;
        var expectedTotalPrice = expectedBasePrice + expectedDeliveryFee + expectedPlatformFee;

        var command = new CreateRentalCommand
        {
            ItemId = item.Id,
            RenterId = Guid.NewGuid(),
            StartDate = DateTime.Now.AddDays(1),
            EndDate = DateTime.Now.AddDays(1 + rentalDays),
            PaymentMethod = "stripe",
            DeliveryRequested = true,
            DeliveryAddress = "123 Test Street, Test City"
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeTrue();
        result.Value.TotalPrice.Should().Be(expectedTotalPrice);
        result.Value.DeliveryFee.Should().Be(expectedDeliveryFee);
        result.Value.PlatformFee.Should().Be(expectedPlatformFee);
    }

    [TestCase("stripe")]
    [TestCase("paypal")]
    public async Task Handle_WithDifferentPaymentMethods_ShouldAcceptValidMethods(string paymentMethod)
    {
        // Arrange
        var item = _testItems.First(i => i.Available);
        var command = new CreateRentalCommand
        {
            ItemId = item.Id,
            RenterId = Guid.NewGuid(),
            StartDate = DateTime.Now.AddDays(1),
            EndDate = DateTime.Now.AddDays(7),
            PaymentMethod = paymentMethod
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
    }

    [Test]
    public async Task Handle_ShouldCallUnitOfWorkSaveChanges()
    {
        // Arrange
        var item = _testItems.First(i => i.Available);
        var command = new CreateRentalCommand
        {
            ItemId = item.Id,
            RenterId = Guid.NewGuid(),
            StartDate = DateTime.Now.AddDays(1),
            EndDate = DateTime.Now.AddDays(7),
            PaymentMethod = "stripe"
        };

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.AtLeastOnce);
    }

    [Test]
    public async Task Handle_WithRepositoryException_ShouldReturnFailureResult()
    {
        // Arrange
        _mockItemRepository.Setup(r => r.GetQueryable())
            .Throws(new Exception("Database connection failed"));

        var command = new CreateRentalCommand
        {
            ItemId = Guid.NewGuid(),
            RenterId = Guid.NewGuid(),
            StartDate = DateTime.Now.AddDays(1),
            EndDate = DateTime.Now.AddDays(7),
            PaymentMethod = "stripe"
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("Error creating rental");
        result.Error.Should().Contain("Database connection failed");
    }

    private List<Item> CreateTestItems()
    {
        var userId1 = Guid.NewGuid();
        var userId2 = Guid.NewGuid();
        
        return new List<Item>
        {
            new Item
            {
                Id = Guid.NewGuid(),
                Title = "Available Item with Delivery",
                Condition = "neu",
                PricePerDay = 50m,
                Deposit = 100m,
                Available = true,
                Location = "Berlin",
                DeliveryAvailable = true,
                DeliveryFee = 15m,
                UserId = userId1,
                CategoryId = Guid.NewGuid(),
                User = new User { Id = userId1, Name = "Owner 1", Email = "owner1@example.com" }
            },
            new Item
            {
                Id = Guid.NewGuid(),
                Title = "Available Item without Delivery",
                Condition = "gut",
                PricePerDay = 30m,
                Deposit = 75m,
                Available = true,
                Location = "Munich",
                DeliveryAvailable = false,
                UserId = userId2,
                CategoryId = Guid.NewGuid(),
                User = new User { Id = userId2, Name = "Owner 2", Email = "owner2@example.com" }
            },
            new Item
            {
                Id = Guid.NewGuid(),
                Title = "Unavailable Item",
                Condition = "sehr gut",
                PricePerDay = 40m,
                Deposit = 80m,
                Available = false,
                Location = "Hamburg",
                DeliveryAvailable = true,
                DeliveryFee = 20m,
                UserId = userId1,
                CategoryId = Guid.NewGuid(),
                User = new User { Id = userId1, Name = "Owner 1", Email = "owner1@example.com" }
            }
        };
    }

    private List<Rental> CreateTestRentals()
    {
        var itemId = _testItems?.FirstOrDefault()?.Id ?? Guid.NewGuid();
        
        return new List<Rental>
        {
            new Rental
            {
                Id = Guid.NewGuid(),
                ItemId = itemId,
                OwnerId = Guid.NewGuid(),
                RenterId = Guid.NewGuid(),
                StartDate = DateTime.Now.AddDays(5),
                EndDate = DateTime.Now.AddDays(10),
                Status = "confirmed",
                PaymentStatus = "paid"
            }
        };
    }

    private List<PlatformSettings> CreateTestSettings()
    {
        return new List<PlatformSettings>
        {
            new PlatformSettings
            {
                Id = Guid.NewGuid(),
                PlatformFeePercentage = 10,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            }
        };
    }
}