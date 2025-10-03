using Dorfkiste.Core.Entities;

namespace Dorfkiste.Core.Interfaces;

public interface IMessageRepository
{
    Task<Message> CreateAsync(Message message);
    Task<Message?> GetByIdAsync(int id);
    Task<IEnumerable<Message>> GetByOfferIdAsync(int offerId);
    Task<IEnumerable<Message>> GetConversationAsync(int senderId, int recipientId, int offerId);
    Task<IEnumerable<Message>> GetUserInboxAsync(int userId);
    Task<IEnumerable<Message>> GetUserSentMessagesAsync(int userId);
    Task<Message> MarkAsReadAsync(int id);
    Task<int> GetUnreadCountAsync(int userId);
    Task DeleteAsync(int id);
    Task DeleteConversationAsync(int userId, int recipientId, int offerId);
    Task<IEnumerable<Message>> GetSentMessagesAsync(int userId);
    Task<IEnumerable<Message>> GetReceivedMessagesAsync(int userId);
}