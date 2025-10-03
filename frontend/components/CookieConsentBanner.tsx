'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getStoredConsent,
  acceptAll,
  rejectAll,
  type CookieConsent,
} from '@/lib/cookieConsent';

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const consent = getStoredConsent();
    if (!consent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    acceptAll();
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleRejectAll = () => {
    rejectAll();
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  // Don't render on server or if consent already given
  if (!mounted || !showBanner) {
    return null;
  }

  return (
    <>
      {/* Banner Overlay */}
      {showBanner && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-fade-in" />
      )}

      {/* Cookie Banner */}
      {showBanner && !showSettings && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 animate-slide-up">
          <div className="max-w-6xl mx-auto glass-effect rounded-2xl shadow-large border border-white/20 overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                {/* Cookie Icon */}
                <div className="flex-shrink-0 hidden sm:block">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-soft">
                    <svg
                      className="w-7 h-7 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                    🍪 Wir verwenden Cookies
                  </h3>
                  <p className="text-gray-800 dark:text-white text-sm sm:text-base leading-relaxed mb-4">
                    Wir verwenden Cookies und ähnliche Technologien, um Ihnen das beste
                    Erlebnis auf unserer Website zu bieten. Einige davon sind essenziell,
                    während andere uns helfen, diese Website und Ihre Erfahrung zu verbessern.
                  </p>
                  <p className="text-gray-700 dark:text-white text-xs sm:text-sm">
                    Weitere Informationen finden Sie in unserer{' '}
                    <Link
                      href="/datenschutz"
                      className="text-primary-700 hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-400 underline font-bold"
                    >
                      Datenschutzerklärung
                    </Link>
                    {' '}und{' '}
                    <Link
                      href="/cookies"
                      className="text-primary-700 hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-400 underline font-bold"
                    >
                      Cookie-Richtlinie
                    </Link>
                    .
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 sm:flex-shrink-0">
                  <button
                    onClick={handleOpenSettings}
                    className="px-6 py-2.5 rounded-xl border-2 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200 whitespace-nowrap"
                  >
                    Einstellungen
                  </button>
                  <button
                    onClick={handleRejectAll}
                    className="px-6 py-2.5 rounded-xl border-2 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200 whitespace-nowrap"
                  >
                    Ablehnen
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-soft hover:shadow-medium whitespace-nowrap"
                  >
                    Alle akzeptieren
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <CookieSettingsModal
          onClose={handleCloseSettings}
          onSave={() => {
            setShowBanner(false);
            setShowSettings(false);
          }}
        />
      )}
    </>
  );
}

interface CookieSettingsModalProps {
  onClose: () => void;
  onSave: () => void;
}

function CookieSettingsModal({ onClose, onSave }: CookieSettingsModalProps) {
  const [consent, setConsent] = useState<CookieConsent>(() => {
    const stored = getStoredConsent();
    return stored || {
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
  });

  const handleToggle = (category: 'analytics' | 'marketing') => {
    setConsent(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleSavePreferences = () => {
    const { saveConsent } = require('@/lib/cookieConsent');
    saveConsent(consent);
    onSave();
  };

  const handleAcceptAll = () => {
    acceptAll();
    onSave();
  };

  const handleRejectAll = () => {
    rejectAll();
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-effect rounded-2xl shadow-large border border-white/20 animate-scale-in">
        <div className="sticky top-0 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-700 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Cookie-Einstellungen
            </h2>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
              aria-label="Schließen"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
            Wir verwenden verschiedene Arten von Cookies. Sie können selbst entscheiden,
            welche Kategorien Sie zulassen möchten. Bitte beachten Sie, dass auf Basis
            Ihrer Einstellungen möglicherweise nicht mehr alle Funktionalitäten der Seite
            zur Verfügung stehen.
          </p>

          {/* Essential Cookies */}
          <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl p-5 bg-white/50 dark:bg-neutral-800/50">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                    Essenziell
                  </h3>
                  <span className="px-2 py-1 text-xs font-semibold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                    Immer aktiv
                  </span>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Diese Cookies sind für die grundlegende Funktionalität der Website
                  erforderlich und können nicht deaktiviert werden. Sie werden
                  normalerweise nur als Reaktion auf Ihre Aktionen gesetzt, wie z.B.
                  Anmeldung, Sicherheitseinstellungen oder Datenschutzpräferenzen.
                </p>
              </div>
              <div className="flex-shrink-0">
                <div className="w-12 h-6 bg-green-500 rounded-full flex items-center justify-end px-1 cursor-not-allowed opacity-50">
                  <div className="w-4 h-4 bg-white rounded-full shadow-soft" />
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Cookies */}
          <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl p-5 bg-white/50 dark:bg-neutral-800/50">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-grow">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                  Analyse & Statistik
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Diese Cookies helfen uns zu verstehen, wie Besucher mit unserer Website
                  interagieren, indem Informationen anonym gesammelt und gemeldet werden.
                  Dies ermöglicht es uns, unsere Website zu verbessern und Ihre Erfahrung
                  zu optimieren.
                </p>
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={() => handleToggle('analytics')}
                  className={`w-12 h-6 rounded-full flex items-center transition-all duration-200 ${
                    consent.analytics
                      ? 'bg-primary-500 justify-end'
                      : 'bg-neutral-300 dark:bg-neutral-600 justify-start'
                  }`}
                  aria-label="Analytics-Cookies umschalten"
                >
                  <div className="w-4 h-4 bg-white rounded-full shadow-soft mx-1" />
                </button>
              </div>
            </div>
          </div>

          {/* Marketing Cookies */}
          <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl p-5 bg-white/50 dark:bg-neutral-800/50">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-grow">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                  Marketing & Werbung
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Diese Cookies werden verwendet, um Ihnen relevante Werbung und
                  Marketingkampagnen anzuzeigen. Sie verfolgen Ihre Aktivitäten auf
                  verschiedenen Websites, um ein Profil Ihrer Interessen zu erstellen und
                  Ihnen relevante Inhalte zu zeigen.
                </p>
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={() => handleToggle('marketing')}
                  className={`w-12 h-6 rounded-full flex items-center transition-all duration-200 ${
                    consent.marketing
                      ? 'bg-primary-500 justify-end'
                      : 'bg-neutral-300 dark:bg-neutral-600 justify-start'
                  }`}
                  aria-label="Marketing-Cookies umschalten"
                >
                  <div className="w-4 h-4 bg-white rounded-full shadow-soft mx-1" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-neutral-100 dark:bg-neutral-800 rounded-xl p-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              💡 <strong>Hinweis:</strong> Sie können Ihre Einstellungen jederzeit in
              unserer{' '}
              <Link
                href="/cookies"
                className="text-primary-600 hover:text-primary-700 underline font-medium"
              >
                Cookie-Richtlinie
              </Link>{' '}
              ändern.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-700 px-6 py-4">
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
  );
}
