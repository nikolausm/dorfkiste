'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'offer' | 'user';
  targetId: number;
  targetTitle?: string;
}

const REPORT_TYPES = [
  { value: 0, label: 'Illegaler Inhalt' },
  { value: 1, label: 'Urheberrechtsverletzung' },
  { value: 2, label: 'Spam' },
  { value: 3, label: 'Betrug' },
  { value: 4, label: 'Belästigung' },
  { value: 5, label: 'Gefälschtes Profil' },
  { value: 6, label: 'Sonstiges' },
];

export default function ReportModal({ isOpen, onClose, targetType, targetId, targetTitle }: ReportModalProps) {
  const [reportType, setReportType] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      alert('Bitte beschreiben Sie das Problem.');
      return;
    }

    setLoading(true);
    try {
      if (targetType === 'offer') {
        await apiClient.reportOffer(targetId, reportType, description);
      } else {
        await apiClient.reportUser(targetId, reportType, description);
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setReportType(0);
        setDescription('');
      }, 2000);
    } catch (error) {
      console.error('Fehler beim Melden:', error);
      alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {targetType === 'offer' ? 'Angebot melden' : 'Nutzer melden'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="mt-4 text-green-600 font-medium">Meldung erfolgreich gesendet!</p>
            <p className="text-sm text-gray-500 mt-2">Wir werden Ihre Meldung prüfen.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {targetTitle && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Meldung für: <span className="font-medium">{targetTitle}</span>
                </p>
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-2">
                Grund der Meldung
              </label>
              <select
                id="reportType"
                value={reportType}
                onChange={(e) => setReportType(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {REPORT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Beschreibung des Problems *
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Bitte beschreiben Sie das Problem so detailliert wie möglich..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={loading || !description.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
              >
                {loading ? 'Sende...' : 'Melden'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
