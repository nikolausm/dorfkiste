using Dorfkiste.Core.Entities;
using Dorfkiste.Core.Interfaces;

namespace Dorfkiste.Application.Services;

public class MessageService : IMessageService
{
    private readonly IMessageRepository _messageRepository;
    private readonly IOfferRepository _offerRepository;
    private readonly IUserRepository _userRepository;

    public MessageService(
        IMessageRepository messageRepository,
        IOfferRepository offerRepository,
        IUserRepository userRepository)
    {
        _messageRepository = messageRepository;
        _offerRepository = offerRepository;
        _userRepository = userRepository;
    }

    public async Task<Message> SendMessageAsync(int senderId, int recipientId, int? offerId, string content)
    {
        // Validate that the offer exists (if provided)
        if (offerId.HasValue)
        {
            var offer = await _offerRepository.GetByIdAsync(offerId.Value);
            if (offer == null)
            {
                throw new ArgumentException("Offer not found", nameof(offerId));
            }
        }

        // Validate that users exist
        var sender = await _userRepository.GetByIdAsync(senderId);
        var recipient = await _userRepository.GetByIdAsync(recipientId);

        if (sender == null || recipient == null)
        {
            throw new ArgumentException("Invalid user IDs");
        }

        // Prevent sending messages to yourself
        if (senderId == recipientId)
        {
            throw new ArgumentException("Cannot send message to yourself");
        }

        var message = new Message
        {
            SenderId = senderId,
            RecipientId = recipientId,
            OfferId = offerId,
            Content = content.Trim()
        };

        return await _messageRepository.CreateAsync(message);
    }

    public async Task<IEnumerable<Message>> GetConversationAsync(int senderId, int recipientId, int? offerId)
    {
        return await _messageRepository.GetConversationAsync(senderId, recipientId, offerId);
    }

    public async Task<IEnumerable<Message>> GetUserInboxAsync(int userId)
    {
        return await _messageRepository.GetUserInboxAsync(userId);
    }

    public async Task<IEnumerable<Message>> GetUserSentMessagesAsync(int userId)
    {
        return await _messageRepository.GetUserSentMessagesAsync(userId);
    }

    public async Task<Message> MarkAsReadAsync(int messageId, int userId)
    {
        var message = await _messageRepository.GetByIdAsync(messageId);
        
        if (message == null)
        {
            throw new ArgumentException("Message not found", nameof(messageId));
        }
        
        if (message.RecipientId != userId)
        {
            throw new UnauthorizedAccessException("You can only mark your own messages as read");
        }

        return await _messageRepository.MarkAsReadAsync(messageId);
    }

    public async Task<int> GetUnreadCountAsync(int userId)
    {
        return await _messageRepository.GetUnreadCountAsync(userId);
    }

    public async Task DeleteMessageAsync(int messageId, int userId)
    {
        var message = await _messageRepository.GetByIdAsync(messageId);
        
        if (message == null)
        {
            throw new ArgumentException("Message not found", nameof(messageId));
        }
        
        // Users can only delete messages they sent or received
        if (message.SenderId != userId && message.RecipientId != userId)
        {
            throw new UnauthorizedAccessException("You can only delete your own messages");
        }

        await _messageRepository.DeleteAsync(messageId);
    }

    public async Task DeleteConversationAsync(int userId, int recipientId, int? offerId)
    {
        // Validate that the user is part of this conversation
        var conversation = await _messageRepository.GetConversationAsync(userId, recipientId, offerId);

        if (!conversation.Any())
        {
            throw new ArgumentException("Conversation not found");
        }

        // Ensure the user is authorized to delete this conversation
        // User can only delete conversations they are part of (either as sender or recipient)
        var isAuthorized = conversation.Any(m => m.SenderId == userId || m.RecipientId == userId);

        if (!isAuthorized)
        {
            throw new UnauthorizedAccessException("You can only delete conversations you are part of");
        }

        await _messageRepository.DeleteConversationAsync(userId, recipientId, offerId);
    }
}