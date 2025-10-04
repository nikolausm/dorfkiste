'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient, Message } from '@/lib/api';

interface ConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: number;
  recipientName: string;
  offerId: number;
  offerTitle: string;
  initialMessage?: Message;
}

export default function ConversationModal({
  isOpen,
  onClose,
  recipientId,
  recipientName,
  offerId,
  offerTitle,
  initialMessage
}: ConversationModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading: authLoading } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadConversation = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.getConversation(recipientId, offerId);
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Unterhaltung');
    } finally {
      setIsLoading(false);
    }
  }, [recipientId, offerId]);

  useEffect(() => {
    if (isOpen) {
      if (authLoading) {
        // Still loading auth, keep loading state
        setIsLoading(true);
      } else if (!user) {
        // Auth loaded but no user, stop loading
        setIsLoading(false);
        setError('Sie müssen angemeldet sein, um die Unterhaltung zu sehen.');
      } else {
        // Auth loaded and user exists, load conversation
        loadConversation();
      }
    }
  }, [isOpen, recipientId, offerId, authLoading, user, loadConversation]);

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

  const handleDeleteMessage = async (messageId: number) => {
    if (!confirm('Möchten Sie diese Nachricht wirklich löschen?')) return;

    try {
      await apiClient.deleteMessage(messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen der Nachricht');
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl h-[80vh] flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Unterhaltung</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Mit {recipientName} bezüglich &ldquo;{offerTitle}&rdquo;
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={isSending}
          >
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {authLoading ? 'Anmeldung wird geprüft...' : 'Unterhaltung wird geladen...'}
              </p>
            </div>
          ) : messages.length === 0 ? (
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
                      className={`max-w-[70%] rounded-2xl px-4 py-3 relative group ${
                        isOwnMessage
                          ? 'bg-primary-500 dark:bg-primary-600 text-white'
                          : isUnread
                          ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-700'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="break-words">{message.content}</p>
                        <button
                          onClick={() => handleDeleteMessage(message.id)}
                          className={`opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-1 rounded hover:bg-black/10 ${
                            isOwnMessage ? 'text-white/70 hover:text-white' : 'text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400'
                          }`}
                          title="Nachricht löschen"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
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