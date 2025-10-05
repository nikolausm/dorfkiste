'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient, Message, User, OfferDetail } from '@/lib/api';

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [recipient, setRecipient] = useState<User | null>(null);
  const [offer, setOffer] = useState<OfferDetail | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading: authLoading } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const recipientId = parseInt(params.recipientId as string);
  const offerId = parseInt(params.offerId as string);

  const loadConversation = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load conversation messages and offer info
      const [messageData, offerData] = await Promise.all([
        apiClient.getConversation(recipientId, offerId),
        apiClient.getOffer(offerId)
      ]);

      setMessages(messageData);
      setOffer(offerData);

      // Get recipient info from messages or offer owner
      let recipientUser = null;

      // First, try to find recipient info from messages
      const recipientMessage = messageData.find(msg =>
        (msg.senderId === recipientId && msg.sender) ||
        (msg.recipientId === recipientId && msg.recipient)
      );

      if (recipientMessage) {
        if (recipientMessage.senderId === recipientId && recipientMessage.sender) {
          recipientUser = recipientMessage.sender;
        } else if (recipientMessage.recipientId === recipientId && recipientMessage.recipient) {
          recipientUser = recipientMessage.recipient;
        }
      }

      // If no recipient found in messages but we have an offer, get recipient from offer owner
      if (!recipientUser && offerData?.user) {
        // Check if the recipient ID matches the offer owner
        if (recipientId === offerData.user.id) {
          recipientUser = {
            id: offerData.user.id,
            email: '',
            firstName: offerData.user.firstName,
            lastName: offerData.user.lastName
          };
        }
      }

      // If still no recipient found, try to fetch user info directly
      if (!recipientUser) {
        try {
          const publicUser = await apiClient.getUserById(recipientId);
          recipientUser = {
            id: publicUser.id,
            email: '',
            firstName: publicUser.firstName,
            lastName: publicUser.lastName,
            isAdmin: false
          };
        } catch (err) {
          console.warn('Could not fetch recipient user info:', err);
          // Fallback to minimal user object
          recipientUser = {
            id: recipientId,
            email: '',
            firstName: 'Benutzer',
            lastName: `#${recipientId}`,
            isAdmin: false
          };
        }
      }

      if (recipientUser) {
        setRecipient(recipientUser);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Unterhaltung');
    } finally {
      setIsLoading(false);
    }
  }, [recipientId, offerId]);

  useEffect(() => {
    if (authLoading) {
      // Still loading auth, keep loading state
      setIsLoading(true);
    } else if (!user) {
      // Auth loaded but no user, stop loading and show error
      setIsLoading(false);
      setError('Sie müssen angemeldet sein, um die Unterhaltung zu sehen.');
    } else {
      // Auth loaded and user exists, load conversation
      loadConversation();
    }
  }, [recipientId, offerId, authLoading, user, loadConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !user) return;

    setIsSending(true);
    setError(null);

    try {
      const sentMessage = await apiClient.sendMessage({
        recipientId,
        offerId,
        content: newMessage.trim()
      });

      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');

      // Auto-resize textarea back to original size
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Senden der Nachricht');
    } finally {
      setIsSending(false);
    }
  };


  const markAsRead = async (messageId: number) => {
    try {
      await apiClient.markMessageAsRead(messageId);
      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, isRead: true } : msg
      ));
    } catch (err) {
      console.error('Fehler beim Markieren als gelesen:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    // Check if message is from today
    const isToday = date.toDateString() === now.toDateString();

    // Check if message is from yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Gerade eben';
    } else if (isToday) {
      // Show only time for today's messages
      return date.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (isYesterday) {
      // Show "Gestern" with time for yesterday's messages
      return `Gestern ${date.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    } else if (diffInHours < 24 * 7) {
      // Show weekday with time for messages within a week
      return date.toLocaleDateString('de-DE', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      // Show full date and time for older messages
      return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSendMessage(e as any);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {authLoading ? 'Anmeldung wird geprüft...' : 'Unterhaltung wird geladen...'}
          </p>
        </div>
      </div>
    );
  }

  if (error || !recipient || !offer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 text-lg">{error || 'Unterhaltung nicht gefunden'}</p>
          <Link href="/nachrichten" className="btn-primary mt-4 inline-block">
            Zurück zu den Nachrichten
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        {/* Breadcrumb */}
        <nav className="mb-4">
          <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <li><Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400">Startseite</Link></li>
            <li>›</li>
            <li><Link href="/nachrichten" className="hover:text-primary-600 dark:hover:text-primary-400">Nachrichten</Link></li>
            <li>›</li>
            <li className="text-gray-900 dark:text-gray-100">Unterhaltung</li>
          </ol>
        </nav>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Unterhaltung</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Mit {recipient.firstName} {recipient.lastName} bezüglich &ldquo;{offer.title}&rdquo;
            </p>
          </div>
          <Link href="/nachrichten" className="btn-secondary">
            ← Zurück zu den Nachrichten
          </Link>
        </div>

        {/* Offer Info */}
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-4">
            {/* Offer Image */}
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
              {offer.pictures && offer.pictures.length > 0 ? (
                <Image
                  src={apiClient.getPictureUrl(offer.pictures[0].id)}
                  alt={offer.title}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 ${
                offer.pictures && offer.pictures.length > 0 ? 'hidden' : ''
              }`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>

            {/* Offer Details */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{offer.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {offer.isService ? 'Dienstleistung' : 'Gegenstand'} •
                {offer.category ? ` ${offer.category.name}` : ''}
              </p>
            </div>

            {/* Action Button */}
            <div className="flex-shrink-0">
              <Link
                href={`/angebote/${offer.id}`}
                className="btn-secondary text-sm"
              >
                Angebot ansehen
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm flex flex-col" style={{ height: '70vh' }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">Noch keine Nachrichten in dieser Unterhaltung.</p>
            </div>
          ) : (
            <>
              {messages.map((message) => {
                const isOwnMessage = user && message.senderId === user.id;
                const isUnread = !message.isRead && !isOwnMessage;

                // Auto-mark as read when viewing
                if (isUnread) {
                  markAsRead(message.id);
                }

                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        isOwnMessage
                          ? 'bg-primary-500 dark:bg-primary-600 text-white'
                          : isUnread
                          ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-700'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      <p className="break-words leading-relaxed">{message.content}</p>
                      <p className={`text-xs mt-2 ${isOwnMessage ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}>
                        {formatDate(message.sentAt)}
                        {isUnread && (
                          <span className="ml-2 text-xs bg-blue-500 dark:bg-blue-600 text-white px-2 py-0.5 rounded-full">
                            Neu
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex gap-3">
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={newMessage}
                onChange={handleTextareaChange}
                onKeyDown={handleTextareaKeyDown}
                placeholder="Nachricht eingeben... (Strg+Enter zum Senden)"
                className="input-field resize-none min-h-[44px] max-h-[150px]"
                disabled={isSending}
                maxLength={2000}
                rows={1}
              />
              <div className="flex justify-between items-center mt-2">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {newMessage.length}/2000 Zeichen
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Strg+Enter zum Senden
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="btn-primary px-6 self-start"
              disabled={isSending || !newMessage.trim()}
            >
              {isSending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Senden...
                </div>
              ) : (
                'Senden'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}