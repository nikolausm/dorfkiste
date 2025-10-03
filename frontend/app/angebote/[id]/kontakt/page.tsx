'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { apiClient, OfferDetail } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function ContactOfferPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoggedIn, login } = useAuth();
  const [offer, setOffer] = useState<OfferDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  const [loginErrors, setLoginErrors] = useState<string[]>([]);
  const [isLoggingIn, setIsLoggingIn] = useState(false);


  const offerId = params.id as string;

  useEffect(() => {
    if (offerId) {
      loadOffer(parseInt(offerId));
    }
  }, [offerId]);

  useEffect(() => {
    if (isLoggedIn && offer?.user?.id) {
      // Prevent sending messages to yourself - redirect back to offer page instead
      if (user && offer.user.id === user.id) {
        router.push(`/angebote/${offer.id}`);
        return;
      }
      // If user is already logged in and offer is loaded, redirect to messaging
      router.push(`/nachrichten/${offer.user.id}/${offer.id}`);
    }
  }, [isLoggedIn, offer?.user?.id, offer?.id, router, user]);

  const loadOffer = async (id: number) => {
    try {
      setIsLoading(true);
      const data = await apiClient.getOffer(id);
      setOffer(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden des Angebots');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
    if (loginErrors.length > 0) setLoginErrors([]);
  };


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginErrors([]);

    try {
      const response = await apiClient.login({
        email: loginData.email,
        password: loginData.password,
      });

      login(response.token, response.user);
      // Will be redirected by useEffect
    } catch (error) {
      setLoginErrors([error instanceof Error ? error.message : 'Anmeldung fehlgeschlagen']);
    } finally {
      setIsLoggingIn(false);
    }
  };


  const formatPrice = (offer: OfferDetail) => {
    if (offer.isService) {
      return offer.pricePerHour ? `${offer.pricePerHour.toFixed(2)}€ pro Stunde` : 'Preis auf Anfrage';
    } else {
      return offer.pricePerDay ? `${offer.pricePerDay.toFixed(2)}€ pro Tag` : 'Preis auf Anfrage';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Angebot wird geladen...</p>
        </div>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error || 'Angebot nicht gefunden'}</p>
          <Link href="/angebote" className="btn-primary mt-4 inline-block">
            Zurück zu den Angeboten
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link
              href={`/angebote/${offer.id}`}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
            >
              ← Zurück zum Angebot
            </Link>
          </div>
        </div>
      </div>

      {/* Offer Context */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-start space-x-4">
            {offer.pictures && offer.pictures.length > 0 && offer.pictures[0]?.id ? (
              <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
                <Image
                  src={apiClient.getPictureUrl(offer.pictures[0].id)}
                  alt={offer.title}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-2xl">📷</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 mb-1 truncate">
                {offer.title}
              </h1>
              <p className="text-lg font-semibold text-primary-600 mb-2">
                {formatPrice(offer)}
              </p>
              <p className="text-sm text-gray-600">
                Angeboten von {offer.user?.firstName} {offer.user?.lastName}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Anbieter kontaktieren
          </h2>
          <p className="text-gray-600">
            Melden Sie sich an oder registrieren Sie sich, um eine Nachricht zu senden
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Registration Call-to-Action */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">🆕</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Neuer Benutzer?
              </h3>
              <p className="text-gray-600 text-lg mb-8">
                Erstellen Sie ein kostenloses Konto, um mit anderen Benutzern zu kommunizieren und eigene Angebote zu erstellen.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-4 text-lg">✓</span>
                  <span className="font-medium">Kostenlose Registrierung</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-4 text-lg">✓</span>
                  <span className="font-medium">Sofortiger Zugang zum Nachrichtensystem</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-4 text-lg">✓</span>
                  <span className="font-medium">Eigene Angebote erstellen und verwalten</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-4 text-lg">✓</span>
                  <span className="font-medium">Sicher und datenschutzkonform</span>
                </div>
              </div>

              <div className="space-y-4">
                <Link
                  href="/registrieren"
                  className="w-full btn-primary text-center font-semibold py-3 text-lg"
                >
                  Kostenloses Konto erstellen
                </Link>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">oder</span>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">
                    Die Registrierung dauert nur 2 Minuten
                  </p>
                  <div className="inline-flex items-center text-xs text-gray-500">
                    <span className="mr-1">🛡️</span>
                    Ihre Daten sind sicher und werden nicht weitergegeben
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Login Side */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-xl">👤</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Bereits registriert?
              </h3>
              <p className="text-gray-600 text-sm">
                Melden Sie sich mit Ihren bestehenden Zugangsdaten an, um sofort loszulegen.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {loginErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="text-sm text-red-700">
                    <ul className="list-disc list-inside space-y-1">
                      {loginErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="loginEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  E-Mail-Adresse
                </label>
                <input
                  id="loginEmail"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={loginData.email}
                  onChange={handleLoginChange}
                  className="input-field"
                  placeholder="max.mustermann@example.com"
                />
              </div>

              <div>
                <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Passwort
                </label>
                <input
                  id="loginPassword"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={loginData.password}
                  onChange={handleLoginChange}
                  className="input-field"
                  placeholder="Ihr Passwort"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className={`w-full btn-primary ${
                  isLoggingIn ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoggingIn ? 'Wird angemeldet...' : 'Anmelden & Nachricht senden'}
              </button>
            </form>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Testbenutzer:</strong>
              </p>
              <p className="text-xs text-gray-500">
                E-Mail: max.mustermann@test.de<br />
                Passwort: Test123!
              </p>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-center mb-3">
              <span className="text-blue-600 text-2xl">💬</span>
            </div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Warum registrieren?
            </h3>
            <p className="text-sm text-blue-800">
              Die Registrierung ermöglicht es uns, sicherzustellen, dass alle Nachrichten von echten Personen stammen.
              Dies schützt unsere Community vor Spam und sorgt für vertrauensvolle Kommunikation zwischen Nachbarn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}