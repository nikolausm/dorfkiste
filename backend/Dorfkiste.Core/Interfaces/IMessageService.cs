using Dorfkiste.Core.Entities;

namespace Dorfkiste.Core.Interfaces;

public interface IMessageService
{
    Task<Message> SendMessageAsync(int senderId, int recipientId, int offerId, string content);
    Task<IEnumerable<Message>> GetConversationAsync(int senderId, int recipientId, int offerId);
    Task<IEnumerable<Message>> GetUserInboxAsync(int userId);
    Task<IEnumerable<Message>> GetUserSentMessagesAsync(int userId);
    Task<Message> MarkAsReadAsync(int messageId, int userId);
    Task<int> GetUnreadCountAsync(int userId);
    Task DeleteMessageAsync(int messageId, int userId);
    Task DeleteConversationAsync(int userId, int recipientId, int offerId);
}