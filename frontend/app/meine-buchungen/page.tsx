'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient, BookingResponse } from '@/lib/api';
import OfferThumbnail from '@/components/OfferThumbnail';

// Using BookingResponse interface from API client

function BookingsContent() {
  const { user, isLoggedIn } = useAuth();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'customer' | 'provider'>('customer');
  const [customerBookings, setCustomerBookings] = useState<BookingResponse[]>([]);
  const [providerBookings, setProviderBookings] = useState<BookingResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingBookingId, setCancellingBookingId] = useState<number | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'provider') {
      setActiveTab('provider');
    }
  }, [searchParams]);

  useEffect(() => {
    if (isLoggedIn) {
      loadBookings();
    }
  }, [isLoggedIn, activeTab]);

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = activeTab === 'customer'
        ? await apiClient.getMyBookings()
        : await apiClient.getMyServiceBookings();

      if (activeTab === 'customer') {
        setCustomerBookings(data);
      } else {
        setProviderBookings(data);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Fehler beim Laden der Buchungen');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = (bookingId: number) => {
    setCancellingBookingId(bookingId);
    setShowCancelModal(true);
  };

  const confirmCancelBooking = async () => {
    if (!cancellingBookingId) return;

    try {
      setIsLoading(true);
      await apiClient.cancelBooking(cancellingBookingId, cancelReason || undefined);

      // Reload bookings to reflect the cancellation
      await loadBookings();

      // Close modal and reset state
      setShowCancelModal(false);
      setCancellingBookingId(null);
      setCancelReason('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Fehler beim Stornieren der Buchung');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelCancellation = () => {
    setShowCancelModal(false);
    setCancellingBookingId(null);
    setCancelReason('');
  };



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'Bestätigt';
      case 'Completed':
        return 'Abgeschlossen';
      case 'Cancelled':
        return 'Storniert';
      default:
        return status;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Meine Buchungen
          </h1>
          <p className="text-gray-600 mb-6">
            Sie müssen angemeldet sein, um Ihre Buchungen zu sehen.
          </p>
          <Link href="/anmelden" className="btn-primary">
            Jetzt anmelden
          </Link>
        </div>
      </div>
    );
  }

  const currentBookings = activeTab === 'customer' ? customerBookings : providerBookings;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Meine Buchungen
        </h1>
        <p className="text-gray-600">
          Verwalten Sie Ihre Buchungen und Buchungsanfragen
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('customer')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'customer'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Meine Buchungen
              {customerBookings.length > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {customerBookings.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('provider')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'provider'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Erhaltene Buchungen
              {providerBookings.length > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {providerBookings.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Buchungen werden geladen...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadBookings}
            className="mt-4 btn-secondary"
          >
            Erneut versuchen
          </button>
        </div>
      ) : currentBookings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'customer' ? 'Keine Buchungen vorhanden' : 'Keine Buchungsanfragen erhalten'}
          </h3>
          <p className="text-gray-600 mb-6">
            {activeTab === 'customer'
              ? 'Sie haben noch keine Buchungen vorgenommen.'
              : 'Sie haben noch keine Buchungsanfragen für Ihre Angebote erhalten.'
            }
          </p>
          <Link
            href={activeTab === 'customer' ? '/angebote' : '/meine-angebote'}
            className="btn-primary"
          >
            {activeTab === 'customer' ? 'Angebote durchsuchen' : 'Meine Angebote verwalten'}
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {currentBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start gap-4 mb-4">
                {/* Thumbnail Image */}
                <div className="flex-shrink-0">
                  <OfferThumbnail
                    offer={{
                      id: booking.offer.id,
                      title: booking.offer.title,
                      isService: booking.offer.isService,
                      firstPicture: booking.offer.firstPicture
                    }}
                    size="medium"
                    isInactive={!booking.offer.isActive}
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {booking.offer.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    {activeTab === 'customer'
                      ? `Anbieter: ${booking.offer.provider.firstName} ${booking.offer.provider.lastName}`
                      : `Kunde: ${booking.customer.firstName} ${booking.customer.lastName}`
                    }
                  </p>
                  <div className="text-sm text-gray-500">
                    Buchungs-ID: #{booking.id}
                  </div>
                </div>

                <div className="flex-shrink-0 text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {booking.totalPrice.toFixed(2)}€
                  </div>
                  <div className="text-sm text-gray-500">
                    {booking.daysCount} Tag(e)
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Zeitraum
                  </div>
                  <div className="text-sm text-gray-900">
                    {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Erstellt
                  </div>
                  <div className="text-sm text-gray-900">
                    {formatDateTime(booking.createdAt)}
                  </div>
                </div>
                {booking.confirmedAt && (
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Bestätigt
                    </div>
                    <div className="text-sm text-gray-900">
                      {formatDateTime(booking.confirmedAt)}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/angebote/${booking.offer.id}`}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Angebot ansehen
                  </Link>
                  {activeTab === 'customer' && (
                    <Link
                      href={`/nachrichten/${booking.offer.provider.id}/${booking.offer.id}`}
                      className="text-gray-600 hover:text-gray-700 text-sm"
                    >
                      Nachricht senden
                    </Link>
                  )}
                  {activeTab === 'provider' && (
                    <Link
                      href={`/nachrichten/${booking.customer.id}/${booking.offer.id}`}
                      className="text-gray-600 hover:text-gray-700 text-sm"
                    >
                      Nachricht senden
                    </Link>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {activeTab === 'provider' && booking.status === 'Confirmed' && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Buchung stornieren
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Buchung stornieren
              </h3>
              <p className="text-gray-600 mb-4">
                Sind Sie sicher, dass Sie diese Buchung stornieren möchten? Der Kunde wird automatisch benachrichtigt und die Termine werden wieder verfügbar.
              </p>

              <div className="mb-4">
                <label htmlFor="cancelReason" className="block text-sm font-medium text-gray-700 mb-2">
                  Begründung (optional):
                </label>
                <textarea
                  id="cancelReason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="z.B. Wartung erforderlich, Ausfall des Geräts..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelCancellation}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Abbrechen
                </button>
                <button
                  onClick={confirmCancelBooking}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {isLoading ? 'Wird storniert...' : 'Stornieren'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Buchungen werden geladen...</p>
        </div>
      </div>
    }>
      <BookingsContent />
    </Suspense>
  );
}