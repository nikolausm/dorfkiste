'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient, Category } from '@/lib/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Kategorien');
    } finally {
      setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Kategorien werden geladen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Alle Kategorien
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Durchstöbern Sie unsere Kategorien und finden Sie genau das, was Sie suchen
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/angebote?categoryId=${category.id}`}
            className="card p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="text-center">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                {getCategoryIcon(category.iconName)}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {category.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {category.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Finden Sie nicht, was Sie suchen?
        </p>
        <Link href="/angebote" className="btn-primary">
          Alle Angebote durchsuchen
        </Link>
      </div>
    </div>
  );
}