'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { apiClient, OfferDetail } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import MessageModal from '@/components/MessageModal';
import BookingModal from '@/components/BookingModal';
import OfferBookingCalendar from '@/components/OfferBookingCalendar';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import ShareButton from '@/components/ShareButton';
import ReportOfferModal from '@/components/ReportOfferModal';

export default function OfferDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const [offer, setOffer] = useState<OfferDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [preselectedDates, setPreselectedDates] = useState<{startDate: string, endDate: string} | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const handleNextImage = () => {
    if (offer?.pictures && offer.pictures.length > 1) {
      setSelectedImageIndex((prev) => (prev + 1) % offer.pictures.length);
    }
  };

  const handlePrevImage = () => {
    if (offer?.pictures && offer.pictures.length > 1) {
      setSelectedImageIndex((prev) => prev === 0 ? offer.pictures.length - 1 : prev - 1);
    }
  };

  const handleKeyDown = (e: any) => {
    if (offer?.pictures && offer.pictures.length > 1) {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextImage();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevImage();
      }
    }
  };

  const offerId = params.id as string;

  useEffect(() => {
    if (offerId) {
      loadOffer(parseInt(offerId));
    }
  }, [offerId]);

  useEffect(() => {
    if (offer?.pictures && offer.pictures.length > 1) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [offer?.pictures]);

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

  const formatPrice = (offer: OfferDetail) => {
    if (offer.isForSale) {
      return offer.salePrice ? `${offer.salePrice.toFixed(2)}€` : 'Preis auf Anfrage';
    } else if (offer.isService) {
      return offer.pricePerHour ? `${offer.pricePerHour.toFixed(2)}€ pro Stunde` : 'Preis auf Anfrage';
    } else {
      return offer.pricePerDay ? `${offer.pricePerDay.toFixed(2)}€ pro Tag` : 'Preis auf Anfrage';
    }
  };

  const getCategoryIcon = (iconName: string) => {
    const icons: { [key: string]: string } = {
      tools: '🔧',
      garden: '🌿',
      home: '🏠',
      sport: '🚴',
      transport: '🚚',
      electronics: '📱',
      services: '⚒️',
      landscaping: '🌱',
      cleaning: '🧽',
      other: '📦'
    };
    return icons[iconName] || '📦';
  };

  const handleSendMessage = () => {
    if (!isLoggedIn) {
      // Redirect to contact page if not logged in
      router.push(`/angebote/${offer?.id}/kontakt`);
      return;
    }

    // Prevent sending messages to yourself
    if (offer && user && offer.user?.id === user.id) {
      return;
    }

    setIsMessageModalOpen(true);
  };

  const handleMessageSent = () => {
    // After message is sent, navigate to conversation page
    if (offer && offer.user) {
      router.push(`/nachrichten/${offer.user.id}/${offer.id}`);
    }
  };

  const handleBookNow = (startDate?: string, endDate?: string) => {
    if (!isLoggedIn) {
      router.push('/anmelden?redirect=' + encodeURIComponent(`/angebote/${offer?.id}`));
      return;
    }

    if (offer && user && offer.user?.id === user.id) {
      return;
    }

    // Store preselected dates if provided
    if (startDate && endDate) {
      setPreselectedDates({ startDate, endDate });
    } else {
      setPreselectedDates(null);
    }

    setIsBookingModalOpen(true);
  };

  const handleBookingSuccess = () => {
    setIsBookingModalOpen(false);
    // Show success message or redirect
    router.push('/meine-buchungen');
  };

  const handleDeleteOffer = () => {
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!offer) return;

    try {
      await apiClient.deleteOffer(offer.id);
      router.push('/meine-angebote');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen des Angebots');
    }
  };

  const isOwnOffer = offer && user && offer.user?.id === user.id;

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
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <li><Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400">Startseite</Link></li>
          <li>›</li>
          {offer.category ? (
            <li>
              <Link
                href={`/angebote?categoryId=${offer.category.id}`}
                className="hover:text-primary-600 dark:hover:text-primary-400"
              >
                {offer.category.name}
              </Link>
            </li>
          ) : (
            <li><Link href="/angebote" className="hover:text-primary-600 dark:hover:text-primary-400">Angebote</Link></li>
          )}
          <li>›</li>
          <li className="text-gray-900 dark:text-gray-100">{offer.title}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {offer.title}
                </h1>
                {offer.category && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <span className="mr-2">{getCategoryIcon(offer.category.iconName)}</span>
                    <span>{offer.category.name}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 ml-4">
                {offer.isService && (
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                    Service
                  </span>
                )}
                <ShareButton title={offer.title} />
              </div>
            </div>

            {/* Price */}
            <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {formatPrice(offer)}
              </div>
            </div>

            {/* Image Gallery */}
            {offer.pictures && offer.pictures.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">Bilder</h2>
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden group">
                    {offer.pictures[selectedImageIndex]?.id ? (
                      <Image
                        src={apiClient.getPictureUrl(offer.pictures[selectedImageIndex].id)}
                        alt={`${offer.title} - Bild ${selectedImageIndex + 1}`}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          console.error('Error loading image:', e);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-4xl">📷</span>
                      </div>
                    )}
                    
                    {/* Navigation Buttons */}
                    {offer.pictures.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Vorheriges Bild"
                        >
                          ‹
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Nächstes Bild"
                        >
                          ›
                        </button>
                      </>
                    )}
                  </div>
                  
                  {/* Thumbnail Row */}
                  {offer.pictures.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {offer.pictures.map((picture, index) => (
                        <button
                          key={picture.id}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                            index === selectedImageIndex
                              ? 'border-primary-500 dark:border-primary-400'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                        >
                          {picture?.id ? (
                            <Image
                              src={apiClient.getPictureUrl(picture.id)}
                              alt={`${offer.title} - Vorschau ${index + 1}`}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                console.error('Error loading thumbnail:', e);
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <span className="text-sm">📷</span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Image Counter and Navigation Help */}
                  {offer.pictures.length > 1 && (
                    <div className="text-center space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Bild {selectedImageIndex + 1} von {offer.pictures.length}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Verwenden Sie die Pfeiltasten ← → oder klicken Sie auf die Navigationsbuttons
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">Beschreibung</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {offer.description}
              </p>
            </div>

            {/* Details */}
            <div className="border-t dark:border-gray-700 pt-6">
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">Details</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Typ:</span>
                  <span className="ml-2 text-gray-900 dark:text-gray-100">
                    {offer.isService ? 'Dienstleistung' : 'Gegenstand'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Erstellt:</span>
                  <span className="ml-2 text-gray-900 dark:text-gray-100">
                    {new Date(offer.createdAt).toLocaleDateString('de-DE')}
                  </span>
                </div>
                {offer.category && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Kategorie:</span>
                    <span className="ml-2 text-gray-900 dark:text-gray-100">{offer.category.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 order-1 lg:order-2">
          {/* Booking Calendar - only for rental/service offers */}
          {!offer.isForSale && (
            <div className="mb-6">
              <OfferBookingCalendar
                offerId={offer.id}
                offerPrice={{
                  pricePerDay: offer.pricePerDay || undefined,
                  pricePerHour: offer.pricePerHour || undefined,
                }}
                isService={offer.isService}
                onBookingRequest={isOwnOffer ? undefined : handleBookNow}
                className="lg:block"
                compact={true}
              />
            </div>
          )}

          {/* Contact Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Anbieter kontaktieren</h3>

            {offer.user && (
              <div className="mb-4">
                <p className="text-gray-900 dark:text-gray-100 font-medium">
                  {offer.user.firstName} {offer.user.lastName}
                </p>
              </div>
            )}

            {/* Contact information (only shown to logged-in users) */}
            {offer.user?.contactInfo && (
              <div className="space-y-2 text-sm">
                {offer.user.contactInfo.mobileNumber && (
                  <div className="flex items-center">
                    <span className="text-gray-500 dark:text-gray-400 w-20">Mobil:</span>
                    <a
                      href={`tel:${offer.user.contactInfo.mobileNumber}`}
                      className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                    >
                      {offer.user.contactInfo.mobileNumber}
                    </a>
                  </div>
                )}
                {offer.user.contactInfo.phoneNumber && (
                  <div className="flex items-center">
                    <span className="text-gray-500 dark:text-gray-400 w-20">Telefon:</span>
                    <a
                      href={`tel:${offer.user.contactInfo.phoneNumber}`}
                      className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                    >
                      {offer.user.contactInfo.phoneNumber}
                    </a>
                  </div>
                )}
                {offer.user.contactInfo.city && (
                  <div className="flex items-center">
                    <span className="text-gray-500 dark:text-gray-400 w-20">Ort:</span>
                    <span className="text-gray-900 dark:text-gray-100">
                      {offer.user.contactInfo.postalCode} {offer.user.contactInfo.city}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6">
              {isOwnOffer ? (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <span className="text-green-600 dark:text-green-400 text-lg">👤</span>
                    </div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                      Ihr Angebot
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      Status: {offer.isActive ? 'Aktiv und sichtbar' : 'Deaktiviert'}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Link
                      href={`/angebote/${offer.id}/bearbeiten`}
                      className="w-full btn-primary text-center block py-3 px-4"
                    >
                      Angebot bearbeiten
                    </Link>
                    <Link
                      href="/meine-angebote"
                      className="w-full btn-secondary text-center block py-3 px-4"
                    >
                      Alle meine Angebote
                    </Link>
                    <Link
                      href="/meine-buchungen?tab=provider"
                      className="w-full btn-outline text-center block py-3 px-4"
                    >
                      Buchungen verwalten
                    </Link>
                    <button
                      onClick={handleDeleteOffer}
                      className="w-full btn-outline border-dashed !border-red-300 dark:!border-red-700 !text-red-600 dark:!text-red-400 hover:!border-red-500 dark:hover:!border-red-500 hover:!bg-red-50 dark:hover:!bg-red-900/20 text-center py-3 px-4"
                    >
                      🗑️ Angebot löschen
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* For sale offers: only message button */}
                  {/* For rental/service offers: booking + message button */}
                  {!offer.isForSale && (
                    <button
                      onClick={() => handleBookNow()}
                      className="w-full btn-primary py-3 px-4"
                    >
                      {isLoggedIn ? 'Jetzt buchen' : 'Anmelden & Buchen'}
                    </button>
                  )}
                  <button
                    onClick={handleSendMessage}
                    className={`w-full py-3 px-4 ${offer.isForSale ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {isLoggedIn ? 'Nachricht senden' : 'Anmelden & Nachricht senden'}
                  </button>
                  {isLoggedIn && (
                    <button
                      onClick={() => setIsReportModalOpen(true)}
                      className="w-full py-2 px-4 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 transition-colors"
                    >
                      🚨 Angebot melden
                    </button>
                  )}
                </div>
              )}
            </div>

            <p className="text-xs text-neutral-500 dark:text-gray-400 mt-3 text-center">
              {isLoggedIn
                ? 'Kontaktdaten sind nur für angemeldete Nutzer sichtbar'
                : 'Melden Sie sich an, um Kontaktdaten zu sehen und Nachrichten zu senden'
              }
            </p>
          </div>

          {/* Tips */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">💡 Sicherheitstipp</h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Treffen Sie sich an öffentlichen Orten und prüfen Sie die Gegenstände vor der Übergabe.
              Bei Dienstleistungen sprechen Sie vorher alle Details ab.
            </p>
          </div>
        </div>
      </div>

      {/* Message Modal */}
      {offer && offer.user && !isOwnOffer && (
        <MessageModal
          isOpen={isMessageModalOpen}
          onClose={() => setIsMessageModalOpen(false)}
          recipientId={offer.user.id}
          recipientName={`${offer.user.firstName} ${offer.user.lastName}`}
          offerId={offer.id}
          offerTitle={offer.title}
          onMessageSent={handleMessageSent}
        />
      )}

      {/* Booking Modal */}
      {offer && !isOwnOffer && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          offerId={offer.id}
          offerTitle={offer.title}
          offerPrice={{
            pricePerDay: offer.pricePerDay || undefined,
            pricePerHour: offer.pricePerHour || undefined,
          }}
          isService={offer.isService}
          onBookingSuccess={handleBookingSuccess}
          preselectedDates={preselectedDates || undefined}
        />
      )}

      {/* Delete Confirmation Modal */}
      {offer && (
        <ConfirmDeleteModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Angebot löschen"
          message={`Möchten Sie das Angebot "${offer.title}" wirklich löschen?`}
        />
      )}

      {/* Report Offer Modal */}
      {offer && !isOwnOffer && (
        <ReportOfferModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          offerId={offer.id}
          offerTitle={offer.title}
        />
      )}
    </div>
  );
}