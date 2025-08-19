using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace DorfkisteBlazor.Server.Hubs;

/// <summary>
/// SignalR Hub for real-time messaging between users
/// </summary>
[Authorize]
public class MessageHub : Hub
{
    private readonly ILogger<MessageHub> _logger;

    public MessageHub(ILogger<MessageHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId != null)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
            _logger.LogInformation("User {UserId} connected to MessageHub", userId);
        }
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId != null)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{userId}");
            _logger.LogInformation("User {UserId} disconnected from MessageHub", userId);
        }
        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Join a rental conversation
    /// </summary>
    public async Task JoinRentalConversation(string rentalId)
    {
        try
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                await Clients.Caller.SendAsync("Error", "User not authenticated");
                return;
            }

            // TODO: Verify user is part of this rental (owner or renter)
            // var hasAccess = await _rentalService.UserHasAccessToRental(Guid.Parse(rentalId), Guid.Parse(userId));
            // if (!hasAccess)
            // {
            //     await Clients.Caller.SendAsync("Error", "Access denied to this conversation");
            //     return;
            // }

            await Groups.AddToGroupAsync(Context.ConnectionId, $"rental_{rentalId}");
            await Clients.Caller.SendAsync("JoinedConversation", rentalId);
            
            _logger.LogInformation("User {UserId} joined rental conversation {RentalId}", userId, rentalId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error joining rental conversation {RentalId}", rentalId);
            await Clients.Caller.SendAsync("Error", "Failed to join conversation");
        }
    }

    /// <summary>
    /// Leave a rental conversation
    /// </summary>
    public async Task LeaveRentalConversation(string rentalId)
    {
        try
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return;

            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"rental_{rentalId}");
            await Clients.Caller.SendAsync("LeftConversation", rentalId);
            
            _logger.LogInformation("User {UserId} left rental conversation {RentalId}", userId, rentalId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error leaving rental conversation {RentalId}", rentalId);
        }
    }

    /// <summary>
    /// Send a message in a rental conversation
    /// </summary>
    public async Task SendMessage(string rentalId, string content)
    {
        try
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userName = Context.User?.FindFirst(ClaimTypes.Name)?.Value;
            
            if (userId == null)
            {
                await Clients.Caller.SendAsync("Error", "User not authenticated");
                return;
            }

            if (string.IsNullOrWhiteSpace(content))
            {
                await Clients.Caller.SendAsync("Error", "Message content cannot be empty");
                return;
            }

            // TODO: Save message to database
            // var message = await _messageService.CreateMessageAsync(new CreateMessageDto
            // {
            //     RentalId = Guid.Parse(rentalId),
            //     SenderId = Guid.Parse(userId),
            //     Content = content.Trim()
            // });

            var messageDto = new MessageDto
            {
                Id = Guid.NewGuid(),
                RentalId = Guid.Parse(rentalId),
                SenderId = Guid.Parse(userId),
                SenderName = userName ?? "Unknown User",
                Content = content.Trim(),
                CreatedAt = DateTime.UtcNow,
                Read = false
            };

            // Send to all users in the rental conversation
            await Clients.Group($"rental_{rentalId}").SendAsync("MessageReceived", messageDto);
            
            _logger.LogInformation("Message sent by user {UserId} in rental {RentalId}", userId, rentalId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending message in rental {RentalId}", rentalId);
            await Clients.Caller.SendAsync("Error", "Failed to send message");
        }
    }

    /// <summary>
    /// Mark messages as read
    /// </summary>
    public async Task MarkMessagesAsRead(string rentalId, List<string> messageIds)
    {
        try
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return;

            // TODO: Update message read status in database
            // await _messageService.MarkMessagesAsReadAsync(
            //     messageIds.Select(Guid.Parse).ToList(), 
            //     Guid.Parse(userId));

            // Notify other users in the conversation
            await Clients.OthersInGroup($"rental_{rentalId}")
                .SendAsync("MessagesMarkedAsRead", messageIds, userId);
            
            _logger.LogInformation("User {UserId} marked {Count} messages as read in rental {RentalId}", 
                userId, messageIds.Count, rentalId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking messages as read in rental {RentalId}", rentalId);
        }
    }

    /// <summary>
    /// Send typing indicator
    /// </summary>
    public async Task SendTypingIndicator(string rentalId, bool isTyping)
    {
        try
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userName = Context.User?.FindFirst(ClaimTypes.Name)?.Value;
            
            if (userId == null) return;

            await Clients.OthersInGroup($"rental_{rentalId}")
                .SendAsync("TypingIndicator", userId, userName, isTyping);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending typing indicator in rental {RentalId}", rentalId);
        }
    }
}

public class MessageDto
{
    public Guid Id { get; set; }
    public Guid RentalId { get; set; }
    public Guid SenderId { get; set; }
    public string SenderName { get; set; } = "";
    public string Content { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public bool Read { get; set; }
}