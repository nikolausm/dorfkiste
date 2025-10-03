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
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Zurück zur Startseite
          </Link>
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-3">
            🍪 Cookie-Richtlinie
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Informationen über die Verwendung von Cookies auf Dorfkiste
          </p>
        </div>

        {/* Success Message */}
        {saved && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl animate-scale-in">
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
        <div className="glass-effect rounded-2xl shadow-medium border border-white/20 overflow-hidden mb-8">
          <div className="p-6 sm:p-8 space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                Was sind Cookies?
              </h2>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
                Cookies sind kleine Textdateien, die auf Ihrem Gerät gespeichert werden,
                wenn Sie eine Website besuchen. Sie helfen uns, die Website zu verbessern,
                Ihre Präferenzen zu speichern und Ihnen eine bessere Benutzererfahrung zu
                bieten.
              </p>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                Wir verwenden Cookies in Übereinstimmung mit der Datenschutz-Grundverordnung
                (DSGVO) und anderen geltenden Datenschutzgesetzen. Sie haben die volle
                Kontrolle darüber, welche Cookies Sie akzeptieren möchten.
              </p>
            </section>

            {/* Cookie Categories */}
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
                Cookie-Kategorien
              </h2>

              <div className="space-y-6">
                {/* Essential Cookies */}
                <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 bg-white/50 dark:bg-neutral-800/50">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                        Essenziell
                      </h3>
                      <span className="inline-block px-3 py-1 text-xs font-semibold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                        Immer aktiv
                      </span>
                    </div>
                  </div>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
                    Diese Cookies sind für die grundlegende Funktionalität der Website
                    erforderlich und können nicht deaktiviert werden.
                  </p>
                  <div className="bg-neutral-100 dark:bg-neutral-700/50 rounded-lg p-4">
                    <h4 className="font-semibold text-neutral-900 dark:text-white mb-3">
                      Verwendete Cookies:
                    </h4>
                    <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
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
                <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 bg-white/50 dark:bg-neutral-800/50">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-grow">
                      <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                        Analyse & Statistik
                      </h3>
                    </div>
                    <button
                      onClick={() => handleToggle('analytics')}
                      className={`w-14 h-7 rounded-full flex items-center transition-all duration-200 flex-shrink-0 ${
                        consent.analytics
                          ? 'bg-primary-500 justify-end'
                          : 'bg-neutral-300 dark:bg-neutral-600 justify-start'
                      }`}
                      aria-label="Analytics-Cookies umschalten"
                    >
                      <div className="w-5 h-5 bg-white rounded-full shadow-soft mx-1" />
                    </button>
                  </div>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
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
                <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 bg-white/50 dark:bg-neutral-800/50">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-grow">
                      <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                        Marketing & Werbung
                      </h3>
                    </div>
                    <button
                      onClick={() => handleToggle('marketing')}
                      className={`w-14 h-7 rounded-full flex items-center transition-all duration-200 flex-shrink-0 ${
                        consent.marketing
                          ? 'bg-primary-500 justify-end'
                          : 'bg-neutral-300 dark:bg-neutral-600 justify-start'
                      }`}
                      aria-label="Marketing-Cookies umschalten"
                    >
                      <div className="w-5 h-5 bg-white rounded-full shadow-soft mx-1" />
                    </button>
                  </div>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
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
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                Ihre Rechte
              </h2>
              <div className="space-y-3 text-neutral-700 dark:text-neutral-300">
                <p className="leading-relaxed">
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
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                Kontakt
              </h2>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
                Bei Fragen zu unseren Cookie-Richtlinien oder Datenschutzpraktiken können
                Sie uns jederzeit kontaktieren:
              </p>
              <div className="bg-neutral-100 dark:bg-neutral-700/50 rounded-lg p-4">
                <p className="text-neutral-700 dark:text-neutral-300">
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
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                Weitere Informationen
              </h2>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
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
        </div>

        {/* Cookie Settings Panel */}
        <div className="glass-effect rounded-2xl shadow-medium border border-white/20 overflow-hidden sticky bottom-4">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
            <h3 className="text-xl font-bold text-white">
              Ihre Cookie-Einstellungen verwalten
            </h3>
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleRejectAll}
                className="flex-1 px-6 py-3 rounded-xl border-2 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200"
              >
                Alle ablehnen
              </button>
              <button
                onClick={handleSavePreferences}
                className="flex-1 px-6 py-3 rounded-xl bg-neutral-700 dark:bg-neutral-600 text-white font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-700 transition-all duration-200 shadow-soft"
              >
                Auswahl speichern
              </button>
              <button
                onClick={handleAcceptAll}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-soft hover:shadow-medium"
              >
                Alle akzeptieren
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
