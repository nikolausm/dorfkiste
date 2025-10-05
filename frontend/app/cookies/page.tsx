'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  getStoredConsent,
  saveConsent,
  type CookieConsent,
  acceptAll,
  rejectAll,
} from '@/lib/cookieConsent';

export default function CookiesPage() {
  const [consent, setConsent] = useState<CookieConsent>(() => {
    const stored = getStoredConsent();
    return stored || {
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
  });
  const [saved, setSaved] = useState(false);

  const handleToggle = (category: 'analytics' | 'marketing') => {
    setConsent(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
    setSaved(false);
  };

  const handleSavePreferences = () => {
    saveConsent(consent);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAcceptAll = () => {
    const newConsent = acceptAll();
    setConsent(newConsent);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleRejectAll = () => {
    const newConsent = rejectAll();
    setConsent(newConsent);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          🍪 Cookie-Richtlinie
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Informationen über die Verwendung von Cookies auf Dorfkiste
        </p>
      </div>

      {/* Success Message */}
      {saved && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <p className="text-green-800 dark:text-green-200 font-medium">
              Ihre Cookie-Einstellungen wurden gespeichert
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-6 text-gray-700 dark:text-gray-300 mb-8">
        {/* Introduction */}
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
            Was sind Cookies?
          </h2>
          <p className="mb-4">
                Cookies sind kleine Textdateien, die auf Ihrem Gerät gespeichert werden,
                wenn Sie eine Website besuchen. Sie helfen uns, die Website zu verbessern,
                Ihre Präferenzen zu speichern und Ihnen eine bessere Benutzererfahrung zu
                bieten.
              </p>
          <p>
            Wir verwenden Cookies in Übereinstimmung mit der Datenschutz-Grundverordnung
            (DSGVO) und anderen geltenden Datenschutzgesetzen. Sie haben die volle
            Kontrolle darüber, welche Cookies Sie akzeptieren möchten.
          </p>
        </section>

        {/* Cookie Categories */}
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
            Cookie-Kategorien
          </h2>

          <div className="space-y-6">
            {/* Essential Cookies */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Essenziell
                  </h3>
                  <span className="inline-block px-3 py-1 text-xs font-semibold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                    Immer aktiv
                  </span>
                </div>
              </div>
              <p className="mb-4">
                    Diese Cookies sind für die grundlegende Funktionalität der Website
                    erforderlich und können nicht deaktiviert werden.
                  </p>
              <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Verwendete Cookies:
                </h4>
                <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-primary-600 font-mono">•</span>
                        <div>
                          <strong className="font-medium">dorfkiste_auth_token</strong> -
                          JWT-Token für Authentifizierung (Läuft ab: bei Sitzungsende)
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary-600 font-mono">•</span>
                        <div>
                          <strong className="font-medium">dorfkiste_cookie_consent</strong> -
                          Ihre Cookie-Präferenzen (Läuft ab: 1 Jahr)
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary-600 font-mono">•</span>
                        <div>
                          <strong className="font-medium">XSRF-TOKEN</strong> -
                          Schutz vor Cross-Site Request Forgery (Läuft ab: bei Sitzungsende)
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>

            {/* Analytics Cookies */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Analyse & Statistik
                  </h3>
                </div>
                <button
                  onClick={() => handleToggle('analytics')}
                  className={`w-14 h-7 rounded-full flex items-center transition-all duration-200 flex-shrink-0 ${
                    consent.analytics
                      ? 'bg-primary-500 justify-end'
                      : 'bg-gray-300 dark:bg-gray-600 justify-start'
                  }`}
                  aria-label="Analytics-Cookies umschalten"
                >
                  <div className="w-5 h-5 bg-white rounded-full shadow-soft mx-1" />
                </button>
              </div>
              <p className="mb-4">
                    Diese Cookies helfen uns zu verstehen, wie Besucher mit unserer Website
                    interagieren, indem Informationen anonym gesammelt und gemeldet werden.
                  </p>
                  <div className="bg-neutral-100 dark:bg-neutral-700/50 rounded-lg p-4">
                    <h4 className="font-semibold text-neutral-900 dark:text-white mb-3">
                      Geplante Cookies (derzeit nicht aktiv):
                    </h4>
                    <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
                      <li className="flex items-start gap-2">
                        <span className="text-primary-600 font-mono">•</span>
                        <div>
                          <strong className="font-medium">_ga</strong> -
                          Google Analytics - Unterscheidung von Benutzern (Läuft ab: 2 Jahre)
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary-600 font-mono">•</span>
                        <div>
                          <strong className="font-medium">_gid</strong> -
                          Google Analytics - Unterscheidung von Benutzern (Läuft ab: 24 Stunden)
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary-600 font-mono">•</span>
                        <div>
                          <strong className="font-medium">_gat</strong> -
                          Google Analytics - Drosselung der Anforderungsrate (Läuft ab: 1 Minute)
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>

            {/* Marketing Cookies */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Marketing & Werbung
                  </h3>
                </div>
                <button
                  onClick={() => handleToggle('marketing')}
                  className={`w-14 h-7 rounded-full flex items-center transition-all duration-200 flex-shrink-0 ${
                    consent.marketing
                      ? 'bg-primary-500 justify-end'
                      : 'bg-gray-300 dark:bg-gray-600 justify-start'
                  }`}
                  aria-label="Marketing-Cookies umschalten"
                >
                  <div className="w-5 h-5 bg-white rounded-full shadow-soft mx-1" />
                </button>
              </div>
              <p className="mb-4">
                    Diese Cookies werden verwendet, um Ihnen relevante Werbung und
                    Marketingkampagnen anzuzeigen.
                  </p>
                  <div className="bg-neutral-100 dark:bg-neutral-700/50 rounded-lg p-4">
                    <h4 className="font-semibold text-neutral-900 dark:text-white mb-3">
                      Geplante Cookies (derzeit nicht aktiv):
                    </h4>
                    <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
                      <li className="flex items-start gap-2">
                        <span className="text-primary-600 font-mono">•</span>
                        <div>
                          <strong className="font-medium">_fbp</strong> -
                          Facebook Pixel - Tracking und Remarketing (Läuft ab: 3 Monate)
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary-600 font-mono">•</span>
                        <div>
                          <strong className="font-medium">fr</strong> -
                          Facebook - Werbe-Targeting (Läuft ab: 3 Monate)
                        </div>
                      </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Your Rights */}
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
            Ihre Rechte
          </h2>
          <div className="space-y-3">
            <p>
              Gemäß der DSGVO haben Sie folgende Rechte bezüglich Ihrer Daten:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Recht auf Auskunft:</strong> Sie können Auskunft über die
                gespeicherten personenbezogenen Daten verlangen.
              </li>
              <li>
                <strong>Recht auf Berichtigung:</strong> Sie können die Berichtigung
                unrichtiger Daten verlangen.
              </li>
              <li>
                <strong>Recht auf Löschung:</strong> Sie können die Löschung Ihrer
                Daten verlangen.
              </li>
              <li>
                <strong>Recht auf Widerspruch:</strong> Sie können der Verarbeitung
                Ihrer Daten widersprechen.
              </li>
              <li>
                <strong>Recht auf Datenübertragbarkeit:</strong> Sie können Ihre Daten
                in einem strukturierten Format erhalten.
              </li>
            </ul>
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
            Kontakt
          </h2>
          <p className="mb-4">
                Bei Fragen zu unseren Cookie-Richtlinien oder Datenschutzpraktiken können
                Sie uns jederzeit kontaktieren:
              </p>
          <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-4">
            <p>
              <strong>E-Mail:</strong>{' '}
              <a
                href="mailto:datenschutz@dorfkiste.de"
                className="text-primary-600 hover:text-primary-700 underline"
              >
                datenschutz@dorfkiste.de
              </a>
            </p>
          </div>
        </section>

        {/* Additional Links */}
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
            Weitere Informationen
          </h2>
          <p>
            Weitere Informationen zum Datenschutz finden Sie in unserer{' '}
            <Link
              href="/datenschutz"
              className="text-primary-600 hover:text-primary-700 underline font-medium"
            >
              Datenschutzerklärung
            </Link>
            .
          </p>
        </section>
      </div>

      {/* Cookie Settings Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden sticky bottom-4">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
          <h3 className="text-xl font-bold text-white">
            Ihre Cookie-Einstellungen verwalten
          </h3>
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRejectAll}
              className="flex-1 btn-secondary"
            >
              Alle ablehnen
            </button>
            <button
              onClick={handleSavePreferences}
              className="flex-1 px-6 py-3 rounded-xl bg-gray-700 dark:bg-gray-600 text-white font-semibold hover:bg-gray-800 dark:hover:bg-gray-700 transition-all duration-200"
            >
              Auswahl speichern
            </button>
            <button
              onClick={handleAcceptAll}
              className="flex-1 btn-primary"
            >
              Alle akzeptieren
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
