'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import OfferThumbnail from '@/components/OfferThumbnail';
import { apiClient, BookingResponse } from '@/lib/api';

export default function Home() {
  const [recentBookings, setRecentBookings] = useState<BookingResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecentBookings();
  }, []);

  const loadRecentBookings = async () => {
    try {
      const bookings = await apiClient.getRecentCompletedBookings(6);
      setRecentBookings(bookings);
    } catch (error) {
      console.error('Fehler beim Laden der letzten Verleihungen:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient pt-20 pb-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-5xl lg:text-7xl font-bold text-neutral-900 dark:text-gray-100 mb-6 leading-tight">
              Willkommen bei{' '}
              <span className="gradient-text">Dorfkiste</span>
            </h1>
            <p className="text-xl lg:text-2xl text-neutral-600 dark:text-gray-400 max-w-4xl mx-auto mb-12 leading-relaxed">
              Verleihe und finde alles was du brauchst in deiner Nachbarschaft.
              Von Werkzeugen bis zu Dienstleistungen - hier findest du es!
            </p>
            
            <div className="mb-16 max-w-2xl mx-auto">
              <SearchBar />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/angebote" className="btn-primary text-lg px-8 py-4">
                Angebote durchsuchen
              </Link>
              <Link href="/registrieren" className="btn-secondary text-lg px-8 py-4">
                Kostenlos registrieren
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Rentals Section */}
      {!isLoading && recentBookings.length > 0 && (
        <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-gray-100 mb-4">
                Letzte erfolgreiche Verleihungen
              </h2>
              <p className="text-xl text-neutral-600 dark:text-gray-400 max-w-3xl mx-auto">
                Diese Gegenstände und Dienstleistungen wurden kürzlich erfolgreich verliehen
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentBookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/angebote/${booking.offer.id}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <OfferThumbnail
                        offer={booking.offer.firstPicture ? {
                          id: booking.offer.id,
                          title: booking.offer.title,
                          firstPicture: {
                            id: booking.offer.firstPicture.id,
                            fileName: booking.offer.firstPicture.fileName,
                            contentType: booking.offer.firstPicture.contentType,
                            displayOrder: booking.offer.firstPicture.displayOrder
                          },
                          isService: booking.offer.isService
                        } : null}
                        size="medium"
                        isInactive={!booking.offer.isActive}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate mb-1">
                        {booking.offer.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {booking.daysCount} Tag{booking.daysCount !== 1 ? 'e' : ''} • {booking.totalPrice.toFixed(2)} €
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Verliehen von {booking.offer.provider.firstName}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="feature-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-gray-100 mb-4">
              Entdecke unsere Kategorien
            </h2>
            <p className="text-xl text-neutral-600 dark:text-gray-400 max-w-3xl mx-auto">
              Von Heimwerker-Tools bis zu professionellen Dienstleistungen -
              finde genau das, was du suchst
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            <Link href="/angebote?categoryId=1" className="category-card card-hover animate-slide-up group">
              <div className="relative z-10">
                <div className="text-4xl mb-4">🔧</div>
                <h3 className="text-xl font-bold mb-3 text-neutral-900 dark:text-gray-100">Werkzeuge & Geräte</h3>
                <p className="text-neutral-600 dark:text-gray-400 leading-relaxed">
                  Bohrmaschinen, Sägen und mehr für deine Heimwerkerprojekte
                </p>
              </div>
            </Link>

            <Link href="/angebote?categoryId=2" className="category-card card-hover animate-slide-up group" style={{animationDelay: '0.1s'}}>
              <div className="relative z-10">
                <div className="text-4xl mb-4">🌿</div>
                <h3 className="text-xl font-bold mb-3 text-neutral-900 dark:text-gray-100">Gartengeräte</h3>
                <p className="text-neutral-600 dark:text-gray-400 leading-relaxed">
                  Rasenmäher, Heckenscheren für einen perfekten Garten
                </p>
              </div>
            </Link>

            <Link href="/angebote?categoryId=3" className="category-card card-hover animate-slide-up group" style={{animationDelay: '0.2s'}}>
              <div className="relative z-10">
                <div className="text-4xl mb-4">🏠</div>
                <h3 className="text-xl font-bold mb-3 text-neutral-900 dark:text-gray-100">Haushaltsgeräte</h3>
                <p className="text-neutral-600 dark:text-gray-400 leading-relaxed">
                  Küchengeräte und Reinigungsgeräte für den Haushalt
                </p>
              </div>
            </Link>

            <Link href="/angebote?categoryId=4" className="category-card card-hover animate-slide-up group" style={{animationDelay: '0.3s'}}>
              <div className="relative z-10">
                <div className="text-4xl mb-4">🚴</div>
                <h3 className="text-xl font-bold mb-3 text-neutral-900 dark:text-gray-100">Sport & Freizeit</h3>
                <p className="text-neutral-600 dark:text-gray-400 leading-relaxed">
                  Sportgeräte, Fahrräder und Campingausrüstung
                </p>
              </div>
            </Link>

            <Link href="/angebote?categoryId=5" className="category-card card-hover animate-slide-up group" style={{animationDelay: '0.4s'}}>
              <div className="relative z-10">
                <div className="text-4xl mb-4">🚚</div>
                <h3 className="text-xl font-bold mb-3 text-neutral-900 dark:text-gray-100">Transport & Umzug</h3>
                <p className="text-neutral-600 dark:text-gray-400 leading-relaxed">
                  Anhänger, Transportboxen und Umzugshilfen
                </p>
              </div>
            </Link>

            <Link href="/angebote?categoryId=7" className="category-card card-hover animate-slide-up group" style={{animationDelay: '0.5s'}}>
              <div className="relative z-10">
                <div className="text-4xl mb-4">⚒️</div>
                <h3 className="text-xl font-bold mb-3 text-neutral-900 dark:text-gray-100">Handwerksdienste</h3>
                <p className="text-neutral-600 dark:text-gray-400 leading-relaxed">
                  Professionelle Hilfe für Reparaturen und Renovierungen
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white dark:bg-gray-800">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft group-hover:shadow-medium transition-all duration-300 transform group-hover:scale-110">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-neutral-900 dark:text-gray-100">Lokal & Nachbarschaftlich</h3>
              <p className="text-neutral-600 dark:text-gray-400 leading-relaxed">
                Entdecke Angebote in deiner unmittelbaren Umgebung und baue Verbindungen zu deinen Nachbarn auf.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft group-hover:shadow-medium transition-all duration-300 transform group-hover:scale-110">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-neutral-900 dark:text-gray-100">Sicher & Vertrauensvoll</h3>
              <p className="text-neutral-600 dark:text-gray-400 leading-relaxed">
                Bewertungssystem und verifizierte Profile sorgen für eine sichere und vertrauensvolle Gemeinschaft.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft group-hover:shadow-medium transition-all duration-300 transform group-hover:scale-110">
                <svg className="w-8 h-8 text-neutral-900 dark:text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-neutral-900 dark:text-gray-100">Einfach & Schnell</h3>
              <p className="text-neutral-600 dark:text-gray-400 leading-relaxed">
                Finde und verleihe Gegenstände mit wenigen Klicks. Keine komplizierten Prozesse - einfach und intuitiv.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}