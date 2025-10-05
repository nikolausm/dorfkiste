'use client';

import { useState, useEffect } from 'react';
import { apiClient, AdminUser } from '@/lib/api';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser | null;
  onUserUpdated: () => void;
}

export default function EditUserModal({
  isOpen,
  onClose,
  user,
  onUserUpdated,
}: EditUserModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [marketingEmailsConsent, setMarketingEmailsConsent] = useState(false);
  const [dataProcessingConsent, setDataProcessingConsent] = useState(true);
  const [profileVisibilityConsent, setProfileVisibilityConsent] = useState(true);
  const [dataSharingConsent, setDataSharingConsent] = useState(false);
  const [showPhoneNumber, setShowPhoneNumber] = useState(true);
  const [showMobileNumber, setShowMobileNumber] = useState(true);
  const [showStreet, setShowStreet] = useState(true);
  const [showCity, setShowCity] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhoneNumber(user.contactInfo?.phoneNumber || '');
      setMobileNumber(user.contactInfo?.mobileNumber || '');
      setStreet(user.contactInfo?.street || '');
      setCity(user.contactInfo?.city || '');
      setPostalCode(user.contactInfo?.postalCode || '');
      setState(user.contactInfo?.state || '');
      setCountry(user.contactInfo?.country || '');
      setMarketingEmailsConsent(user.privacySettings?.marketingEmailsConsent || false);
      setDataProcessingConsent(user.privacySettings?.dataProcessingConsent ?? true);
      setProfileVisibilityConsent(user.privacySettings?.profileVisibilityConsent ?? true);
      setDataSharingConsent(user.privacySettings?.dataSharingConsent || false);
      setShowPhoneNumber(user.privacySettings?.showPhoneNumber ?? true);
      setShowMobileNumber(user.privacySettings?.showMobileNumber ?? true);
      setShowStreet(user.privacySettings?.showStreet ?? true);
      setShowCity(user.privacySettings?.showCity ?? true);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    if (!firstName.trim() || !lastName.trim()) {
      setError('Vor- und Nachname sind erforderlich');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await apiClient.updateUserData(user.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        contactInfo: {
          phoneNumber: phoneNumber.trim() || undefined,
          mobileNumber: mobileNumber.trim() || undefined,
          street: street.trim() || undefined,
          city: city.trim() || undefined,
          postalCode: postalCode.trim() || undefined,
          state: state.trim() || undefined,
          country: country.trim() || undefined,
        },
      });

      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        onUserUpdated();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Aktualisieren der Benutzerdaten');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Benutzer bearbeiten
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {user.email}
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {success && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Benutzerdaten erfolgreich aktualisiert!
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Name Section */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vorname *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={isLoading || success}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nachname *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={isLoading || success}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Contact Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Kontaktinformationen
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={isLoading || success}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mobil
                    </label>
                    <input
                      type="tel"
                      id="mobileNumber"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      disabled={isLoading || success}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="street" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Straße
                  </label>
                  <input
                    type="text"
                    id="street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    disabled={isLoading || success}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      PLZ
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      disabled={isLoading || success}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Stadt
                    </label>
                    <input
                      type="text"
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      disabled={isLoading || success}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bundesland
                    </label>
                    <input
                      type="text"
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      disabled={isLoading || success}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Land
                    </label>
                    <input
                      type="text"
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      disabled={isLoading || success}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              {/* Privacy Settings Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Datenschutz-Einstellungen
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="marketingEmailsConsent"
                      checked={marketingEmailsConsent}
                      onChange={(e) => setMarketingEmailsConsent(e.target.checked)}
                      disabled={isLoading || success}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded disabled:opacity-50"
                    />
                    <label htmlFor="marketingEmailsConsent" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      📧 Marketing-E-Mails Zustimmung
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="dataProcessingConsent"
                      checked={dataProcessingConsent}
                      onChange={(e) => setDataProcessingConsent(e.target.checked)}
                      disabled={isLoading || success}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded disabled:opacity-50"
                    />
                    <label htmlFor="dataProcessingConsent" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Datenverarbeitung Zustimmung (erforderlich)
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="profileVisibilityConsent"
                      checked={profileVisibilityConsent}
                      onChange={(e) => setProfileVisibilityConsent(e.target.checked)}
                      disabled={isLoading || success}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded disabled:opacity-50"
                    />
                    <label htmlFor="profileVisibilityConsent" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      👁️ Profil-Sichtbarkeit (öffentlich sichtbar)
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="dataSharingConsent"
                      checked={dataSharingConsent}
                      onChange={(e) => setDataSharingConsent(e.target.checked)}
                      disabled={isLoading || success}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded disabled:opacity-50"
                    />
                    <label htmlFor="dataSharingConsent" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      🔗 Daten-Sharing mit Dritten
                    </label>
                  </div>
                </div>

                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-4 mb-2">
                  Sichtbarkeit der Kontaktinformationen
                </h4>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showPhoneNumber"
                      checked={showPhoneNumber}
                      onChange={(e) => setShowPhoneNumber(e.target.checked)}
                      disabled={isLoading || success}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded disabled:opacity-50"
                    />
                    <label htmlFor="showPhoneNumber" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Telefonnummer anzeigen
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showMobileNumber"
                      checked={showMobileNumber}
                      onChange={(e) => setShowMobileNumber(e.target.checked)}
                      disabled={isLoading || success}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded disabled:opacity-50"
                    />
                    <label htmlFor="showMobileNumber" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Mobilnummer anzeigen
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showStreet"
                      checked={showStreet}
                      onChange={(e) => setShowStreet(e.target.checked)}
                      disabled={isLoading || success}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded disabled:opacity-50"
                    />
                    <label htmlFor="showStreet" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Straße anzeigen
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showCity"
                      checked={showCity}
                      onChange={(e) => setShowCity(e.target.checked)}
                      disabled={isLoading || success}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded disabled:opacity-50"
                    />
                    <label htmlFor="showCity" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Stadt anzeigen
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading || success}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={isLoading || success}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Wird gespeichert...
                  </>
                ) : (
                  'Speichern'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
