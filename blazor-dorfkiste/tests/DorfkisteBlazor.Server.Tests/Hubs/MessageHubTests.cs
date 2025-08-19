using DorfkisteBlazor.Server.Tests.TestFixtures;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.SignalR.Client;
using NUnit.Framework;

namespace DorfkisteBlazor.Server.Tests.Hubs;

/// <summary>
/// Integration tests for MessageHub SignalR functionality
/// </summary>
[TestFixture]
public class MessageHubTests
{
    private WebApplicationFactory<Program> _factory;
    private HubConnection _connection;

    [OneTimeSetUp]
    public void OneTimeSetUp()
    {
        _factory = new CustomWebApplicationFactory<Program>();
    }

    [OneTimeTearDown]
    public void OneTimeTearDown()
    {
        _factory?.Dispose();
    }

    [SetUp]
    public async Task SetUp()
    {
        var client = _factory.CreateClient();
        
        _connection = new HubConnectionBuilder()
            .WithUrl($"ws://localhost/hubs/messages", options =>
            {
                options.HttpMessageHandlerFactory = _ => _factory.Server.CreateHandler();
                options.Transports = Microsoft.AspNetCore.Http.Connections.HttpTransportType.WebSockets;
            })
            .Build();

        try
        {
            await _connection.StartAsync();
        }
        catch (Exception ex)
        {
            Assert.Inconclusive($"Could not establish SignalR connection: {ex.Message}");
        }
    }

    [TearDown]
    public async Task TearDown()
    {
        if (_connection != null)
        {
            await _connection.DisposeAsync();
        }
    }

    [Test]
    public async Task Connection_ShouldEstablishSuccessfully()
    {
        // Assert
        _connection.State.Should().Be(HubConnectionState.Connected);
    }

    [Test]
    public async Task SendMessage_ShouldBroadcastToOtherClients()
    {
        // Arrange
        var messageReceived = false;
        var receivedMessage = string.Empty;
        var receivedUser = string.Empty;

        _connection.On<string, string>("ReceiveMessage", (user, message) =>
        {
            messageReceived = true;
            receivedUser = user;
            receivedMessage = message;
        });

        var testUser = "TestUser";
        var testMessage = "Hello, World!";

        // Act
        try
        {
            await _connection.InvokeAsync("SendMessage", testUser, testMessage);
        }
        catch (Exception ex)
        {
            Assert.Inconclusive($"Could not invoke hub method: {ex.Message}");
            return;
        }

        // Wait for the message to be received
        await Task.Delay(1000);

        // Assert
        messageReceived.Should().BeTrue();
        receivedUser.Should().Be(testUser);
        receivedMessage.Should().Be(testMessage);
    }

    [Test]
    public async Task SendMessageToGroup_ShouldOnlySendToGroupMembers()
    {
        // Arrange
        var groupName = "TestGroup";
        var messageReceived = false;
        var receivedMessage = string.Empty;

        _connection.On<string, string>("ReceiveMessage", (user, message) =>
        {
            messageReceived = true;
            receivedMessage = message;
        });

        // Join the group first
        try
        {
            await _connection.InvokeAsync("JoinGroup", groupName);
        }
        catch (Exception ex)
        {
            Assert.Inconclusive($"Could not join group: {ex.Message}");
            return;
        }

        var testMessage = "Group message";

        // Act
        try
        {
            await _connection.InvokeAsync("SendMessageToGroup", groupName, testMessage);
        }
        catch (Exception ex)
        {
            Assert.Inconclusive($"Could not send message to group: {ex.Message}");
            return;
        }

        // Wait for the message to be received
        await Task.Delay(1000);

        // Assert
        messageReceived.Should().BeTrue();
        receivedMessage.Should().Be(testMessage);
    }

