using Microsoft.EntityFrameworkCore;
using Dorfkiste.Core.Entities;
using Dorfkiste.Core.Interfaces;
using Dorfkiste.Infrastructure.Data;

namespace Dorfkiste.Infrastructure.Repositories;

public class MessageRepository : IMessageRepository
{
    private readonly DorfkisteDbContext _context;

    public MessageRepository(DorfkisteDbContext context)
    {
        _context = context;
    }

    public async Task<Message> CreateAsync(Message message)
    {
        message.SentAt = DateTime.UtcNow;
        _context.Messages.Add(message);
        await _context.SaveChangesAsync();
        
        // Return the message with related entities loaded
        return await _context.Messages
            .Include(m => m.Sender)
            .Include(m => m.Recipient)
            .Include(m => m.Offer)
            .FirstAsync(m => m.Id == message.Id);
    }

    public async Task<Message?> GetByIdAsync(int id)
    {
        return await _context.Messages
            .Include(m => m.Sender)
            .Include(m => m.Recipient)
            .Include(m => m.Offer)
            .FirstOrDefaultAsync(m => m.Id == id);
    }

    public async Task<IEnumerable<Message>> GetByOfferIdAsync(int offerId)
    {
        return await _context.Messages
            .Include(m => m.Sender)
            .Include(m => m.Recipient)
            .Where(m => m.OfferId == offerId)
            .OrderByDescending(m => m.SentAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Message>> GetConversationAsync(int senderId, int recipientId, int offerId)
    {
        return await _context.Messages
            .Include(m => m.Sender)
            .Include(m => m.Recipient)
            .Include(m => m.Offer)
                .ThenInclude(o => o.Pictures)
            .Where(m => m.OfferId == offerId &&
                       ((m.SenderId == senderId && m.RecipientId == recipientId) ||
                        (m.SenderId == recipientId && m.RecipientId == senderId)))
            .OrderBy(m => m.SentAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Message>> GetUserInboxAsync(int userId)
    {
        return await _context.Messages
            .Include(m => m.Sender)
            .Include(m => m.Offer)
                .ThenInclude(o => o.Pictures)
            .Where(m => m.RecipientId == userId)
            .OrderByDescending(m => m.SentAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Message>> GetUserSentMessagesAsync(int userId)
    {
        return await _context.Messages
            .Include(m => m.Recipient)
            .Include(m => m.Offer)
                .ThenInclude(o => o.Pictures)
            .Where(m => m.SenderId == userId)
            .OrderByDescending(m => m.SentAt)
            .ToListAsync();
    }

    public async Task<Message> MarkAsReadAsync(int id)
    {
        var message = await _context.Messages.FindAsync(id);
        if (message != null)
        {
            message.IsRead = true;
            await _context.SaveChangesAsync();
        }
        return message!;
    }

    public async Task<int> GetUnreadCountAsync(int userId)
    {
        return await _context.Messages
            .CountAsync(m => m.RecipientId == userId && !m.IsRead);
    }

    public async Task DeleteAsync(int id)
    {
        var message = await _context.Messages.FindAsync(id);
        if (message != null)
        {
            _context.Messages.Remove(message);
            await _context.SaveChangesAsync();
        }
    }

    public async Task DeleteConversationAsync(int userId, int recipientId, int offerId)
    {
        var messages = await _context.Messages
            .Where(m => m.OfferId == offerId &&
                       ((m.SenderId == userId && m.RecipientId == recipientId) ||
                        (m.SenderId == recipientId && m.RecipientId == userId)))
            .ToListAsync();

        if (messages.Any())
        {
            _context.Messages.RemoveRange(messages);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<Message>> GetSentMessagesAsync(int userId)
    {
        return await _context.Messages
            .Include(m => m.Sender)
            .Include(m => m.Recipient)
            .Include(m => m.Offer)
            .Where(m => m.SenderId == userId)
            .OrderByDescending(m => m.SentAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Message>> GetReceivedMessagesAsync(int userId)
    {
        return await _context.Messages
            .Include(m => m.Sender)
            .Include(m => m.Recipient)
            .Include(m => m.Offer)
            .Where(m => m.RecipientId == userId)
            .OrderByDescending(m => m.SentAt)
            .ToListAsync();
    }
}