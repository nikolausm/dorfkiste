"use client"

import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'
import { User, ThumbsUp, ThumbsDown, Flag } from 'lucide-react'
import RatingStars from './RatingStars'
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

interface ReviewCardProps {
  review: Review
  onHelpfulVote?: (reviewId: string, vote: 'helpful' | 'not_helpful') => Promise<void>
  onReport?: (reviewId: string) => void
  className?: string
}

export default function ReviewCard({ 
  review, 
  onHelpfulVote, 
  onReport,
  className = '' 
}: ReviewCardProps) {
  const { success, error } = useToast()
  const [isVoting, setIsVoting] = React.useState(false)

  const handleHelpfulVote = async (vote: 'helpful' | 'not_helpful') => {
    if (!onHelpfulVote || isVoting) return

    setIsVoting(true)
    try {
      await onHelpfulVote(review.id, vote)
      success('Bewertung wurde gespeichert')
    } catch (err) {
      error('Fehler beim Speichern der Bewertung')
    } finally {
      setIsVoting(false)
    }
  }

  const handleReport = () => {
    if (!onReport) return
    onReport(review.id)
  }

  const timeAgo = formatDistanceToNow(review.createdAt, {
    addSuffix: true,
    locale: de
  })

  return (
    <article 
      className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}
      aria-labelledby={`review-${review.id}-title`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {review.reviewer.avatar ? (
              <img
                src={review.reviewer.avatar}
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" aria-hidden="true" />
              </div>
            )}
          </div>
          
          {/* Reviewer info */}
          <div className="min-w-0 flex-1">
            <h3 
              id={`review-${review.id}-title`}
              className="text-sm font-medium text-gray-900 truncate"
            >
              {review.reviewer.name || 'Anonymer Nutzer'}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <RatingStars rating={review.rating} size="sm" />
              <span className="text-xs text-gray-500">
                {timeAgo}
              </span>
            </div>
          </div>
        </div>

        {/* Report button */}
        {onReport && (
          <button
            onClick={handleReport}
            className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Bewertung melden"
            title="Bewertung melden"
          >
            <Flag className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Review content */}
      <div className="mb-4">
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {review.comment}
        </p>
      </div>

      {/* Helpful votes */}
      {onHelpfulVote && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              War diese Bewertung hilfreich?
            </span>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleHelpfulVote('helpful')}
                disabled={isVoting || review.userHelpfulVote === 'helpful'}
                className={`flex items-center space-x-1 px-2 py-1 rounded text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  review.userHelpfulVote === 'helpful'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:text-green-700 hover:bg-green-50'
                } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label="Als hilfreich markieren"
              >
                <ThumbsUp className="w-4 h-4" aria-hidden="true" />
                <span>{review.helpful || 0}</span>
              </button>
              
              <button
                onClick={() => handleHelpfulVote('not_helpful')}
                disabled={isVoting || review.userHelpfulVote === 'not_helpful'}
                className={`flex items-center space-x-1 px-2 py-1 rounded text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  review.userHelpfulVote === 'not_helpful'
                    ? 'bg-red-100 text-red-700'
                    : 'text-gray-600 hover:text-red-700 hover:bg-red-50'
                } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label="Als nicht hilfreich markieren"
              >
                <ThumbsDown className="w-4 h-4" aria-hidden="true" />
                <span>{review.notHelpful || 0}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}

// Compact review card for lists
export function CompactReviewCard({ 
  review, 
  className = '' 
}: { 
  review: Review
  className?: string 
}) {
  const timeAgo = formatDistanceToNow(review.createdAt, {
    addSuffix: true,
    locale: de
  })

  return (
    <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {review.reviewer.avatar ? (
            <img
              src={review.reviewer.avatar}
              alt=""
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" aria-hidden="true" />
            </div>
          )}
        </div>
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium text-gray-900">
              {review.reviewer.name || 'Anonymer Nutzer'}
            </span>
            <RatingStars rating={review.rating} size="sm" />
          </div>
          
          <p className="text-sm text-gray-700 line-clamp-3 mb-2">
            {review.comment}
          </p>
          
          <span className="text-xs text-gray-500">
            {timeAgo}
          </span>
        </div>
      </div>
    </div>
  )
}