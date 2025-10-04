using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Dorfkiste.Core.Interfaces;

namespace Dorfkiste.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MessagesController : ControllerBase
{
    private readonly IMessageService _messageService;

    public MessagesController(IMessageService messageService)
    {
        _messageService = messageService;
    }

    [HttpPost]
    public async Task<ActionResult<MessageDto>> SendMessage([FromBody] SendMessageRequest request)
    {
        var senderId = GetCurrentUserId();

        try
        {
            var message = await _messageService.SendMessageAsync(
                senderId, 
                request.RecipientId, 
                request.OfferId, 
                request.Content);

            return Ok(MapToMessageDto(message));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
    }

    [HttpGet("conversation/{recipientId}/offer/{offerId}")]
    public async Task<ActionResult<IEnumerable<MessageDto>>> GetConversation(int recipientId, int offerId)
    {
        var userId = GetCurrentUserId();

        try
        {
            var messages = await _messageService.GetConversationAsync(userId, recipientId, offerId);
            var messageDtos = messages.Select(MapToMessageDto);
            return Ok(messageDtos);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("inbox")]
    public async Task<ActionResult<IEnumerable<MessageDto>>> GetInbox()
    {
        var userId = GetCurrentUserId();
        var messages = await _messageService.GetUserInboxAsync(userId);
        var messageDtos = messages.Select(MapToMessageDto);
        return Ok(messageDtos);
    }

    [HttpGet("sent")]
    public async Task<ActionResult<IEnumerable<MessageDto>>> GetSentMessages()
    {
        var userId = GetCurrentUserId();
        var messages = await _messageService.GetUserSentMessagesAsync(userId);
        var messageDtos = messages.Select(MapToMessageDto);
        return Ok(messageDtos);
    }

    [HttpPut("{id}/mark-read")]
    public async Task<ActionResult<MessageDto>> MarkAsRead(int id)
    {
        var userId = GetCurrentUserId();

        try
        {
            var message = await _messageService.MarkAsReadAsync(id, userId);
            return Ok(MapToMessageDto(message));
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
    }

    [HttpGet("unread-count")]
    public async Task<ActionResult<UnreadCountResponse>> GetUnreadCount()
    {
        var userId = GetCurrentUserId();
        var count = await _messageService.GetUnreadCountAsync(userId);
        return Ok(new UnreadCountResponse { Count = count });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMessage(int id)
    {
        var userId = GetCurrentUserId();

        try
        {
            await _messageService.DeleteMessageAsync(id, userId);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
    }

    [HttpDelete("conversation/{recipientId}/offer/{offerId}")]
    public async Task<IActionResult> DeleteConversation(int recipientId, int offerId)
    {
        var userId = GetCurrentUserId();

        try
        {
            await _messageService.DeleteConversationAsync(userId, recipientId, offerId);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim!);
    }

    private static MessageDto MapToMessageDto(Core.Entities.Message message)
    {
        return new MessageDto
        {
            Id = message.Id,
            Content = message.Content,
            SentAt = message.SentAt,
            IsRead = message.IsRead,
            SenderId = message.SenderId,
            RecipientId = message.RecipientId,
            OfferId = message.OfferId,
            Sender = message.Sender != null ? new MessageUserDto
            {
                Id = message.Sender.Id,
                Email = message.Sender.Email,
                FirstName = message.Sender.FirstName,
                LastName = message.Sender.LastName
            } : null,
            Recipient = message.Recipient != null ? new MessageUserDto
            {
                Id = message.Recipient.Id,
                Email = message.Recipient.Email,
                FirstName = message.Recipient.FirstName,
                LastName = message.Recipient.LastName
            } : null,
            Offer = message.Offer != null ? new MessageOfferDto
            {
                Id = message.Offer.Id,
                Title = message.Offer.Title,
                FirstPictureId = message.Offer.Pictures?.OrderBy(p => p.DisplayOrder).FirstOrDefault()?.Id,
                IsActive = message.Offer.IsActive,
                IsService = message.Offer.IsService
            } : null
        };
    }
}

public class SendMessageRequest
{
    public int RecipientId { get; set; }
    public int? OfferId { get; set; }
    public string Content { get; set; } = string.Empty;
}

public class MessageDto
{
    public int Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime SentAt { get; set; }
    public bool IsRead { get; set; }
    public int SenderId { get; set; }
    public int RecipientId { get; set; }
    public int? OfferId { get; set; }
    public MessageUserDto? Sender { get; set; }
    public MessageUserDto? Recipient { get; set; }
    public MessageOfferDto? Offer { get; set; }
}

public class MessageUserDto
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
}

public class MessageOfferDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public int? FirstPictureId { get; set; }
    public bool IsActive { get; set; }
    public bool IsService { get; set; }
}

public class UnreadCountResponse
{
    public int Count { get; set; }
}