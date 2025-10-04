'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient, Offer } from '@/lib/api';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';

export default function MyOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<{ id: number; title: string } | null>(null);
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/anmelden');
      return;
    }
    loadMyOffers();
  }, [isLoggedIn, router]);

  const loadMyOffers = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getMyOffers();
      setOffers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden Ihrer Angebote');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOfferActive = async (offerId: number) => {
    try {
      const updatedOffer = await apiClient.toggleOfferActive(offerId);
      setOffers(prevOffers =>
        prevOffers.map(offer =>
          offer.id === offerId ? { ...offer, isActive: updatedOffer.isActive } : offer
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Ändern des Angebotsstatus');
    }
  };

  const deleteOffer = async (offerId: number, offerTitle: string) => {
    setOfferToDelete({ id: offerId, title: offerTitle });
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!offerToDelete) return;

    try {
      await apiClient.deleteOffer(offerToDelete.id);
      setOffers(prevOffers => prevOffers.filter(offer => offer.id !== offerToDelete.id));
      setOfferToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen des Angebots');
    }
  };

  const formatPrice = (offer: Offer) => {
    if (offer.isForSale) {
      return offer.salePrice ? `${offer.salePrice.toFixed(2)}€` : 'Preis auf Anfrage';
    } else if (offer.isService) {
      return offer.pricePerHour ? `${offer.pricePerHour.toFixed(2)}€/Std` : 'Preis auf Anfrage';
    } else {
      return offer.pricePerDay ? `${offer.pricePerDay.toFixed(2)}€/Tag` : 'Preis auf Anfrage';
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

  if (!isLoggedIn) {
    return null; // Will redirect in useEffect
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Angebote werden geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Meine Angebote
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Verwalten Sie Ihre veröffentlichten Angebote und Dienstleistungen.
            </p>
          </div>
          <Link
            href="/angebot-erstellen"
            className="btn-primary"
          >
            Neues Angebot erstellen
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Offers List */}
      {offers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Noch keine Angebote erstellt
          </h3>
          <p className="text-gray-500 mb-6">
            Erstellen Sie Ihr erstes Angebot und teilen Sie es mit Ihrer Nachbarschaft.
          </p>
          <Link
            href="/angebot-erstellen"
            className="btn-primary"
          >
            Erstes Angebot erstellen
          </Link>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="mb-6 p-4 bg-primary-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-600 dark:text-primary-400">Gesamt</p>
                <p className="text-2xl font-bold text-primary-700 dark:text-primary-300">{offers.length}</p>
              </div>
              <div>
                <p className="text-sm text-primary-600 dark:text-primary-400">Aktive Angebote</p>
                <p className="text-2xl font-bold text-primary-700 dark:text-primary-300">
                  {offers.filter(offer => offer.isActive).length}
                </p>
              </div>
              <div>
                <p className="text-sm text-primary-600 dark:text-primary-400">Dienstleistungen</p>
                <p className="text-2xl font-bold text-primary-700 dark:text-primary-300">
                  {offers.filter(offer => offer.isService).length}
                </p>
              </div>
            </div>
          </div>

          {/* Offers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className={`card overflow-hidden hover:shadow-lg transition-shadow ${
                  !offer.isActive ? 'opacity-60 bg-gray-50' : ''
                }`}
              >
                {/* Thumbnail */}
                {offer.firstPicture?.id ? (
                  <div className="relative h-32 bg-gray-100">
                    <Image
                      src={apiClient.getPictureUrl(offer.firstPicture.id)}
                      alt={offer.title}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        console.error('Error loading offer image:', e);
                      }}
                    />
                    {/* Status overlay */}
                    <div className="absolute top-2 right-2 flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap backdrop-blur-sm ${
                        offer.isActive
                          ? 'bg-green-100/90 text-green-800'
                          : 'bg-red-100/90 text-red-800'
                      }`}>
                        {offer.isActive ? 'Aktiv' : 'Inaktiv'}
                      </span>
                      {offer.isService && (
                        <span className="text-xs bg-blue-100/90 text-blue-800 px-2 py-1 rounded-full whitespace-nowrap backdrop-blur-sm">
                          Service
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-32 bg-gray-100 flex items-center justify-center relative">
                    <span className="text-gray-400 text-3xl">📷</span>
                    {/* Status overlay for no-image cards */}
                    <div className="absolute top-2 right-2 flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                        offer.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {offer.isActive ? 'Aktiv' : 'Inaktiv'}
                      </span>
                      {offer.isService && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full whitespace-nowrap">
                          Service
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="p-6">
                  {/* Header */}
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {offer.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {offer.description}
                  </p>

                  {/* Category and Price */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-500">
                      {offer.category && (
                        <span className="flex items-center">
                          <span className="mr-1">{getCategoryIcon(offer.category.iconName)}</span>
                          {offer.category.name}
                        </span>
                      )}
                    </div>
                    <div className="text-lg font-semibold text-primary-600">
                      {formatPrice(offer)}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-gray-500">
                        Erstellt am {new Date(offer.createdAt).toLocaleDateString('de-DE')}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/angebote/${offer.id}`}
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          Anzeigen
                        </Link>
                        <span className="text-gray-300">|</span>
                        <Link
                          href={`/angebote/${offer.id}/bearbeiten`}
                          className="text-sm text-gray-600 hover:text-gray-700"
                        >
                          Bearbeiten
                        </Link>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => deleteOffer(offer.id, offer.title)}
                        className="text-sm px-3 py-1 rounded-md text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 border border-dashed border-red-300 dark:border-red-700 hover:border-red-500 dark:hover:border-red-500 transition-colors"
                      >
                        🗑️ Löschen
                      </button>
                      <button
                        onClick={() => toggleOfferActive(offer.id)}
                        className={`text-sm px-3 py-1 rounded-md transition-colors ${
                          offer.isActive
                            ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
                            : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {offer.isActive ? 'Deaktivieren' : 'Aktivieren'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setOfferToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Angebot löschen"
        message={offerToDelete ? `Möchten Sie das Angebot "${offerToDelete.title}" wirklich löschen?` : ''}
      />
    </div>
  );
}