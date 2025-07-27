"use client"

import React, { useState } from 'react'
import { Star } from 'lucide-react'

interface RatingStarsProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onRatingChange?: (rating: number) => void
  disabled?: boolean
  showCount?: boolean
  reviewCount?: number
  className?: string
}

export default function RatingStars({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRatingChange,
  disabled = false,
  showCount = false,
  reviewCount,
  className = ''
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState(0)
  const [focusedStar, setFocusedStar] = useState(-1)

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const starSize = sizeClasses[size]
  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating

  const handleStarClick = (starValue: number) => {
    if (!interactive || disabled) return
    onRatingChange?.(starValue)
  }

  const handleStarHover = (starValue: number) => {
    if (!interactive || disabled) return
    setHoverRating(starValue)
  }

  const handleStarLeave = () => {
    if (!interactive || disabled) return
    setHoverRating(0)
  }

  const handleKeyDown = (event: React.KeyboardEvent, starValue: number) => {
    if (!interactive || disabled) return
    
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        handleStarClick(starValue)
        break
      case 'ArrowRight':
      case 'ArrowUp':
        event.preventDefault()
        const nextStar = Math.min(starValue + 1, maxRating)
        setFocusedStar(nextStar - 1)
        break
      case 'ArrowLeft':
      case 'ArrowDown':
        event.preventDefault()
        const prevStar = Math.max(starValue - 1, 1)
        setFocusedStar(prevStar - 1)
        break
    }
  }

  const getStarFill = (starIndex: number) => {
    const starValue = starIndex + 1
    const currentRating = displayRating

    if (currentRating >= starValue) {
      return 'full'
    } else if (currentRating > starIndex && currentRating < starValue) {
      return 'partial'
    }
    return 'empty'
  }

  const getStarColor = (fill: string, isHovered: boolean, isFocused: boolean) => {
    if (disabled) {
      return fill === 'empty' ? 'text-gray-300' : 'text-gray-400'
    }

    if (interactive) {
      if (isFocused) {
        return fill === 'empty' ? 'text-blue-300' : 'text-blue-500'
      }
      if (isHovered) {
        return fill === 'empty' ? 'text-yellow-300' : 'text-yellow-500'
      }
    }

    return fill === 'empty' ? 'text-gray-300' : 'text-yellow-500'
  }

  const formatReviewCount = (count: number) => {
    if (count === 0) return 'Keine Bewertungen'
    if (count === 1) return '1 Bewertung'
    return `${count} Bewertungen`
  }

  return (
    <div className={`flex items-center ${className}`}>
      <div 
        className={`flex items-center ${interactive ? 'gap-1' : 'gap-0.5'}`}
        role={interactive ? 'radiogroup' : 'img'}
        aria-label={interactive ? 'Bewertung abgeben' : `Bewertung: ${rating} von ${maxRating} Sternen`}
      >
        {[...Array(maxRating)].map((_, index) => {
          const starValue = index + 1
          const fill = getStarFill(index)
          const isHovered = interactive && hoverRating >= starValue
          const isFocused = interactive && focusedStar === index

          return (
            <div key={index} className="relative">
              {interactive ? (
                <button
                  type="button"
                  className={`${starSize} transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded ${
                    disabled ? 'cursor-not-allowed' : 'cursor-pointer'
                  }`}
                  onClick={() => handleStarClick(starValue)}
                  onMouseEnter={() => handleStarHover(starValue)}
                  onMouseLeave={handleStarLeave}
                  onFocus={() => setFocusedStar(index)}
                  onBlur={() => setFocusedStar(-1)}
                  onKeyDown={(e) => handleKeyDown(e, starValue)}
                  disabled={disabled}
                  role="radio"
                  aria-checked={rating === starValue}
                  aria-label={`${starValue} von ${maxRating} Sternen`}
                >
                  <Star
                    className={`${starSize} ${getStarColor(fill, isHovered, isFocused)} ${
                      fill !== 'empty' ? 'fill-current' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
              ) : (
                <Star
                  className={`${starSize} ${getStarColor(fill, false, false)} ${
                    fill !== 'empty' ? 'fill-current' : ''
                  }`}
                  aria-hidden="true"
                />
              )}
              
              {/* Partial fill for half stars */}
              {fill === 'partial' && (
                <div 
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${(displayRating - index) * 100}%` }}
                >
                  <Star
                    className={`${starSize} text-yellow-500 fill-current`}
                    aria-hidden="true"
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Rating text and review count */}
      <div className="ml-2 flex items-center gap-2 text-sm">
        {!interactive && (
          <span className="text-gray-700 font-medium">
            {rating.toFixed(1)}
          </span>
        )}
        
        {showCount && reviewCount !== undefined && (
          <span className="text-gray-500">
            ({formatReviewCount(reviewCount)})
          </span>
        )}
      </div>
    </div>
  )
}

// Compact rating display for cards and lists
export function CompactRating({ 
  rating, 
  reviewCount, 
  className = '' 
}: { 
  rating: number
  reviewCount?: number
  className?: string 
}) {
  return (
    <div className={`flex items-center ${className}`}>
      <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" aria-hidden="true" />
      <span className="text-sm font-medium text-gray-700">
        {rating.toFixed(1)}
      </span>
      {reviewCount !== undefined && (
        <span className="text-sm text-gray-500 ml-1">
          ({reviewCount})
        </span>
      )}
    </div>
  )
}