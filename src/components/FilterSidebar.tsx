"use client"

import React, { useState } from 'react'
import { X, ChevronDown, ChevronUp, Filter } from 'lucide-react'
import RatingStars from './RatingStars'

export interface FilterState {
  categories: string[]
  priceRange: { min?: number; max?: number }
  condition: string[]
  minRating?: number
  location?: string
  radius?: number
  availability: 'all' | 'available' | 'unavailable'
}

interface FilterSidebarProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  categories?: Array<{ id: string; name: string; count?: number }>
  onClose?: () => void
  className?: string
  isMobile?: boolean
}

const conditionOptions = [
  { value: 'neu', label: 'Neu' },
  { value: 'sehr_gut', label: 'Sehr gut' },
  { value: 'gut', label: 'Gut' },
  { value: 'befriedigend', label: 'Befriedigend' },
  { value: 'gebraucht', label: 'Gebraucht' }
]

const priceRanges = [
  { min: 0, max: 5, label: 'Unter 5€' },
  { min: 5, max: 10, label: '5€ - 10€' },
  { min: 10, max: 25, label: '10€ - 25€' },
  { min: 25, max: 50, label: '25€ - 50€' },
  { min: 50, max: undefined, label: 'Über 50€' }
]

export default function FilterSidebar({
  filters,
  onFiltersChange,
  categories = [],
  onClose,
  className = '',
  isMobile = false
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    condition: true,
    rating: true,
    location: false
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates })
  }

  const toggleCategory = (categoryId: string) => {
    const updated = filters.categories.includes(categoryId)
      ? filters.categories.filter(id => id !== categoryId)
      : [...filters.categories, categoryId]
    updateFilters({ categories: updated })
  }

  const toggleCondition = (condition: string) => {
    const updated = filters.condition.includes(condition)
      ? filters.condition.filter(c => c !== condition)
      : [...filters.condition, condition]
    updateFilters({ condition: updated })
  }

  const setPriceRange = (min?: number, max?: number) => {
    updateFilters({ priceRange: { min, max } })
  }

  const clearFilters = () => {
    onFiltersChange({
      categories: [],
      priceRange: {},
      condition: [],
      minRating: undefined,
      location: undefined,
      radius: undefined,
      availability: 'all'
    })
  }

  const activeFilterCount = [
    ...filters.categories,
    ...filters.condition,
    filters.priceRange.min !== undefined || filters.priceRange.max !== undefined ? 'price' : null,
    filters.minRating ? 'rating' : null,
    filters.location ? 'location' : null,
    filters.availability !== 'all' ? 'availability' : null
  ].filter(Boolean).length

  const FilterSection = ({ 
    title, 
    sectionKey, 
    children 
  }: { 
    title: string
    sectionKey: keyof typeof expandedSections
    children: React.ReactNode 
  }) => (
    <div className="border-b border-gray-200">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
        aria-expanded={expandedSections[sectionKey]}
      >
        <span className="font-medium text-gray-900">{title}</span>
        {expandedSections[sectionKey] ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      
      {expandedSections[sectionKey] && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  )

  return (
    <div className={`bg-white ${isMobile ? 'fixed inset-0 z-50' : 'border border-gray-200 rounded-lg'} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="font-medium text-gray-900">Filter</h2>
          {activeFilterCount > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-800 transition-colors"
            >
              Zurücksetzen
            </button>
          )}
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors focus:outline-none focus:bg-gray-100"
              aria-label="Filter schließen"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Content */}
      <div className={`${isMobile ? 'flex-1 overflow-y-auto' : ''}`}>
        {/* Categories */}
        {categories.length > 0 && (
          <FilterSection title="Kategorien" sectionKey="categories">
            <div className="space-y-2">
              {categories.map(category => (
                <label key={category.id} className="flex items-center space-x-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category.id)}
                    onChange={() => toggleCategory(category.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 flex-1">
                    {category.name}
                  </span>
                  {category.count !== undefined && (
                    <span className="text-xs text-gray-400">
                      ({category.count})
                    </span>
                  )}
                </label>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Price Range */}
        <FilterSection title="Preis pro Tag" sectionKey="price">
          <div className="space-y-3">
            {/* Quick ranges */}
            <div className="space-y-2">
              {priceRanges.map((range, index) => (
                <label key={index} className="flex items-center space-x-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="priceRange"
                    checked={filters.priceRange.min === range.min && filters.priceRange.max === range.max}
                    onChange={() => setPriceRange(range.min, range.max)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">
                    {range.label}
                  </span>
                </label>
              ))}
            </div>

            {/* Custom range */}
            <div className="pt-3 border-t border-gray-100">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Benutzerdefiniert
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={filters.priceRange.min || ''}
                  onChange={(e) => setPriceRange(
                    e.target.value ? parseFloat(e.target.value) : undefined,
                    filters.priceRange.max
                  )}
                  placeholder="Von"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.5"
                />
                <input
                  type="number"
                  value={filters.priceRange.max || ''}
                  onChange={(e) => setPriceRange(
                    filters.priceRange.min,
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )}
                  placeholder="Bis"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.5"
                />
              </div>
            </div>
          </div>
        </FilterSection>

        {/* Condition */}
        <FilterSection title="Zustand" sectionKey="condition">
          <div className="space-y-2">
            {conditionOptions.map(option => (
              <label key={option.value} className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.condition.includes(option.value)}
                  onChange={() => toggleCondition(option.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Rating */}
        <FilterSection title="Mindestbewertung" sectionKey="rating">
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map(rating => (
              <label key={rating} className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="radio"
                  name="minRating"
                  checked={filters.minRating === rating}
                  onChange={() => updateFilters({ 
                    minRating: filters.minRating === rating ? undefined : rating 
                  })}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
                />
                <RatingStars rating={rating} size="sm" />
                <span className="text-sm text-gray-700">& mehr</span>
              </label>
            ))}
            
            <label className="flex items-center space-x-2 cursor-pointer group">
              <input
                type="radio"
                name="minRating"
                checked={filters.minRating === undefined}
                onChange={() => updateFilters({ minRating: undefined })}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-sm text-gray-700">Alle Bewertungen</span>
            </label>
          </div>
        </FilterSection>

        {/* Location */}
        <FilterSection title="Standort" sectionKey="location">
          <div className="space-y-3">
            <input
              type="text"
              value={filters.location || ''}
              onChange={(e) => updateFilters({ location: e.target.value || undefined })}
              placeholder="Stadt oder PLZ"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Umkreis
              </label>
              <select
                value={filters.radius || 25}
                onChange={(e) => updateFilters({ radius: parseInt(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={25}>25 km</option>
                <option value={50}>50 km</option>
                <option value={100}>100 km</option>
                <option value={0}>Überall</option>
              </select>
            </div>
          </div>
        </FilterSection>

        {/* Availability */}
        <div className="p-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Verfügbarkeit
          </label>
          <div className="space-y-2">
            {[
              { value: 'all', label: 'Alle Artikel' },
              { value: 'available', label: 'Nur verfügbare' },
              { value: 'unavailable', label: 'Nicht verfügbare' }
            ].map(option => (
              <label key={option.value} className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="radio"
                  name="availability"
                  value={option.value}
                  checked={filters.availability === option.value}
                  onChange={(e) => updateFilters({ availability: e.target.value as any })}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}