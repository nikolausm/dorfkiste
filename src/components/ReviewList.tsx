"use client"

import React, { useState, useEffect } from 'react'
import { ChevronDown, Filter, SortAsc, SortDesc } from 'lucide-react'
import ReviewCard, { CompactReviewCard } from './ReviewCard'
import RatingStars from './RatingStars'
import { ListSkeleton } from './Skeleton'
import { useToast } from './Toast'

interface Review {
  id: string
  rating: number
  comment: string
  createdAt: Date
  reviewer: {
    id: string
    name: string | null
    avatar?: string | null
  }
  helpful?: number
  notHelpful?: number
  userHelpfulVote?: 'helpful' | 'not_helpful' | null
}

interface ReviewSummary {
  averageRating: number
  totalReviews: number
  ratingDistribution: { [key: number]: number }
}

interface ReviewListProps {
  reviews: Review[]
  summary: ReviewSummary
  loading?: boolean
  onHelpfulVote?: (reviewId: string, vote: 'helpful' | 'not_helpful') => Promise<void>
  onReport?: (reviewId: string) => void
  onLoadMore?: () => Promise<void>
  hasMore?: boolean
  compact?: boolean
  className?: string
}

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'
type FilterOption = 'all' | '5' | '4' | '3' | '2' | '1'

export default function ReviewList({
  reviews,
  summary,
  loading = false,
  onHelpfulVote,
  onReport,
  onLoadMore,
  hasMore = false,
  compact = false,
  className = ''
}: ReviewListProps) {
  const { error } = useToast()
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [sortedReviews, setSortedReviews] = useState<Review[]>(reviews)
  const [loadingMore, setLoadingMore] = useState(false)

  // Sort and filter reviews
  useEffect(() => {
    let filtered = reviews

    // Apply rating filter
    if (filterBy !== 'all') {
      const rating = parseInt(filterBy)
      filtered = reviews.filter(review => review.rating === rating)
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'highest':
          return b.rating - a.rating
        case 'lowest':
          return a.rating - b.rating
        case 'helpful':
          return (b.helpful || 0) - (a.helpful || 0)
        default:
          return 0
      }
    })

    setSortedReviews(sorted)
  }, [reviews, sortBy, filterBy])

  const handleLoadMore = async () => {
    if (!onLoadMore || loadingMore) return

    setLoadingMore(true)
    try {
      await onLoadMore()
    } catch (err) {
      error('Fehler beim Laden weiterer Bewertungen')
    } finally {
      setLoadingMore(false)
    }
  }

  const getRatingPercentage = (rating: number) => {
    if (summary.totalReviews === 0) return 0
    return ((summary.ratingDistribution[rating] || 0) / summary.totalReviews) * 100
  }

  const sortOptions = [
    { value: 'newest', label: 'Neueste zuerst' },
    { value: 'oldest', label: 'Älteste zuerst' },
    { value: 'highest', label: 'Beste Bewertung' },
    { value: 'lowest', label: 'Schlechteste Bewertung' },
    { value: 'helpful', label: 'Hilfreichste' }
  ]

  const filterOptions = [
    { value: 'all', label: 'Alle Bewertungen' },
    { value: '5', label: '5 Sterne' },
    { value: '4', label: '4 Sterne' },
    { value: '3', label: '3 Sterne' },
    { value: '2', label: '2 Sterne' },
    { value: '1', label: '1 Stern' }
  ]

  return (
    <div className={className}>
      {/* Review Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Bewertungen ({summary.totalReviews})
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Average Rating */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
              <span className="text-3xl font-bold text-gray-900">
                {summary.averageRating.toFixed(1)}
              </span>
              <RatingStars rating={summary.averageRating} size="lg" />
            </div>
            <p className="text-gray-600">
              Basierend auf {summary.totalReviews} Bewertungen
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 w-8">
                  {rating} ★
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getRatingPercentage(rating)}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8 text-right">
                  {summary.ratingDistribution[rating] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters and Sorting */}
      {!compact && summary.totalReviews > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Filter className="w-4 h-4" aria-hidden="true" />
              <span>Filter & Sortierung</span>
              <ChevronDown 
                className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>

            <div className="text-sm text-gray-600">
              {sortedReviews.length} von {summary.totalReviews} Bewertungen
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Sort */}
                <div>
                  <label htmlFor="sort-select" className="block text-sm font-medium text-gray-700 mb-1">
                    Sortieren nach
                  </label>
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filter */}
                <div>
                  <label htmlFor="filter-select" className="block text-sm font-medium text-gray-700 mb-1">
                    Bewertung filtern
                  </label>
                  <select
                    id="filter-select"
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {filterOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <ListSkeleton count={3} />
        ) : sortedReviews.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600">
              {filterBy === 'all' 
                ? 'Noch keine Bewertungen vorhanden.' 
                : `Keine Bewertungen mit ${filterBy} Sternen gefunden.`
              }
            </p>
          </div>
        ) : (
          <>
            {sortedReviews.map(review => (
              compact ? (
                <CompactReviewCard 
                  key={review.id} 
                  review={review}
                />
              ) : (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onHelpfulVote={onHelpfulVote}
                  onReport={onReport}
                />
              )
            ))}

            {/* Load More */}
            {hasMore && onLoadMore && (
              <div className="text-center pt-6">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2" />
                      Lädt...
                    </>
                  ) : (
                    'Weitere Bewertungen laden'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}