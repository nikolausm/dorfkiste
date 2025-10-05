'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface UserPrivacySettings {
  marketingEmailsConsent: boolean;
  dataProcessingConsent: boolean;
  profileVisibilityConsent: boolean;
  dataSharingConsent: boolean;
  showPhoneNumber: boolean;
  showMobileNumber: boolean;
  showStreet: boolean;
  showCity: boolean;
  marketingEmailsConsentDate?: string;
  dataProcessingConsentDate?: string;
  profileVisibilityConsentDate?: string;
  dataSharingConsentDate?: string;
}

export default function PrivacyDashboardPage() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<UserPrivacySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/auth/login');
      return;
    }

    loadPrivacySettings();
  }, [isLoggedIn, router]);

  const loadPrivacySettings = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/privacy-settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Datenschutzeinstellungen:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    setSaving(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/privacy-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert('Datenschutzeinstellungen erfolgreich gespeichert!');
        await loadPrivacySettings();
      } else {
        alert('Fehler beim Speichern der Einstellungen.');
      }
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      alert('Ein Fehler ist aufgetreten.');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setExportLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/export-data`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `meine-daten-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Fehler beim Export der Daten.');
      }
    } catch (error) {
      console.error('Fehler beim Datenexport:', error);
      alert('Ein Fehler ist aufgetreten.');
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setDeleteLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/delete-account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Ihr Account wurde erfolgreich gelöscht.');
        router.push('/');
      } else {
        alert('Fehler beim Löschen des Accounts.');
      }
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      alert('Ein Fehler ist aufgetreten.');
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Datenschutz-Dashboard</h1>

          {/* Privacy Settings */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Einwilligungen</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="marketing"
                    type="checkbox"
                    checked={settings?.marketingEmailsConsent || false}
                    onChange={(e) => setSettings(prev => prev ? {...prev, marketingEmailsConsent: e.target.checked} : null)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="marketing" className="font-medium text-gray-700 dark:text-gray-300">Marketing-E-Mails</label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ich möchte Informationen über neue Angebote und Updates erhalten.</p>
                  {settings?.marketingEmailsConsentDate && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Einwilligung erteilt am: {new Date(settings.marketingEmailsConsentDate).toLocaleDateString('de-DE')}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="processing"
                    type="checkbox"
                    checked={settings?.dataProcessingConsent || false}
                    onChange={(e) => setSettings(prev => prev ? {...prev, dataProcessingConsent: e.target.checked} : null)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                    disabled
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="processing" className="font-medium text-gray-700 dark:text-gray-300">Datenverarbeitung (erforderlich)</label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Erforderlich für die Nutzung der Plattform.</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="visibility"
                    type="checkbox"
                    checked={settings?.profileVisibilityConsent || false}
                    onChange={(e) => setSettings(prev => prev ? {...prev, profileVisibilityConsent: e.target.checked} : null)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="visibility" className="font-medium text-gray-700 dark:text-gray-300">Profilsichtbarkeit</label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Mein Profil für andere Nutzer sichtbar machen.</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="sharing"
                    type="checkbox"
                    checked={settings?.dataSharingConsent || false}
                    onChange={(e) => setSettings(prev => prev ? {...prev, dataSharingConsent: e.target.checked} : null)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="sharing" className="font-medium text-gray-700 dark:text-gray-300">Datenweitergabe</label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Daten mit Partnern für verbesserte Services teilen.</p>
                </div>
              </div>
            </div>

            {/* Contact Information Visibility */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">Sichtbarkeit der Kontaktinformationen</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Legen Sie fest, welche Kontaktinformationen andere Benutzer sehen können, wenn sie Interesse an Ihren Angeboten haben.
              </p>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    id="showPhone"
                    type="checkbox"
                    checked={settings?.showPhoneNumber || false}
                    onChange={(e) => setSettings(prev => prev ? {...prev, showPhoneNumber: e.target.checked} : null)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <label htmlFor="showPhone" className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    📞 Telefonnummer anzeigen
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="showMobile"
                    type="checkbox"
                    checked={settings?.showMobileNumber || false}
                    onChange={(e) => setSettings(prev => prev ? {...prev, showMobileNumber: e.target.checked} : null)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <label htmlFor="showMobile" className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    📱 Mobilnummer anzeigen
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="showStreet"
                    type="checkbox"
                    checked={settings?.showStreet || false}
                    onChange={(e) => setSettings(prev => prev ? {...prev, showStreet: e.target.checked} : null)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <label htmlFor="showStreet" className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    🏠 Straße und Hausnummer anzeigen
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="showCity"
                    type="checkbox"
                    checked={settings?.showCity || false}
                    onChange={(e) => setSettings(prev => prev ? {...prev, showCity: e.target.checked} : null)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <label htmlFor="showCity" className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    🏙️ Stadt anzeigen
                  </label>
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="mt-6 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600"
            >
              {saving ? 'Speichern...' : 'Einstellungen speichern'}
            </button>
          </div>

          {/* Data Export */}
          <div className="mb-8 border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Datenportabilität (Art. 20 DSGVO)</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Sie haben das Recht, Ihre personenbezogenen Daten in einem strukturierten, gängigen und maschinenlesbaren Format zu erhalten.
            </p>
            <button
              onClick={handleExportData}
              disabled={exportLoading}
              className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600 disabled:bg-gray-400 dark:disabled:bg-gray-600"
            >
              {exportLoading ? 'Exportiere Daten...' : 'Meine Daten exportieren'}
            </button>
          </div>

          {/* Account Deletion */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">Recht auf Löschung (Art. 17 DSGVO)</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Sie haben das Recht, die Löschung Ihrer personenbezogenen Daten zu verlangen. Diese Aktion ist unwiderruflich.
            </p>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-600"
              >
                Account löschen
              </button>
            ) : (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                <p className="text-red-800 dark:text-red-300 font-medium mb-4">
                  Sind Sie sicher? Diese Aktion kann nicht rückgängig gemacht werden!
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading}
                    className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-600 disabled:bg-gray-400 dark:disabled:bg-gray-600"
                  >
                    {deleteLoading ? 'Lösche Account...' : 'Ja, Account unwiderruflich löschen'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
