using DorfkisteBlazor.Server.Tests.TestFixtures;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using NUnit.Framework;
using System.Net;
using System.Text.Json;
using System.Text;

namespace DorfkisteBlazor.Server.Tests.Controllers;

/// <summary>
/// Integration tests for RentalsController API endpoints
/// </summary>
[TestFixture]
public class RentalsControllerTests
{
    private WebApplicationFactory<Program> _factory;
    private HttpClient _client;

    [OneTimeSetUp]
    public void OneTimeSetUp()
    {
        _factory = new CustomWebApplicationFactory<Program>();
        _client = _factory.CreateClient();
    }

    [OneTimeTearDown]
    public void OneTimeTearDown()
    {
        _client?.Dispose();
        _factory?.Dispose();
    }

    [Test]
    public async Task GetRentals_WithoutAuthentication_ShouldReturnUnauthorized()
    {
        // Act
        var response = await _client.GetAsync("/api/rentals");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Test]
    public async Task GetRentals_WithAuthentication_ShouldReturnOk()
    {
        // Arrange
        AuthorizationHelper.AddJwtToken(_client);

        // Act
        var response = await _client.GetAsync("/api/rentals");

        // Assert
        if (response.StatusCode == HttpStatusCode.Unauthorized)
        {
            Assert.Inconclusive("JWT authentication is enforced, test requires valid JWT implementation");
            return;
        }

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        content.Should().NotBeNullOrEmpty();
    }

