'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient, Message } from '@/lib/api';
import OfferThumbnail from '@/components/OfferThumbnail';

interface ConversationPreview {
  recipientId: number;
  recipientName: string;
  offerId: number | null;
  offerTitle: string;
  offerImageId?: number;
  offer?: {
    id: number;
    title: string;
    firstPictureId?: number;
    isActive: boolean;
    isService: boolean;
  } | null;
  latestMessage: Message;
  unreadCount: number;
}

export default function InboxPage() {
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'active' | 'inactive'>('all');

  useEffect(() => {
    if (!authLoading) {
      if (!isLoggedIn) {
        router.push('/anmelden');
        return;
      }
      loadConversations();
    }
  }, [isLoggedIn, authLoading, router]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get both received and sent messages to build complete conversation view
      const [inboxMessages, sentMessages] = await Promise.all([
        apiClient.getInbox(),
        apiClient.getSentMessages()
      ]);

      // Combine all messages
      const allMessages = [...inboxMessages, ...sentMessages];

      // Group messages by conversation (participants + offer) to create conversation previews
      const conversationMap = new Map<string, ConversationPreview>();

      for (const message of allMessages) {
        // Create a consistent conversation key regardless of who sent the message
        // Sort participant IDs to ensure same conversation has same key
        const participants = [message.senderId, message.recipientId].sort((a, b) => a - b);
        const conversationKey = `${participants[0]}-${participants[1]}-${message.offerId}`;

        // Determine the other person in the conversation (not the current user)
        const isCurrentUserSender = message.senderId === user?.id;
        const otherPersonId = isCurrentUserSender ? message.recipientId : message.senderId;
        const otherPersonData = isCurrentUserSender ? message.recipient : message.sender;
        const otherPersonName = otherPersonData ? `${otherPersonData.firstName} ${otherPersonData.lastName}` : 'Unbekannt';

        if (!conversationMap.has(conversationKey)) {
          conversationMap.set(conversationKey, {
            recipientId: otherPersonId,
            recipientName: otherPersonName,
            offerId: message.offerId,
            offerTitle: message.offer?.title || 'Unbekanntes Angebot',
            offerImageId: message.offer?.firstPictureId,
            offer: message.offer ? {
              id: message.offer.id,
              title: message.offer.title,
              firstPictureId: message.offer.firstPictureId,
              isActive: message.offer.isActive,
              isService: message.offer.isService
            } : null,
            latestMessage: message,
            unreadCount: 0
          });
        }

        const conversation = conversationMap.get(conversationKey)!;

        // Update with latest message if this one is newer
        if (new Date(message.sentAt) > new Date(conversation.latestMessage.sentAt)) {
          conversation.latestMessage = message;
          // Update the other person info based on the latest message
          const latestIsCurrentUserSender = message.senderId === user?.id;
          const latestOtherPersonId = latestIsCurrentUserSender ? message.recipientId : message.senderId;
          const latestOtherPersonData = latestIsCurrentUserSender ? message.recipient : message.sender;
          const latestOtherPersonName = latestOtherPersonData ? `${latestOtherPersonData.firstName} ${latestOtherPersonData.lastName}` : 'Unbekannt';

          conversation.recipientId = latestOtherPersonId;
          conversation.recipientName = latestOtherPersonName;
        }

        // Count unread messages (only messages sent by the other person)
        if (!message.isRead && message.senderId !== user?.id) {
          conversation.unreadCount++;
        }
      }

      // Convert to array and sort by latest message timestamp
      const conversationList = Array.from(conversationMap.values()).sort((a, b) =>
        new Date(b.latestMessage.sentAt).getTime() - new Date(a.latestMessage.sentAt).getTime()
      );

      setConversations(conversationList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Nachrichten');
    } finally {
      setIsLoading(false);
    }
  };

  const openConversation = (conversation: ConversationPreview) => {
    router.push(`/nachrichten/${conversation.recipientId}/${conversation.offerId}`);
  };

  const deleteConversation = async (conversation: ConversationPreview, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the conversation

    if (!window.confirm(`Möchten Sie die gesamte Unterhaltung mit ${conversation.recipientName} zu "${conversation.offerTitle}" wirklich löschen?`)) {
      return;
    }

    try {
      if (conversation.offerId === null) {
        setError('Unterhaltung ohne Angebot kann nicht gelöscht werden');
        return;
      }
      await apiClient.deleteConversation(conversation.recipientId, conversation.offerId);
      // Remove the conversation from local state
      setConversations(prev => prev.filter(c =>
        !(c.recipientId === conversation.recipientId && c.offerId === conversation.offerId)
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen der Unterhaltung');
    }
  };


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Gerade';
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('de-DE', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit'
      });
    }
  };


  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 dark:border-primary-400"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">Nachrichten werden geladen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button onClick={loadConversations} className="btn-primary mt-3 text-sm px-4 py-2">
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  // Filter conversations based on filter type
  const filteredConversations = conversations.filter(conversation => {
    switch (filterType) {
      case 'unread':
        return conversation.unreadCount > 0;
      case 'active':
        return conversation.offer?.isActive === true;
      case 'inactive':
        return conversation.offer?.isActive === false || conversation.offer === null;
      default:
        return true;
    }
  });

  const filterCounts = {
    all: conversations.length,
    unread: conversations.filter(c => c.unreadCount > 0).length,
    active: conversations.filter(c => c.offer?.isActive === true).length,
    inactive: conversations.filter(c => c.offer?.isActive === false || c.offer === null).length
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Nachrichten</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Ihre Unterhaltungen zu Angeboten
          </p>
        </div>
        <button
          onClick={loadConversations}
          className="btn-secondary text-sm px-3 py-1.5 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Aktualisieren
        </button>
      </div>

      {/* Filter Tabs */}
      {conversations.length > 0 && (
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-primary-600 dark:bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Alle ({filterCounts.all})
            </button>
            <button
              onClick={() => setFilterType('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'unread'
                  ? 'bg-primary-600 dark:bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Ungelesen ({filterCounts.unread})
            </button>
            <button
              onClick={() => setFilterType('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'active'
                  ? 'bg-primary-600 dark:bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Aktive Angebote ({filterCounts.active})
            </button>
            <button
              onClick={() => setFilterType('inactive')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'inactive'
                  ? 'bg-primary-600 dark:bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Inaktive Angebote ({filterCounts.inactive})
            </button>
          </div>
        </div>
      )}

      {/* Conversation List */}
      {filteredConversations.length === 0 ? (
        conversations.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Keine Nachrichten</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Sie haben noch keine Nachrichten erhalten. Sobald jemand Interesse an Ihren Angeboten zeigt, erscheinen die Nachrichten hier.
          </p>
          <Link href="/angebot-erstellen" className="btn-primary">
            Erstes Angebot erstellen
          </Link>
        </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Keine passenden Nachrichten</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Es wurden keine Nachrichten gefunden, die den aktuellen Filterkriterien entsprechen.
            </p>
            <button onClick={() => setFilterType('all')} className="btn-secondary">
              Alle Nachrichten anzeigen
            </button>
          </div>
        )
      ) : (
        <div className="space-y-3">
          {filteredConversations.map((conversation) => (
            <div
              key={`${conversation.recipientId}-${conversation.offerId}`}
              onClick={() => openConversation(conversation)}
              className={`group bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all duration-200 cursor-pointer ${
                conversation.unreadCount > 0 ? 'ring-2 ring-primary-200 dark:ring-primary-700 bg-primary-50/20 dark:bg-primary-900/20' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Offer Image */}
                <OfferThumbnail
                  offer={conversation.offer ? {
                    id: conversation.offer.id,
                    title: conversation.offer.title,
                    isService: conversation.offer.isService,
                    firstPicture: conversation.offer.firstPictureId ? {
                      id: conversation.offer.firstPictureId,
                      fileName: '',
                      contentType: '',
                      displayOrder: 0
                    } : undefined
                  } : null}
                  size="small"
                  className="flex-shrink-0"
                  isInactive={!conversation.offer?.isActive}
                />

                {/* Conversation Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {conversation.recipientName}
                      </h3>
                      <p className="text-sm text-primary-600 dark:text-primary-400 font-medium truncate">
                        {conversation.offerTitle}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {conversation.unreadCount > 0 && (
                        <span className="bg-primary-500 dark:bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                          {conversation.unreadCount}
                        </span>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {formatDate(conversation.latestMessage.sentAt)}
                      </span>
                    </div>
                  </div>

                  {/* Latest Message Preview */}
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 leading-relaxed">
                    <span className="font-medium">
                      {conversation.latestMessage.senderId === user?.id ? 'Sie: ' : `${conversation.recipientName}: `}
                    </span>
                    {conversation.latestMessage.content}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex-shrink-0 flex items-center gap-2">
                  {/* Delete button */}
                  <button
                    onClick={(e) => deleteConversation(conversation, e)}
                    className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200"
                    title="Unterhaltung löschen"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>

                  {/* Arrow Icon */}
                  <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}