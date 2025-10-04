'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import SearchBar from '@/components/SearchBar';
import { apiClient, Offer, Category } from '@/lib/api';

function OffersContent() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [currentSearch, setCurrentSearch] = useState<string>('');

  const searchParams = useSearchParams();
  const initialCategoryId = searchParams.get('categoryId');
  const initialSearch = searchParams.get('search');

  useEffect(() => {
    const categoryId = initialCategoryId ? parseInt(initialCategoryId) : null;
    setSelectedCategoryId(categoryId);
    setCurrentSearch(initialSearch || '');
    loadData(categoryId, initialSearch || undefined);
    loadCategories();
  }, [initialCategoryId, initialSearch]);

  const loadData = async (categoryId?: number | null, search?: string) => {
    try {
      setIsLoading(true);
      const data = await apiClient.getOffers(categoryId || undefined, search);
      setOffers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Angebote');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await apiClient.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Fehler beim Laden der Kategorien:', err);
    }
  };

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    loadData(categoryId, currentSearch || undefined);

    // Update URL without full page refresh
    const url = new URL(window.location.href);
    if (categoryId) {
      url.searchParams.set('categoryId', categoryId.toString());
    } else {
      url.searchParams.delete('categoryId');
    }
    // Preserve search parameter
    if (currentSearch) {
      url.searchParams.set('search', currentSearch);
    }
    window.history.pushState({}, '', url);
  };

  const handleSearch = (query: string) => {
    setCurrentSearch(query);
    loadData(selectedCategoryId, query);

    // Update URL
    const url = new URL(window.location.href);
    if (query) {
      url.searchParams.set('search', query);
    } else {
      url.searchParams.delete('search');
    }
    // Preserve category parameter
    if (selectedCategoryId) {
      url.searchParams.set('categoryId', selectedCategoryId.toString());
    }
    window.history.pushState({}, '', url);
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

  if (isLoading && offers.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Angebote werden geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Angebote durchsuchen
        </h1>
        <SearchBar initialQuery={currentSearch} onSearch={handleSearch} />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar with categories */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Kategorien</h3>
            {currentSearch && (
              <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md">
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  Kategoriefilter ist während der Suche deaktiviert
                </p>
              </div>
            )}
            <div className="space-y-2">
              <button
                onClick={() => handleCategoryChange(null)}
                disabled={!!currentSearch}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                  currentSearch
                    ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                    : selectedCategoryId === null
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Alle Angebote
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  disabled={!!currentSearch}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                    currentSearch
                      ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                      : selectedCategoryId === category.id
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {getCategoryIcon(category.iconName)} {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md p-4 mb-6">
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {offers.length === 0 && !isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                {initialSearch
                  ? `Keine Angebote für "${initialSearch}" gefunden.`
                  : 'Keine Angebote in dieser Kategorie gefunden.'
                }
              </p>
              <p className="text-gray-400 dark:text-gray-500 mt-2">
                Versuchen Sie es mit anderen Suchbegriffen oder wählen Sie eine andere Kategorie.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-gray-600 dark:text-gray-400">
                  {offers.length} Angebot{offers.length !== 1 ? 'e' : ''} gefunden
                  {selectedCategoryId && categories.length > 0 && (
                    <span> in {categories.find(c => c.id === selectedCategoryId)?.name}</span>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {offers.map((offer) => (
                  <Link
                    key={offer.id}
                    href={`/angebote/${offer.slug || offer.id}`}
                    className="card hover:shadow-lg transition-shadow overflow-hidden"
                  >
                    {/* Picture */}
                    {offer.firstPicture?.id ? (
                      <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
                        <Image
                          src={apiClient.getPictureUrl(offer.firstPicture.id)}
                          alt={offer.title}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            console.error('Error loading offer image:', e);
                          }}
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-400 dark:text-gray-500 text-4xl">📷</span>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                          {offer.title}
                        </h3>
                        {offer.isService && (
                          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full ml-2 whitespace-nowrap">
                            Service
                          </span>
                        )}
                      </div>

                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                        {offer.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {offer.category && (
                            <span className="flex items-center">
                              <span className="mr-1">{getCategoryIcon(offer.category.iconName)}</span>
                              {offer.category.name}
                            </span>
                          )}
                        </div>
                        <div className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                          {formatPrice(offer)}
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Angeboten von {offer.user?.firstName} {offer.user?.lastName}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OffersPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Seite wird geladen...</p>
        </div>
      </div>
    }>
      <OffersContent />
    </Suspense>
  );
}