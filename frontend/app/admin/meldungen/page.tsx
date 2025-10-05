'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient, AdminReport } from '@/lib/api';

const REPORT_STATUS = {
  Pending: 0,
  UnderReview: 1,
  Resolved: 2,
  Rejected: 3,
};

const REPORT_STATUS_LABELS = {
  Pending: 'Ausstehend',
  UnderReview: 'In Bearbeitung',
  Resolved: 'Gelöst',
  Rejected: 'Abgelehnt',
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [reviewingReport, setReviewingReport] = useState<number | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewStatus, setReviewStatus] = useState(REPORT_STATUS.Resolved);
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!isLoggedIn || !user?.isAdmin)) {
      router.push('/');
      return;
    }

    if (isLoggedIn && user?.isAdmin) {
      loadReports();
    }
  }, [isLoggedIn, user, authLoading, router, selectedStatus]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAdminReports(selectedStatus);
      setReports(data);
    } catch (err) {
      setError('Fehler beim Laden der Meldungen');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (reportId: number) => {
    try {
      await apiClient.reviewReport(reportId, reviewStatus, reviewNotes);
      setReviewingReport(null);
      setReviewNotes('');
      setReviewStatus(REPORT_STATUS.Resolved);
      loadReports();
    } catch (err) {
      setError('Fehler beim Überprüfen der Meldung');
      console.error(err);
    }
  };

  const handleToggleOffer = async (offerId: number) => {
    try {
      await apiClient.adminToggleOfferActive(offerId);
      loadReports();
    } catch (err) {
      setError('Fehler beim Deaktivieren des Angebots');
      console.error(err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Laden...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !user?.isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Meldungen verwalten
        </h1>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filter nach Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input-field"
          >
            <option value="">Alle</option>
            <option value="Pending">Ausstehend</option>
            <option value="UnderReview">In Bearbeitung</option>
            <option value="Resolved">Gelöst</option>
            <option value="Rejected">Abgelehnt</option>
          </select>
        </div>

        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      report.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : report.status === 'UnderReview'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : report.status === 'Resolved'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {REPORT_STATUS_LABELS[report.status as keyof typeof REPORT_STATUS_LABELS]}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                      {report.reportType}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Gemeldet von: {report.reporter.firstName} {report.reporter.lastName} ({report.reporter.email})
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Datum: {new Date(report.createdAt).toLocaleString('de-DE')}
                  </p>
                </div>
              </div>

              {report.reportedOffer && (
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Gemeldetes Angebot:
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {report.reportedOffer.title}
                    <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      report.reportedOffer.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {report.reportedOffer.isActive ? 'Aktiv' : 'Deaktiviert'}
                    </span>
                  </p>
                  <div className="flex gap-3 mt-2">
                    <a
                      href={`/angebote/${report.reportedOffer.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                    >
                      Angebot ansehen →
                    </a>
                    <button
                      onClick={() => handleToggleOffer(report.reportedOffer!.id)}
                      className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                    >
                      {report.reportedOffer.isActive ? 'Angebot deaktivieren' : 'Angebot aktivieren'}
                    </button>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Beschreibung:
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">{report.description}</p>
              </div>

              {report.reviewedBy && (
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Überprüft von: {report.reviewedBy.firstName} {report.reviewedBy.lastName}
                  </p>
                  {report.reviewedAt && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Am: {new Date(report.reviewedAt).toLocaleString('de-DE')}
                    </p>
                  )}
                  {report.resolutionNotes && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                      Notizen: {report.resolutionNotes}
                    </p>
                  )}
                </div>
              )}

              {report.status === 'Pending' && (
                <div className="mt-4">
                  {reviewingReport === report.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Status
                        </label>
                        <select
                          value={reviewStatus}
                          onChange={(e) => setReviewStatus(Number(e.target.value))}
                          className="input-field"
                        >
                          <option value={REPORT_STATUS.Resolved}>Gelöst</option>
                          <option value={REPORT_STATUS.Rejected}>Abgelehnt</option>
                          <option value={REPORT_STATUS.UnderReview}>In Bearbeitung</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Notizen
                        </label>
                        <textarea
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          className="input-field"
                          rows={3}
                          placeholder="Optionale Notizen zur Überprüfung..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReview(report.id)}
                          className="btn-primary"
                        >
                          Speichern
                        </button>
                        <button
                          onClick={() => {
                            setReviewingReport(null);
                            setReviewNotes('');
                            setReviewStatus(REPORT_STATUS.Resolved);
                          }}
                          className="btn-secondary"
                        >
                          Abbrechen
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReviewingReport(report.id)}
                      className="btn-primary"
                    >
                      Überprüfen
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {reports.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Keine Meldungen gefunden</p>
          </div>
        )}
      </div>
    </div>
  );
}
