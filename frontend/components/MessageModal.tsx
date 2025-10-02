'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient, User } from '@/lib/api';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: number;
  recipientName: string;
  offerId: number;
  offerTitle: string;
  onMessageSent?: () => void;
}

export default function MessageModal({
  isOpen,
  onClose,
  recipientId,
  recipientName,
  offerId,
  offerTitle,
  onMessageSent
}: MessageModalProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Bitte geben Sie eine Nachricht ein.');
      return;
    }

    if (!user) {
      setError('Sie müssen angemeldet sein, um Nachrichten zu senden.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await apiClient.sendMessage({
        recipientId,
        offerId,
        content: message.trim()
      });

      setIsSuccess(true);
      setMessage('');

      // Call onMessageSent callback if provided
      if (onMessageSent) {
        onMessageSent();
      }

      // Close modal after a short delay to show success message
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Senden der Nachricht');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setMessage('');
      setError(null);
      setIsSuccess(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-large w-full max-w-md animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div>
            <h3 className="text-xl font-bold text-neutral-900">Nachricht senden</h3>
            <p className="text-sm text-neutral-600 mt-1">
              An {recipientName} bezüglich &ldquo;{offerTitle}&rdquo;
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          {isSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-neutral-900 mb-2">Nachricht gesendet!</h4>
              <p className="text-neutral-600">
                Ihre Nachricht wurde erfolgreich an {recipientName} gesendet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-2">
                  Ihre Nachricht
                </label>
                <textarea
                  id="message"
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Hallo! Ich interessiere mich für Ihr Angebot..."
                  className="input-field resize-none"
                  disabled={isLoading}
                  maxLength={2000}
                />
                <div className="flex justify-between items-center mt-2">
                  <div className="text-xs text-neutral-500">
                    {message.length}/2000 Zeichen
                  </div>
                  <div className="text-xs text-neutral-500">
                    Drücken Sie Enter + Strg zum Senden
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-secondary flex-1"
                  disabled={isLoading}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={isLoading || !message.trim()}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Senden...
                    </div>
                  ) : (
                    'Nachricht senden'
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}