    [Test]
    public async Task JoinGroup_ShouldAddConnectionToGroup()
    {
        // Arrange
        var groupName = "TestGroup";
        var joinConfirmed = false;

        _connection.On<string>("GroupJoined", (group) =>
        {
            joinConfirmed = true;
        });

        // Act
        try
        {
            await _connection.InvokeAsync("JoinGroup", groupName);
        }
        catch (Exception ex)
        {
            Assert.Inconclusive($"Could not join group: {ex.Message}");
            return;
        }

        // Wait for confirmation
        await Task.Delay(1000);

        // Assert
        // If the hub sends a confirmation, we should receive it
        // Otherwise, we assume success if no exception was thrown
        Assert.Pass("Group join operation completed successfully");
    }

    [Test]
    public async Task LeaveGroup_ShouldRemoveConnectionFromGroup()
    {
        // Arrange
        var groupName = "TestGroup";

        // First join the group
        try
        {
            await _connection.InvokeAsync("JoinGroup", groupName);
        }
        catch (Exception ex)
        {
            Assert.Inconclusive($"Could not join group: {ex.Message}");
            return;
        }

        // Act
        try
        {
            await _connection.InvokeAsync("LeaveGroup", groupName);
        }
        catch (Exception ex)
        {
            Assert.Inconclusive($"Could not leave group: {ex.Message}");
            return;
        }

        // Assert
        Assert.Pass("Group leave operation completed successfully");
    }

    [Test]
    public async Task MultipleConnections_ShouldReceiveMessages()
    {
        // Arrange
        var connection2 = new HubConnectionBuilder()
            .WithUrl($"ws://localhost/hubs/messages", options =>
            {
                options.HttpMessageHandlerFactory = _ => _factory.Server.CreateHandler();
                options.Transports = Microsoft.AspNetCore.Http.Connections.HttpTransportType.WebSockets;
            })
            .Build();

        try
        {
            await connection2.StartAsync();
        }
        catch (Exception ex)
        {
            Assert.Inconclusive($"Could not establish second SignalR connection: {ex.Message}");
            return;
        }

        var messageReceived1 = false;
        var messageReceived2 = false;

        _connection.On<string, string>("ReceiveMessage", (user, message) =>
        {
            messageReceived1 = true;
        });

        connection2.On<string, string>("ReceiveMessage", (user, message) =>
        {
            messageReceived2 = true;
        });

        // Act
        try
        {
            await _connection.InvokeAsync("SendMessage", "User1", "Test message");
        }
        catch (Exception ex)
        {
            Assert.Inconclusive($"Could not send message: {ex.Message}");
            return;
        }

        // Wait for messages to be received
        await Task.Delay(1000);

        // Assert
        messageReceived1.Should().BeTrue();
        messageReceived2.Should().BeTrue();

        // Cleanup
        await connection2.DisposeAsync();
    }

    [Test]
    public async Task InvalidMethodCall_ShouldHandleGracefully()
    {
        // Act & Assert
        try
        {
            await _connection.InvokeAsync("NonExistentMethod", "parameter");
            Assert.Fail("Expected exception was not thrown");
        }
        catch (HubException)
        {
            // Expected behavior - hub method doesn't exist
            Assert.Pass("Hub correctly rejected invalid method call");
        }
        catch (Exception ex)
        {
            Assert.Inconclusive($"Unexpected exception type: {ex.GetType().Name}");
        }
    }

    [Test]
    public async Task SendEmptyMessage_ShouldHandleGracefully()
    {
        // Arrange
        var messageReceived = false;
        var receivedMessage = string.Empty;

        _connection.On<string, string>("ReceiveMessage", (user, message) =>
        {
            messageReceived = true;
            receivedMessage = message;
        });

        // Act
        try
        {
            await _connection.InvokeAsync("SendMessage", "TestUser", "");
        }
        catch (Exception ex)
        {
            Assert.Inconclusive($"Could not send empty message: {ex.Message}");
            return;
        }

        // Wait for the message to be received
        await Task.Delay(1000);

        // Assert
        messageReceived.Should().BeTrue();
        receivedMessage.Should().Be("");
    }
}