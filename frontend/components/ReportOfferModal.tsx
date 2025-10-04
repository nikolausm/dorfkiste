'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';

interface ReportOfferModalProps {
  offerId: number;
  offerTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_TYPES = [
  { value: 0, label: 'Illegaler Inhalt' },
  { value: 1, label: 'Urheberrechtsverletzung' },
  { value: 2, label: 'Spam' },
  { value: 3, label: 'Betrug' },
  { value: 4, label: 'Belästigung' },
  { value: 5, label: 'Falsches Profil' },
  { value: 6, label: 'Sonstiges' },
];

export default function ReportOfferModal({ offerId, offerTitle, isOpen, onClose }: ReportOfferModalProps) {
  const [reportType, setReportType] = useState(0);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!description.trim()) {
      setError('Bitte geben Sie eine Beschreibung ein.');
      return;
    }

    setIsSubmitting(true);

    try {
      await apiClient.reportOffer(offerId, reportType, description);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setDescription('');
        setReportType(0);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Melden des Angebots');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Angebot melden
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Angebot: <span className="font-medium text-gray-900 dark:text-gray-100">{offerTitle}</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-4">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4 mb-4">
            <p className="text-green-700 dark:text-green-300 text-sm">
              Meldung erfolgreich eingereicht. Ein Administrator wird Ihre Meldung prüfen.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Grund der Meldung *
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(Number(e.target.value))}
              className="input-field"
              required
            >
              {REPORT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Beschreibung *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
              rows={4}
              placeholder="Bitte beschreiben Sie das Problem detailliert..."
              required
              maxLength={2000}
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {description.length}/2000 Zeichen
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 btn-primary ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Wird gemeldet...' : 'Melden'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={isSubmitting}
            >
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