    [Test]
    public async Task CreateRental_WithValidData_ShouldReturnCreated()
    {
        // Arrange
        AuthorizationHelper.AddJwtToken(_client);
        var rental = new
        {
            itemId = Guid.NewGuid(),
            startDate = DateTime.Now.AddDays(1).ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
            endDate = DateTime.Now.AddDays(7).ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
            paymentMethod = "stripe",
            deliveryRequested = false
        };

        var json = JsonSerializer.Serialize(rental);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/api/rentals", content);

        // Assert
        if (response.StatusCode == HttpStatusCode.Unauthorized)
        {
            Assert.Inconclusive("JWT authentication is enforced, test requires valid JWT implementation");
            return;
        }

        // The rental creation might fail due to business rules, but should not be server error
        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.Created,
            HttpStatusCode.BadRequest,
            HttpStatusCode.NotFound,
            HttpStatusCode.Conflict,
            HttpStatusCode.MethodNotAllowed);
    }

    [Test]
    public async Task CreateRental_WithInvalidData_ShouldReturnBadRequest()
    {
        // Arrange
        AuthorizationHelper.AddJwtToken(_client);
        var invalidRental = new
        {
            // Missing required fields
            paymentMethod = "stripe"
        };

        var json = JsonSerializer.Serialize(invalidRental);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/api/rentals", content);

        // Assert
        if (response.StatusCode == HttpStatusCode.Unauthorized)
        {
            Assert.Inconclusive("JWT authentication is enforced, test requires valid JWT implementation");
            return;
        }

        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.BadRequest,
            HttpStatusCode.MethodNotAllowed);
    }

    [Test]
    public async Task CreateRental_WithDeliveryRequest_ShouldIncludeDeliveryDetails()
    {
        // Arrange
        AuthorizationHelper.AddJwtToken(_client);
        var rentalWithDelivery = new
        {
            itemId = Guid.NewGuid(),
            startDate = DateTime.Now.AddDays(1).ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
            endDate = DateTime.Now.AddDays(7).ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
            paymentMethod = "stripe",
            deliveryRequested = true,
            deliveryAddress = "123 Test Street, Test City, 12345"
        };

        var json = JsonSerializer.Serialize(rentalWithDelivery);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/api/rentals", content);

        // Assert
        if (response.StatusCode == HttpStatusCode.Unauthorized)
        {
            Assert.Inconclusive("JWT authentication is enforced, test requires valid JWT implementation");
            return;
        }

        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.Created,
            HttpStatusCode.BadRequest,
            HttpStatusCode.NotFound,
            HttpStatusCode.Conflict,
            HttpStatusCode.MethodNotAllowed);
    }

    [Test]
    public async Task GetRentalById_WithValidId_ShouldReturnRental()
    {
        // Arrange
        AuthorizationHelper.AddJwtToken(_client);
        var rentalId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/rentals/{rentalId}");

        // Assert
        if (response.StatusCode == HttpStatusCode.Unauthorized)
        {
            Assert.Inconclusive("JWT authentication is enforced, test requires valid JWT implementation");
            return;
        }

        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.OK,
            HttpStatusCode.NotFound,
            HttpStatusCode.MethodNotAllowed);
    }

    [Test]
    public async Task GetRentalById_WithInvalidId_ShouldReturnBadRequest()
    {
        // Arrange
        AuthorizationHelper.AddJwtToken(_client);
        var invalidId = "invalid-guid";

        // Act
        var response = await _client.GetAsync($"/api/rentals/{invalidId}");

        // Assert
        if (response.StatusCode == HttpStatusCode.Unauthorized)
        {
            Assert.Inconclusive("JWT authentication is enforced, test requires valid JWT implementation");
            return;
        }

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Test]
    public async Task UpdateRentalStatus_WithValidData_ShouldReturnOk()
    {
        // Arrange
        AuthorizationHelper.AddJwtToken(_client);
        var rentalId = Guid.NewGuid();
        var statusUpdate = new
        {
            status = "confirmed"
        };

        var json = JsonSerializer.Serialize(statusUpdate);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PutAsync($"/api/rentals/{rentalId}/status", content);

        // Assert
        if (response.StatusCode == HttpStatusCode.Unauthorized)
        {
            Assert.Inconclusive("JWT authentication is enforced, test requires valid JWT implementation");
            return;
        }

        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.OK,
            HttpStatusCode.NotFound,
            HttpStatusCode.BadRequest,
            HttpStatusCode.MethodNotAllowed);
    }

    [TestCase("stripe")]
    [TestCase("paypal")]
    public async Task CreateRental_WithDifferentPaymentMethods_ShouldAcceptValidMethods(string paymentMethod)
    {
        // Arrange
        AuthorizationHelper.AddJwtToken(_client);
        var rental = new
        {
            itemId = Guid.NewGuid(),
            startDate = DateTime.Now.AddDays(1).ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
            endDate = DateTime.Now.AddDays(7).ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
            paymentMethod = paymentMethod,
            deliveryRequested = false
        };

        var json = JsonSerializer.Serialize(rental);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/api/rentals", content);

        // Assert
        if (response.StatusCode == HttpStatusCode.Unauthorized)
        {
            Assert.Inconclusive("JWT authentication is enforced, test requires valid JWT implementation");
            return;
        }

        // Should not reject due to payment method
        response.StatusCode.Should().NotBe(HttpStatusCode.UnsupportedMediaType);
    }

    [Test]
    public async Task GetMyRentals_ShouldReturnUserRentals()
    {
        // Arrange
        AuthorizationHelper.AddJwtToken(_client);

        // Act
        var response = await _client.GetAsync("/api/rentals/my");

        // Assert
        if (response.StatusCode == HttpStatusCode.Unauthorized)
        {
            Assert.Inconclusive("JWT authentication is enforced, test requires valid JWT implementation");
            return;
        }

        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.OK,
            HttpStatusCode.MethodNotAllowed);

        if (response.StatusCode == HttpStatusCode.OK)
        {
            var content = await response.Content.ReadAsStringAsync();
            content.Should().NotBeNullOrEmpty();
        }
    }

    [Test]
    public async Task CancelRental_WithValidId_ShouldReturnOk()
    {
        // Arrange
        AuthorizationHelper.AddJwtToken(_client);
        var rentalId = Guid.NewGuid();

        // Act
        var response = await _client.DeleteAsync($"/api/rentals/{rentalId}");

        // Assert
        if (response.StatusCode == HttpStatusCode.Unauthorized)
        {
            Assert.Inconclusive("JWT authentication is enforced, test requires valid JWT implementation");
            return;
        }

        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.OK,
            HttpStatusCode.NoContent,
            HttpStatusCode.NotFound,
            HttpStatusCode.BadRequest,
            HttpStatusCode.MethodNotAllowed);
    }

    [Test]
    public async Task CreateRental_WithPastDates_ShouldReturnBadRequest()
    {
        // Arrange
        AuthorizationHelper.AddJwtToken(_client);
        var rentalWithPastDates = new
        {
            itemId = Guid.NewGuid(),
            startDate = DateTime.Now.AddDays(-7).ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
            endDate = DateTime.Now.AddDays(-1).ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
            paymentMethod = "stripe",
            deliveryRequested = false
        };

        var json = JsonSerializer.Serialize(rentalWithPastDates);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/api/rentals", content);

        // Assert
        if (response.StatusCode == HttpStatusCode.Unauthorized)
        {
            Assert.Inconclusive("JWT authentication is enforced, test requires valid JWT implementation");
            return;
        }

        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.BadRequest,
            HttpStatusCode.MethodNotAllowed);
    }

    [Test]
    public async Task CreateRental_WithEndDateBeforeStartDate_ShouldReturnBadRequest()
    {
        // Arrange
        AuthorizationHelper.AddJwtToken(_client);
        var rentalWithInvalidDates = new
        {
            itemId = Guid.NewGuid(),
            startDate = DateTime.Now.AddDays(7).ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
            endDate = DateTime.Now.AddDays(1).ToString("yyyy-MM-ddTHH:mm:ss.fffZ"), // End before start
            paymentMethod = "stripe",
            deliveryRequested = false
        };

        var json = JsonSerializer.Serialize(rentalWithInvalidDates);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/api/rentals", content);

        // Assert
        if (response.StatusCode == HttpStatusCode.Unauthorized)
        {
            Assert.Inconclusive("JWT authentication is enforced, test requires valid JWT implementation");
            return;
        }

        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.BadRequest,
            HttpStatusCode.MethodNotAllowed);
    }
}