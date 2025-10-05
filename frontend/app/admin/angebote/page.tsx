'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient, Offer } from '@/lib/api';
import OfferThumbnail from '@/components/OfferThumbnail';

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<{ id: number; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!isLoggedIn || !user?.isAdmin)) {
      router.push('/');
      return;
    }

    if (isLoggedIn && user?.isAdmin) {
      loadOffers();
    }
  }, [isLoggedIn, user, authLoading, router]);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getOffers();
      setOffers(data);
    } catch (err) {
      setError('Fehler beim Laden der Angebote');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: number, title: string) => {
    setOfferToDelete({ id, title });
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!offerToDelete) return;

    try {
      setDeleting(true);
      setError('');
      await apiClient.adminDeleteOffer(offerToDelete.id);

      setOffers(offers.filter(o => o.id !== offerToDelete.id));
      setSuccessMessage(`Angebot "${offerToDelete.title}" wurde erfolgreich gelöscht`);
      setTimeout(() => setSuccessMessage(''), 5000);
      setDeleteModalOpen(false);
      setOfferToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen des Angebots');
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setOfferToDelete(null);
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Lädt...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !user?.isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Angebote verwalten
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Alle Angebote der Plattform ({offers.length} gesamt)
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <p className="text-sm text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Bild
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Titel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Anbieter
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Kategorie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Preis
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Aktionen
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {offers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  Keine Angebote gefunden
                </td>
              </tr>
            ) : (
              offers.map((offer) => (
                <tr key={offer.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <OfferThumbnail offer={offer} size="small" isInactive={!offer.isActive} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {offer.title}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {offer.isService ? 'Dienstleistung' : 'Artikel'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {offer.user?.firstName} {offer.user?.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {offer.category?.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {offer.pricePerHour ? `${offer.pricePerHour.toFixed(2)} €/Std` :
                       offer.pricePerDay ? `${offer.pricePerDay.toFixed(2)} €/Tag` :
                       offer.salePrice ? `${offer.salePrice.toFixed(2)} €` : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      offer.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {offer.isActive ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDeleteClick(offer.id, offer.title)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Löschen
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {offers.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 text-center text-gray-500 dark:text-gray-400">
            Keine Angebote gefunden
          </div>
        ) : (
          offers.map((offer) => (
            <div key={offer.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <div className="flex items-start space-x-4 mb-3">
                <OfferThumbnail offer={offer} size="small" isInactive={!offer.isActive} />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {offer.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {offer.user?.firstName} {offer.user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {offer.category?.name} • {offer.isService ? 'Dienstleistung' : 'Artikel'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    offer.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {offer.isActive ? 'Aktiv' : 'Inaktiv'}
                  </span>
                  <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">
                    {offer.pricePerHour ? `${offer.pricePerHour.toFixed(2)} €/Std` :
                     offer.pricePerDay ? `${offer.pricePerDay.toFixed(2)} €/Tag` :
                     offer.salePrice ? `${offer.salePrice.toFixed(2)} €` : 'N/A'}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteClick(offer.id, offer.title)}
                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                >
                  Löschen
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && offerToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Angebot löschen
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Möchten Sie das Angebot <strong>"{offerToDelete.title}"</strong> wirklich löschen?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                Abbrechen
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Wird gelöscht...' : 'Löschen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
