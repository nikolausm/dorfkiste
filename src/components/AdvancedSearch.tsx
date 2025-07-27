"use client"

import React, { useState, useEffect } from 'react'
import { Search, X, Filter, MapPin, Calendar, Euro, Star } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import RatingStars from './RatingStars'

export interface SearchFilters {
  query?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  location?: string
  radius?: number
  condition?: string[]
  minRating?: number
  availability?: 'all' | 'available' | 'unavailable'
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'distance' | 'newest'
  priceType?: 'all' | 'hourly' | 'daily'
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void
  initialFilters?: SearchFilters
  categories?: Array<{ id: string; name: string }>
  className?: string
  compact?: boolean
}

const conditionOptions = [
  { value: 'neu', label: 'Neu' },
  { value: 'sehr_gut', label: 'Sehr gut' },
  { value: 'gut', label: 'Gut' },
  { value: 'befriedigend', label: 'Befriedigend' },
  { value: 'gebraucht', label: 'Gebraucht' }
]

const sortOptions = [
  { value: 'relevance', label: 'Relevanz' },
  { value: 'price_asc', label: 'Preis aufsteigend' },
  { value: 'price_desc', label: 'Preis absteigend' },
  { value: 'rating', label: 'Bewertung' },
  { value: 'distance', label: 'Entfernung' },
  { value: 'newest', label: 'Neueste zuerst' }
]

const radiusOptions = [
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50 km' },
  { value: 100, label: '100 km' },
  { value: 0, label: 'Überall' }
]

export default function AdvancedSearch({
  onSearch,
  initialFilters = {},
  categories = [],
  className = '',
  compact = false
}: AdvancedSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [filters, setFilters] = useState<SearchFilters>(initialFilters)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [localQuery, setLocalQuery] = useState(initialFilters.query || '')

  // Sync with URL parameters
  useEffect(() => {
    const urlFilters: SearchFilters = {
      query: searchParams.get('q') || '',
      category: searchParams.get('category') || '',
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
      location: searchParams.get('location') || '',
      radius: searchParams.get('radius') ? parseInt(searchParams.get('radius')!) : 25,
      condition: (searchParams.get('condition') && typeof searchParams.get('condition') === 'string') ? searchParams.get('condition')!.split(',') : [],
      minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined,
      availability: (searchParams.get('availability') as any) || 'available',
      sortBy: (searchParams.get('sortBy') as any) || 'relevance',
      priceType: (searchParams.get('priceType') as any) || 'all'
    }

    setFilters(urlFilters)
    setLocalQuery(urlFilters.query || '')
  }, [searchParams])

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    onSearch(updated)
    
    // Update URL
    const params = new URLSearchParams()
    Object.entries(updated).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        if (Array.isArray(value)) {
          if (value.length > 0) params.set(key, value.join(','))
        } else {
          params.set(key, value.toString())
        }
      }
    })
    
    const url = `${window.location.pathname}?${params.toString()}`
    window.history.replaceState({}, '', url)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ query: localQuery })
  }

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      query: '',
      sortBy: 'relevance',
      availability: 'available'
    }
    setFilters(clearedFilters)
    setLocalQuery('')
    onSearch(clearedFilters)
    router.push(window.location.pathname)
  }

  const toggleCondition = (condition: string) => {
    const current = filters.condition || []
    const updated = current.includes(condition)
      ? current.filter(c => c !== condition)
      : [...current, condition]
    updateFilters({ condition: updated })
  }

  const activeFilterCount = Object.values(filters).filter(value => {
    if (Array.isArray(value)) return value.length > 0
    return value !== undefined && value !== '' && value !== 'all' && value !== 'available' && value !== 'relevance'
  }).length

  if (compact) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Suchen..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Suchen
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Was suchen Sie?"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Suchen
          </button>
        </form>

        <div className="flex items-center justify-between mt-3">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Erweiterte Filter</span>
            {activeFilterCount > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-800 transition-colors"
            >
              Filter zurücksetzen
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="p-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Category */}
            {categories.length > 0 && (
              <div>
                <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Kategorie
                </label>
                <select
                  id="category-select"
                  value={filters.category || ''}
                  onChange={(e) => updateFilters({ category: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Alle Kategorien</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Euro className="w-4 h-4 inline mr-1" />
                Preis pro Tag
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={filters.minPrice || ''}
                  onChange={(e) => updateFilters({ minPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="Von"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.5"
                />
                <input
                  type="number"
                  value={filters.maxPrice || ''}
                  onChange={(e) => updateFilters({ maxPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="Bis"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.5"
                />
              </div>
            </div>

            {/* Location & Radius */}
            <div>
              <label htmlFor="location-input" className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Standort
              </label>
              <input
                id="location-input"
                type="text"
                value={filters.location || ''}
                onChange={(e) => updateFilters({ location: e.target.value || undefined })}
                placeholder="Stadt oder PLZ"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
              />
              <select
                value={filters.radius || 25}
                onChange={(e) => updateFilters({ radius: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {radiusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Minimum Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Star className="w-4 h-4 inline mr-1" />
                Mindestbewertung
              </label>
              <RatingStars
                rating={filters.minRating || 0}
                interactive
                onRatingChange={(rating) => updateFilters({ minRating: rating > 0 ? rating : undefined })}
              />
            </div>

            {/* Availability */}
            <div>
              <label htmlFor="availability-select" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Verfügbarkeit
              </label>
              <select
                id="availability-select"
                value={filters.availability || 'available'}
                onChange={(e) => updateFilters({ availability: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Alle Artikel</option>
                <option value="available">Nur verfügbare</option>
                <option value="unavailable">Nicht verfügbare</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label htmlFor="sort-select" className="block text-sm font-medium text-gray-700 mb-2">
                Sortierung
              </label>
              <select
                id="sort-select"
                value={filters.sortBy || 'relevance'}
                onChange={(e) => updateFilters({ sortBy: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Condition Checkboxes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Zustand
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {conditionOptions.map(option => (
                <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.condition?.includes(option.value) || false}
                    onChange={() => toggleCondition(option.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Preistyp
            </label>
            <div className="flex space-x-4">
              {[
                { value: 'all', label: 'Alle' },
                { value: 'hourly', label: 'Stündlich' },
                { value: 'daily', label: 'Täglich' }
              ].map(option => (
                <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="priceType"
                    value={option.value}
                    checked={filters.priceType === option.value || (filters.priceType === undefined && option.value === 'all')}
                    onChange={(e) => updateFilters({ priceType: e.target.value as any })}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}