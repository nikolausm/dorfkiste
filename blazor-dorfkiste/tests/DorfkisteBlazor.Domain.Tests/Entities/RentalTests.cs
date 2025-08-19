using DorfkisteBlazor.Domain.Entities;
using DorfkisteBlazor.Domain.Tests.TestFixtures;
using FluentAssertions;
using NUnit.Framework;

namespace DorfkisteBlazor.Domain.Tests.Entities;

/// <summary>
/// Unit tests for Rental entity validation and business logic
/// </summary>
[TestFixture]
public class RentalTests
{
    private TestDataBuilder _testDataBuilder;

    [SetUp]
    public void SetUp()
    {
        _testDataBuilder = new TestDataBuilder();
    }

    [Test]
    public void Rental_WhenCreatedWithValidData_ShouldHaveCorrectProperties()
    {
        // Arrange
        var itemId = Guid.NewGuid();
        var ownerId = Guid.NewGuid();
        var renterId = Guid.NewGuid();
        var startDate = DateTime.Now.AddDays(1);
        var endDate = DateTime.Now.AddDays(7);

        var rental = _testDataBuilder.Rental()
            .WithItem(itemId)
            .WithOwner(ownerId)
            .WithRenter(renterId)
            .WithDates(startDate, endDate)
            .Build();

        // Act & Assert
        rental.ItemId.Should().Be(itemId);
        rental.OwnerId.Should().Be(ownerId);
        rental.RenterId.Should().Be(renterId);
        rental.StartDate.Should().Be(startDate);
        rental.EndDate.Should().Be(endDate);
    }

    [TestCase("pending")]
    [TestCase("confirmed")]
    [TestCase("active")]
    [TestCase("completed")]
    [TestCase("cancelled")]
    public void Rental_WithValidStatus_ShouldAcceptStatus(string status)
    {
        // Arrange & Act
        var rental = _testDataBuilder.Rental()
            .WithStatus(status)
            .Build();

        // Assert
        rental.Status.Should().Be(status);
    }

    [TestCase("pending")]
    [TestCase("paid")]
    [TestCase("refunded")]
    public void Rental_WithValidPaymentStatus_ShouldAcceptPaymentStatus(string paymentStatus)
    {
        // Arrange & Act
        var rental = new Rental
        {
            ItemId = Guid.NewGuid(),
            OwnerId = Guid.NewGuid(),
            RenterId = Guid.NewGuid(),
            StartDate = DateTime.Now.AddDays(1),
            EndDate = DateTime.Now.AddDays(7),
            PaymentStatus = paymentStatus
        };

        // Assert
        rental.PaymentStatus.Should().Be(paymentStatus);
    }

    [TestCase("stripe")]
    [TestCase("paypal")]
    public void Rental_WithValidPaymentMethod_ShouldAcceptPaymentMethod(string paymentMethod)
    {
        // Arrange & Act
        var rental = new Rental
        {
            ItemId = Guid.NewGuid(),
            OwnerId = Guid.NewGuid(),
            RenterId = Guid.NewGuid(),
            StartDate = DateTime.Now.AddDays(1),
            EndDate = DateTime.Now.AddDays(7),
            PaymentMethod = paymentMethod
        };

        // Assert
        rental.PaymentMethod.Should().Be(paymentMethod);
    }

    [Test]
    public void Rental_WithDelivery_ShouldHaveDeliveryDetails()
    {
        // Arrange
        var deliveryAddress = "123 Test Street, Test City";
        var deliveryFee = 15.50m;

        // Act
        var rental = new Rental
        {
            ItemId = Guid.NewGuid(),
            OwnerId = Guid.NewGuid(),
            RenterId = Guid.NewGuid(),
            StartDate = DateTime.Now.AddDays(1),
            EndDate = DateTime.Now.AddDays(7),
            DeliveryRequested = true,
            DeliveryAddress = deliveryAddress,
            DeliveryFee = deliveryFee
        };

        // Assert
        rental.DeliveryRequested.Should().BeTrue();
        rental.DeliveryAddress.Should().Be(deliveryAddress);
        rental.DeliveryFee.Should().Be(deliveryFee);
    }

    [Test]
    public void Rental_PriceCalculation_ShouldHaveCorrectAmounts()
    {
        // Arrange
        var totalPrice = 250.00m;
        var depositPaid = 100.00m;
        var platformFee = 25.00m;

        // Act
        var rental = new Rental
        {
            ItemId = Guid.NewGuid(),
            OwnerId = Guid.NewGuid(),
            RenterId = Guid.NewGuid(),
            StartDate = DateTime.Now.AddDays(1),
            EndDate = DateTime.Now.AddDays(7),
            TotalPrice = totalPrice,
            DepositPaid = depositPaid,
            PlatformFee = platformFee
        };

        // Assert
        rental.TotalPrice.Should().Be(totalPrice);
        rental.DepositPaid.Should().Be(depositPaid);
        rental.PlatformFee.Should().Be(platformFee);
    }

    [Test]
    public void Rental_WithPaymentProviderIds_ShouldAcceptProviderSpecificIds()
    {
        // Arrange
        var stripePaymentIntentId = "pi_test123";
        var paypalOrderId = "ORDER123";

        // Act
        var rental = new Rental
        {
            ItemId = Guid.NewGuid(),
            OwnerId = Guid.NewGuid(),
            RenterId = Guid.NewGuid(),
            StartDate = DateTime.Now.AddDays(1),
            EndDate = DateTime.Now.AddDays(7),
            StripePaymentIntentId = stripePaymentIntentId,
            PaypalOrderId = paypalOrderId
        };

        // Assert
        rental.StripePaymentIntentId.Should().Be(stripePaymentIntentId);
        rental.PaypalOrderId.Should().Be(paypalOrderId);
    }

    [Test]
    public void Rental_ShouldHaveValidNavigationProperties()
    {
        // Arrange & Act
        var rental = _testDataBuilder.Rental().Build();

        // Assert
        rental.Payments.Should().NotBeNull();
        rental.Reviews.Should().NotBeNull();
    }

    [Test]
    public void Rental_RequiredFields_ShouldBeSet()
    {
        // Arrange
        var itemId = Guid.NewGuid();
        var ownerId = Guid.NewGuid();
        var renterId = Guid.NewGuid();
        var startDate = DateTime.Now.AddDays(1);
        var endDate = DateTime.Now.AddDays(7);

        // Act
        var rental = new Rental
        {
            ItemId = itemId,
            OwnerId = ownerId,
            RenterId = renterId,
            StartDate = startDate,
            EndDate = endDate
        };

        // Assert
        rental.ItemId.Should().Be(itemId);
        rental.OwnerId.Should().Be(ownerId);
        rental.RenterId.Should().Be(renterId);
        rental.StartDate.Should().Be(startDate);
        rental.EndDate.Should().Be(endDate);
    }

    [Test]
    public void Rental_DateValidation_EndDateShouldBeAfterStartDate()
    {
        // Arrange
        var startDate = DateTime.Now.AddDays(1);
        var endDate = DateTime.Now.AddDays(7);

        // Act
        var rental = new Rental
        {
            ItemId = Guid.NewGuid(),
            OwnerId = Guid.NewGuid(),
            RenterId = Guid.NewGuid(),
            StartDate = startDate,
            EndDate = endDate
        };

        // Assert
        rental.EndDate.Should().BeAfter(rental.StartDate);
        (rental.EndDate - rental.StartDate).Days.Should().BeGreaterThan(0);
    }
}