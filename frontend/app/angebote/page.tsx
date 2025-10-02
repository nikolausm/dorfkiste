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
  
  const searchParams = useSearchParams();
  const initialCategoryId = searchParams.get('categoryId');
  const initialSearch = searchParams.get('search');

  useEffect(() => {
    const categoryId = initialCategoryId ? parseInt(initialCategoryId) : null;
    setSelectedCategoryId(categoryId);
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
    loadData(categoryId, initialSearch || undefined);
    
    // Update URL without full page refresh
    const url = new URL(window.location.href);
    if (categoryId) {
      url.searchParams.set('categoryId', categoryId.toString());
    } else {
      url.searchParams.delete('categoryId');
    }
    window.history.pushState({}, '', url);
  };

  const handleSearch = (query: string) => {
    loadData(selectedCategoryId, query);
    
    // Update URL
    const url = new URL(window.location.href);
    if (query) {
      url.searchParams.set('search', query);
    } else {
      url.searchParams.delete('search');
    }
    window.history.pushState({}, '', url);
  };

  const formatPrice = (offer: Offer) => {
    if (offer.isService) {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Angebote durchsuchen
        </h1>
        <SearchBar initialQuery={initialSearch || ''} onSearch={handleSearch} />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar with categories */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Kategorien</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleCategoryChange(null)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                  selectedCategoryId === null
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Alle Angebote
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                    selectedCategoryId === category.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
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
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {offers.length === 0 && !isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {initialSearch 
                  ? `Keine Angebote für "${initialSearch}" gefunden.`
                  : 'Keine Angebote in dieser Kategorie gefunden.'
                }
              </p>
              <p className="text-gray-400 mt-2">
                Versuchen Sie es mit anderen Suchbegriffen oder wählen Sie eine andere Kategorie.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-gray-600">
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
                    href={`/angebote/${offer.id}`}
                    className="card hover:shadow-lg transition-shadow overflow-hidden"
                  >
                    {/* Picture */}
                    {offer.firstPicture?.id ? (
                      <div className="relative h-48 bg-gray-100">
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
                      <div className="h-48 bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400 text-4xl">📷</span>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                          {offer.title}
                        </h3>
                        {offer.isService && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2 whitespace-nowrap">
                            Service
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {offer.description}
                      </p>

                      <div className="flex items-center justify-between">
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

                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
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