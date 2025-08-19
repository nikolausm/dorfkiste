using DorfkisteBlazor.Domain.Entities;
using DorfkisteBlazor.Domain.Tests.TestFixtures;
using FluentAssertions;
using NUnit.Framework;

namespace DorfkisteBlazor.Domain.Tests.Entities;

/// <summary>
/// Unit tests for User entity validation and business logic
/// </summary>
[TestFixture]
public class UserTests
{
    private TestDataBuilder _testDataBuilder;

    [SetUp]
    public void SetUp()
    {
        _testDataBuilder = new TestDataBuilder();
    }

    [Test]
    public void User_WhenCreatedWithValidData_ShouldHaveCorrectProperties()
    {
        // Arrange
        var email = "test@example.com";
        var name = "Test User";
        
        var user = _testDataBuilder.User()
            .WithEmail(email)
            .WithName(name)
            .Build();

        // Act & Assert
        user.Email.Should().Be(email);
        user.Name.Should().Be(name);
        user.Verified.Should().BeFalse();
        user.IsAdmin.Should().BeFalse();
    }

    [Test]
    public void User_WhenCreated_ShouldNotBeVerifiedByDefault()
    {
        // Arrange & Act
        var user = _testDataBuilder.User().Build();

        // Assert
        user.Verified.Should().BeFalse();
    }

    [Test]
    public void User_WhenCreated_ShouldNotBeAdminByDefault()
    {
        // Arrange & Act
        var user = _testDataBuilder.User().Build();

        // Assert
        user.IsAdmin.Should().BeFalse();
    }

    [Test]
    public void User_WhenSetAsAdmin_ShouldBeAdmin()
    {
        // Arrange & Act
        var user = _testDataBuilder.User()
            .AsAdmin()
            .Build();

        // Assert
        user.IsAdmin.Should().BeTrue();
    }

    [Test]
    public void User_WhenSetAsVerified_ShouldBeVerified()
    {
        // Arrange & Act
        var user = _testDataBuilder.User()
            .AsVerified()
            .Build();

        // Assert
        user.Verified.Should().BeTrue();
    }

    [Test]
    public void User_ShouldHaveValidNavigationProperties()
    {
        // Arrange & Act
        var user = _testDataBuilder.User().Build();

        // Assert
        user.Items.Should().NotBeNull();
        user.RentalsAsOwner.Should().NotBeNull();
        user.RentalsAsRenter.Should().NotBeNull();
        user.ReviewsGiven.Should().NotBeNull();
        user.ReviewsReceived.Should().NotBeNull();
        user.Messages.Should().NotBeNull();
        user.Payments.Should().NotBeNull();
        user.Payouts.Should().NotBeNull();
        user.WatchlistItems.Should().NotBeNull();
        user.PasswordResetTokens.Should().NotBeNull();
    }

    [TestCase("test@example.com")]
    [TestCase("user.name+tag@domain.co.uk")]
    [TestCase("test.email@subdomain.example.com")]
    public void User_WithValidEmail_ShouldAcceptEmail(string validEmail)
    {
        // Arrange & Act
        var user = _testDataBuilder.User()
            .WithEmail(validEmail)
            .Build();

        // Assert
        user.Email.Should().Be(validEmail);
    }

    [Test]
    public void User_RequiredFields_ShouldBeSet()
    {
        // Arrange
        var email = "required@example.com";

        // Act
        var user = new User
        {
            Email = email
        };

        // Assert
        user.Email.Should().Be(email);
    }

    [Test]
    public void User_WithPaymentProviders_ShouldAcceptProviderIds()
    {
        // Arrange
        var stripeCustomerId = "cus_test123";
        var paypalEmail = "paypal@example.com";

        // Act
        var user = new User
        {
            Email = "test@example.com",
            StripeCustomerId = stripeCustomerId,
            PaypalEmail = paypalEmail
        };

        // Assert
        user.StripeCustomerId.Should().Be(stripeCustomerId);
        user.PaypalEmail.Should().Be(paypalEmail);
    }

    [Test]
    public void User_WithProfileData_ShouldAcceptOptionalFields()
    {
        // Arrange
        var bio = "This is a test bio";
        var avatarUrl = "https://example.com/avatar.jpg";
        var name = "Test User";

        // Act
        var user = new User
        {
            Email = "test@example.com",
            Name = name,
            Bio = bio,
            AvatarUrl = avatarUrl
        };

        // Assert
        user.Name.Should().Be(name);
        user.Bio.Should().Be(bio);
        user.AvatarUrl.Should().Be(avatarUrl);
    }
}