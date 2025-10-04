'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';

interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  contactInfo: {
    phoneNumber?: string;
    mobileNumber?: string;
    street?: string;
    city?: string;
    postalCode?: string;
    state?: string;
    country?: string;
  };
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const { user, isLoggedIn, login } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    mobileNumber: '',
    street: '',
    city: '',
    postalCode: '',
    state: '',
    country: '',
  });

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/anmelden');
      return;
    }
    loadProfile();
  }, [isLoggedIn, router]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getProfile();
      setProfile(data);
      
      // Populate form data
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phoneNumber: data.contactInfo?.phoneNumber || '',
        mobileNumber: data.contactInfo?.mobileNumber || '',
        street: data.contactInfo?.street || '',
        city: data.contactInfo?.city || '',
        postalCode: data.contactInfo?.postalCode || '',
        state: data.contactInfo?.state || '',
        country: data.contactInfo?.country || '',
      });
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Fehler beim Laden des Profils']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear messages when user starts typing
    if (errors.length > 0) setErrors([]);
    if (successMessage) setSuccessMessage('');
  };

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!formData.firstName.trim()) {
      newErrors.push('Vorname ist erforderlich');
    }
    if (!formData.lastName.trim()) {
      newErrors.push('Nachname ist erforderlich');
    }

    // Optional validation for contact info
    if (formData.postalCode && !/^\d{5}$/.test(formData.postalCode)) {
      newErrors.push('Postleitzahl muss 5 Ziffern haben');
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSaving(true);
    setErrors([]);

    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        contactInfo: {
          phoneNumber: formData.phoneNumber || null,
          mobileNumber: formData.mobileNumber || null,
          street: formData.street || null,
          city: formData.city || null,
          postalCode: formData.postalCode || null,
          state: formData.state || null,
          country: formData.country || null,
        }
      };

      const updatedProfile = await apiClient.updateProfile(updateData);
      setProfile(updatedProfile);
      setSuccessMessage('Profil erfolgreich aktualisiert!');

      // Update auth context with new user data
      if (user) {
        const updatedUser = {
          ...user,
          firstName: formData.firstName,
          lastName: formData.lastName
        };
        login(localStorage.getItem('token') || '', updatedUser);
      }

    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Fehler beim Speichern des Profils']);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoggedIn) {
    return null; // Will redirect in useEffect
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Profil wird geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Mein Profil
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Verwalten Sie Ihre persönlichen Daten und Kontaktinformationen.
          </p>
        </div>

        {/* Profile Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          {/* Messages */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Bitte korrigieren Sie die folgenden Fehler:
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc list-inside space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    {successMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Kontoinformationen</h3>
              
              <div className="space-y-4">
                {/* Email (read-only) */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    E-Mail-Adresse
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="input-field mt-1 bg-gray-100 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Die E-Mail-Adresse kann nicht geändert werden.
                  </p>
                </div>

                {/* Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      Vorname *
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="input-field mt-1"
                      placeholder="Vorname"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Nachname *
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="input-field mt-1"
                      placeholder="Nachname"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Kontaktdaten</h3>
              
              <div className="space-y-4">
                {/* Phone Numbers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                      Telefonnummer
                    </label>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="input-field mt-1"
                      placeholder="z.B. 089 12345678"
                    />
                  </div>
                  <div>
                    <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">
                      Mobilnummer
                    </label>
                    <input
                      id="mobileNumber"
                      name="mobileNumber"
                      type="tel"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      className="input-field mt-1"
                      placeholder="z.B. 0171 1234567"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                    Straße und Hausnummer
                  </label>
                  <input
                    id="street"
                    name="street"
                    type="text"
                    value={formData.street}
                    onChange={handleChange}
                    className="input-field mt-1"
                    placeholder="z.B. Musterstraße 123"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                      Postleitzahl
                    </label>
                    <input
                      id="postalCode"
                      name="postalCode"
                      type="text"
                      maxLength={5}
                      pattern="[0-9]{5}"
                      value={formData.postalCode}
                      onChange={handleChange}
                      className="input-field mt-1"
                      placeholder="12345"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                      Stadt
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={formData.city}
                      onChange={handleChange}
                      className="input-field mt-1"
                      placeholder="z.B. München"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                      Bundesland
                    </label>
                    <input
                      id="state"
                      name="state"
                      type="text"
                      value={formData.state}
                      onChange={handleChange}
                      className="input-field mt-1"
                      placeholder="z.B. Bayern"
                    />
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                      Land
                    </label>
                    <input
                      id="country"
                      name="country"
                      type="text"
                      value={formData.country}
                      onChange={handleChange}
                      className="input-field mt-1"
                      placeholder="Deutschland"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <button
                type="submit"
                disabled={isSaving}
                className={`btn-primary ${
                  isSaving ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSaving ? 'Wird gespeichert...' : 'Profil speichern'}
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">💡 Hinweis zur Datensicherheit</h4>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            Ihre Kontaktdaten werden nur registrierten Nutzern angezeigt, wenn diese Interesse an Ihren Angeboten haben.
            Sie können jederzeit entscheiden, welche Informationen Sie preisgeben möchten.
          </p>
        </div>
      </div>
    </div>
  );
}