'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient, PrivacySettings } from '@/lib/api';

export default function SettingsPage() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [privacySettings, setPrivacySettings] = useState({
    showPhoneNumber: true,
    showMobileNumber: true,
    showStreet: true,
    showCity: true,
  });
  const [privacyError, setPrivacyError] = useState('');
  const [privacySuccess, setPrivacySuccess] = useState('');
  const [isSavingPrivacy, setIsSavingPrivacy] = useState(false);

  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Load privacy settings on component mount
  useEffect(() => {
    if (isLoggedIn && !authLoading) {
      loadPrivacySettings();
    }
  }, [isLoggedIn, authLoading]);

  const loadPrivacySettings = async () => {
    try {
      const settings = await apiClient.getPrivacySettings();
      setPrivacySettings({
        showPhoneNumber: settings.showPhoneNumber,
        showMobileNumber: settings.showMobileNumber,
        showStreet: settings.showStreet,
        showCity: settings.showCity,
      });
    } catch (err) {
      console.error('Error loading privacy settings:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Bitte füllen Sie alle Felder aus.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Das neue Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Die Passwörter stimmen nicht überein.');
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.changePassword(oldPassword, newPassword);
      setSuccess('Passwort erfolgreich geändert!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Ändern des Passworts');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrivacySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPrivacyError('');
    setPrivacySuccess('');
    setIsSavingPrivacy(true);

    try {
      await apiClient.updatePrivacySettings(privacySettings);
      setPrivacySuccess('Datenschutz-Einstellungen erfolgreich gespeichert!');
    } catch (err) {
      setPrivacyError(err instanceof Error ? err.message : 'Fehler beim Speichern der Einstellungen');
    } finally {
      setIsSavingPrivacy(false);
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Laden...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    router.push('/anmelden');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Einstellungen
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Kontoinformationen
          </h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Name:</span>
              <p className="text-gray-900 dark:text-gray-100">{user?.firstName} {user?.lastName}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">E-Mail:</span>
              <p className="text-gray-900 dark:text-gray-100">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Passwort ändern
          </h2>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-4">
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4 mb-4">
              <p className="text-green-700 dark:text-green-300 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Altes Passwort *
              </label>
              <input
                id="oldPassword"
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="input-field mt-1"
                placeholder="Geben Sie Ihr aktuelles Passwort ein"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Neues Passwort *
              </label>
              <input
                id="newPassword"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field mt-1"
                placeholder="Mindestens 6 Zeichen"
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Neues Passwort bestätigen *
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field mt-1"
                placeholder="Passwort wiederholen"
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full btn-primary ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Wird geändert...' : 'Passwort ändern'}
            </button>
          </form>
        </div>

        {/* Privacy Settings Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Datenschutz-Einstellungen
          </h2>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Bestimmen Sie, welche Kontaktdaten anderen registrierten Nutzern in Ihren Angeboten angezeigt werden.
            Ihr Name wird immer angezeigt.
          </p>

          {privacyError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-4">
              <p className="text-red-700 dark:text-red-300 text-sm">{privacyError}</p>
            </div>
          )}

          {privacySuccess && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4 mb-4">
              <p className="text-green-700 dark:text-green-300 text-sm">{privacySuccess}</p>
            </div>
          )}

          <form onSubmit={handlePrivacySubmit} className="space-y-4">
            <div className="space-y-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacySettings.showPhoneNumber}
                  onChange={(e) => setPrivacySettings({
                    ...privacySettings,
                    showPhoneNumber: e.target.checked
                  })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                  Telefonnummer anzeigen
                </span>
              </label>

              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacySettings.showMobileNumber}
                  onChange={(e) => setPrivacySettings({
                    ...privacySettings,
                    showMobileNumber: e.target.checked
                  })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                  Mobilnummer anzeigen
                </span>
              </label>

              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacySettings.showStreet}
                  onChange={(e) => setPrivacySettings({
                    ...privacySettings,
                    showStreet: e.target.checked
                  })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                  Straße und Hausnummer anzeigen
                </span>
              </label>

              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacySettings.showCity}
                  onChange={(e) => setPrivacySettings({
                    ...privacySettings,
                    showCity: e.target.checked
                  })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                  Ort und PLZ anzeigen
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSavingPrivacy}
              className={`w-full btn-primary ${isSavingPrivacy ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSavingPrivacy ? 'Wird gespeichert...' : 'Datenschutz-Einstellungen speichern'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
