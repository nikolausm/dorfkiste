using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace DorfkisteBlazor.Server.Hubs;

/// <summary>
/// SignalR Hub for real-time notifications
/// </summary>
[Authorize]
public class NotificationHub : Hub
{
    private readonly ILogger<NotificationHub> _logger;

    public NotificationHub(ILogger<NotificationHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId != null)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
            _logger.LogInformation("User {UserId} connected to NotificationHub", userId);
        }
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId != null)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{userId}");
            _logger.LogInformation("User {UserId} disconnected from NotificationHub", userId);
        }
        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Send notification to a specific user
    /// </summary>
    public async Task SendNotificationToUser(string userId, NotificationDto notification)
    {
        try
        {
            var currentUserId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (currentUserId == null) return;

            // TODO: Validate if current user has permission to send notification
            // For now, only allow system notifications or self-notifications

            await Clients.Group($"user_{userId}").SendAsync("NotificationReceived", notification);
            
            _logger.LogInformation("Notification sent to user {UserId} from {SenderId}", 
                userId, currentUserId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification to user {UserId}", userId);
        }
    }

    /// <summary>
    /// Mark notification as read
    /// </summary>
    public async Task MarkNotificationAsRead(string notificationId)
    {
        try
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return;

            // TODO: Update notification status in database
            // await _notificationService.MarkAsReadAsync(Guid.Parse(notificationId), Guid.Parse(userId));

            await Clients.Caller.SendAsync("NotificationMarkedAsRead", notificationId);
            
            _logger.LogInformation("User {UserId} marked notification {NotificationId} as read", 
                userId, notificationId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking notification as read {NotificationId}", notificationId);
        }
    }

    /// <summary>
    /// Get unread notification count for current user
    /// </summary>
    public async Task GetUnreadCount()
    {
        try
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return;

            // TODO: Get actual count from database
            // var count = await _notificationService.GetUnreadCountAsync(Guid.Parse(userId));
            var count = 0; // Placeholder

            await Clients.Caller.SendAsync("UnreadCountUpdated", count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting unread notification count");
        }
    }
}

public class NotificationDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Type { get; set; } = ""; // rental_confirmed, payment_received, message_received, etc.
    public string Title { get; set; } = "";
    public string Message { get; set; } = "";
    public string? ActionUrl { get; set; }
    public Dictionary<string, object>? Data { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool Read { get; set; }
}

/// <summary>
/// Service interface for sending notifications via SignalR
/// </summary>
public interface INotificationService
{
    Task SendRentalConfirmedNotificationAsync(Guid userId, Guid rentalId, string itemTitle);
    Task SendPaymentReceivedNotificationAsync(Guid userId, decimal amount, string itemTitle);
    Task SendMessageReceivedNotificationAsync(Guid userId, Guid rentalId, string senderName, string message);
    Task SendRentalStatusUpdatedNotificationAsync(Guid userId, Guid rentalId, string status, string itemTitle);
    Task SendReviewReceivedNotificationAsync(Guid userId, int rating, string comment, string reviewerName);
}

/// <summary>
/// Implementation of notification service using SignalR
/// </summary>
public class SignalRNotificationService : INotificationService
{
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly ILogger<SignalRNotificationService> _logger;

    public SignalRNotificationService(
        IHubContext<NotificationHub> hubContext,
        ILogger<SignalRNotificationService> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task SendRentalConfirmedNotificationAsync(Guid userId, Guid rentalId, string itemTitle)
    {
        var notification = new NotificationDto
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = "rental_confirmed",
            Title = "Rental Confirmed",
            Message = $"Your rental for '{itemTitle}' has been confirmed!",
            ActionUrl = $"/rentals/{rentalId}",
            CreatedAt = DateTime.UtcNow,
            Read = false
        };

        await _hubContext.Clients.Group($"user_{userId}")
            .SendAsync("NotificationReceived", notification);
        
        _logger.LogInformation("Sent rental confirmed notification to user {UserId}", userId);
    }

    public async Task SendPaymentReceivedNotificationAsync(Guid userId, decimal amount, string itemTitle)
    {
        var notification = new NotificationDto
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = "payment_received",
            Title = "Payment Received",
            Message = $"You received €{amount:F2} for '{itemTitle}'",
            CreatedAt = DateTime.UtcNow,
            Read = false
        };

        await _hubContext.Clients.Group($"user_{userId}")
            .SendAsync("NotificationReceived", notification);
        
        _logger.LogInformation("Sent payment received notification to user {UserId}", userId);
    }

    public async Task SendMessageReceivedNotificationAsync(Guid userId, Guid rentalId, string senderName, string message)
    {
        var notification = new NotificationDto
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = "message_received",
            Title = "New Message",
            Message = $"{senderName}: {(message.Length > 50 ? message.Substring(0, 50) + "..." : message)}",
            ActionUrl = $"/rentals/{rentalId}",
            CreatedAt = DateTime.UtcNow,
            Read = false
        };

        await _hubContext.Clients.Group($"user_{userId}")
            .SendAsync("NotificationReceived", notification);
        
        _logger.LogInformation("Sent message notification to user {UserId}", userId);
    }

    public async Task SendRentalStatusUpdatedNotificationAsync(Guid userId, Guid rentalId, string status, string itemTitle)
    {
        var notification = new NotificationDto
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = "rental_status_updated",
            Title = "Rental Status Updated",
            Message = $"Your rental for '{itemTitle}' is now {status}",
            ActionUrl = $"/rentals/{rentalId}",
            CreatedAt = DateTime.UtcNow,
            Read = false
        };

        await _hubContext.Clients.Group($"user_{userId}")
            .SendAsync("NotificationReceived", notification);
        
        _logger.LogInformation("Sent rental status notification to user {UserId}", userId);
    }

    public async Task SendReviewReceivedNotificationAsync(Guid userId, int rating, string comment, string reviewerName)
    {
        var notification = new NotificationDto
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = "review_received",
            Title = "New Review",
            Message = $"{reviewerName} left you a {rating}-star review",
            CreatedAt = DateTime.UtcNow,
            Read = false
        };

        await _hubContext.Clients.Group($"user_{userId}")
            .SendAsync("NotificationReceived", notification);
        
        _logger.LogInformation("Sent review notification to user {UserId}", userId);
    }
}