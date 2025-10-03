'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

interface Report {
  id: number;
  reportType: number;
  description: string;
  status: number;
  createdAt: string;
  reporter: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  reportedOffer?: {
    id: number;
    title: string;
    isActive: boolean;
  };
  reportedUser?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

const REPORT_TYPE_LABELS: Record<number, string> = {
  0: 'Illegaler Inhalt',
  1: 'Urheberrechtsverletzung',
  2: 'Spam',
  3: 'Betrug',
  4: 'Belästigung',
  5: 'Gefälschtes Profil',
  6: 'Sonstiges',
};

const STATUS_LABELS: Record<number, string> = {
  0: 'Ausstehend',
  1: 'In Bearbeitung',
  2: 'Gelöst',
  3: 'Abgelehnt',
};

export default function AdminReportsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    // TODO: Check if user is admin - for now, allow access
    loadReports();
  }, [filter]);

  const loadReports = async () => {
    try {
      const data = await apiClient.getAdminReports(filter);
      setReports(data);
    } catch (error) {
      console.error('Fehler beim Laden der Meldungen:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (reportId: number, resolution: string) => {
    setActionLoading(true);
    try {
      await apiClient.resolveReport(reportId, resolution, resolutionNotes);
      await loadReports();
      setSelectedReport(null);
      setResolutionNotes('');
      alert('Meldung erfolgreich bearbeitet!');
    } catch (error) {
      console.error('Fehler beim Bearbeiten:', error);
      alert('Ein Fehler ist aufgetreten.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspendUser = async (userId: number) => {
    if (!confirm('Möchten Sie diesen Nutzer wirklich sperren?')) return;

    setActionLoading(true);
    try {
      await apiClient.suspendUser(userId, resolutionNotes || 'Verstoß gegen Nutzungsbedingungen');
      alert('Nutzer erfolgreich gesperrt!');
      await loadReports();
    } catch (error) {
      console.error('Fehler beim Sperren:', error);
      alert('Ein Fehler ist aufgetreten.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveOffer = async (offerId: number) => {
    if (!confirm('Möchten Sie dieses Angebot wirklich entfernen?')) return;

    setActionLoading(true);
    try {
      await apiClient.removeOffer(offerId, resolutionNotes || 'Verstoß gegen Nutzungsbedingungen');
      alert('Angebot erfolgreich entfernt!');
      await loadReports();
    } catch (error) {
      console.error('Fehler beim Entfernen:', error);
      alert('Ein Fehler ist aufgetreten.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Meldungs-Verwaltung</h1>
          <p className="text-gray-600 mt-1">Verwalten Sie gemeldete Inhalte und Nutzer</p>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Alle Meldungen</option>
            <option value="0">Ausstehend</option>
            <option value="1">In Bearbeitung</option>
            <option value="2">Gelöst</option>
            <option value="3">Abgelehnt</option>
          </select>
        </div>

        {/* Reports List */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Typ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gemeldet</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Von</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aktionen</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{report.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {REPORT_TYPE_LABELS[report.reportType]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.reportedOffer && `Angebot: ${report.reportedOffer.title}`}
                    {report.reportedUser && `Nutzer: ${report.reportedUser.firstName} ${report.reportedUser.lastName}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.reporter.firstName} {report.reporter.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      report.status === 0 ? 'bg-yellow-100 text-yellow-800' :
                      report.status === 1 ? 'bg-blue-100 text-blue-800' :
                      report.status === 2 ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {STATUS_LABELS[report.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(report.createdAt).toLocaleDateString('de-DE')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {reports.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Keine Meldungen gefunden.</p>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Meldung #{selectedReport.id}</h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Typ</p>
                  <p className="font-medium">{REPORT_TYPE_LABELS[selectedReport.reportType]}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Beschreibung</p>
                  <p className="font-medium">{selectedReport.description}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Gemeldet von</p>
                  <p className="font-medium">
                    {selectedReport.reporter.firstName} {selectedReport.reporter.lastName} ({selectedReport.reporter.email})
                  </p>
                </div>

                {selectedReport.reportedOffer && (
                  <div>
                    <p className="text-sm text-gray-600">Gemeldetes Angebot</p>
                    <p className="font-medium">{selectedReport.reportedOffer.title}</p>
                  </div>
                )}

                {selectedReport.reportedUser && (
                  <div>
                    <p className="text-sm text-gray-600">Gemeldeter Nutzer</p>
                    <p className="font-medium">
                      {selectedReport.reportedUser.firstName} {selectedReport.reportedUser.lastName} ({selectedReport.reportedUser.email})
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Notizen</label>
                  <textarea
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Interne Notizen zur Bearbeitung..."
                  />
                </div>

                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  {selectedReport.reportedOffer && (
                    <button
                      onClick={() => handleRemoveOffer(selectedReport.reportedOffer!.id)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
                    >
                      Angebot entfernen
                    </button>
                  )}

                  {selectedReport.reportedUser && (
                    <button
                      onClick={() => handleSuspendUser(selectedReport.reportedUser!.id)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
                    >
                      Nutzer sperren
                    </button>
                  )}

                  <button
                    onClick={() => handleResolve(selectedReport.id, 'resolved')}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                  >
                    Als gelöst markieren
                  </button>

                  <button
                    onClick={() => handleResolve(selectedReport.id, 'rejected')}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400"
                  >
                    Ablehnen
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
