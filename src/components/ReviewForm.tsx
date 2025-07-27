"use client"

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Send, X } from 'lucide-react'
import RatingStars from './RatingStars'
import { ButtonLoading } from './LoadingSpinner'
import { useToast } from './Toast'

interface ReviewFormProps {
  itemId?: string
  userId?: string
  rentalId?: string
  onSubmit: (data: ReviewFormData) => Promise<void>
  onCancel?: () => void
  className?: string
  placeholder?: string
  submitLabel?: string
}

export interface ReviewFormData {
  rating: number
  comment: string
  itemId?: string
  userId?: string
  rentalId?: string
}

export default function ReviewForm({
  itemId,
  userId,
  rentalId,
  onSubmit,
  onCancel,
  className = '',
  placeholder = 'Teilen Sie Ihre Erfahrung mit anderen...',
  submitLabel = 'Bewertung abgeben'
}: ReviewFormProps) {
  const { data: session } = useSession()
  const { success, error } = useToast()
  
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ rating?: string; comment?: string }>({})

  const validateForm = () => {
    const newErrors: { rating?: string; comment?: string } = {}

    if (rating === 0) {
      newErrors.rating = 'Bitte geben Sie eine Bewertung ab'
    }

    if (comment.trim().length < 10) {
      newErrors.comment = 'Der Kommentar muss mindestens 10 Zeichen lang sein'
    }

    if (comment.trim().length > 1000) {
      newErrors.comment = 'Der Kommentar darf maximal 1000 Zeichen lang sein'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      error('Sie müssen angemeldet sein, um eine Bewertung abzugeben')
      return
    }

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      await onSubmit({
        rating,
        comment: comment.trim(),
        itemId,
        userId,
        rentalId
      })
      
      success('Bewertung wurde erfolgreich abgegeben')
      
      // Reset form
      setRating(0)
      setComment('')
      setErrors({})
      
    } catch (err) {
      error('Fehler beim Speichern der Bewertung')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setRating(0)
    setComment('')
    setErrors({})
    onCancel?.()
  }

  if (!session) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 text-center ${className}`}>
        <p className="text-gray-600 mb-4">
          Melden Sie sich an, um eine Bewertung abzugeben
        </p>
        <a
          href="/auth/signin"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Anmelden
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Bewertung abgeben
      </h3>

      {/* Rating */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bewertung *
        </label>
        <RatingStars
          rating={rating}
          interactive
          onRatingChange={setRating}
          className="mb-1"
        />
        {errors.rating && (
          <p className="text-sm text-red-600 mt-1" role="alert">
            {errors.rating}
          </p>
        )}
      </div>

      {/* Comment */}
      <div className="mb-6">
        <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 mb-2">
          Kommentar *
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical ${
            errors.comment ? 'border-red-300' : 'border-gray-300'
          }`}
          aria-describedby={errors.comment ? 'comment-error' : undefined}
          maxLength={1000}
        />
        <div className="flex justify-between items-center mt-1">
          {errors.comment && (
            <p id="comment-error" className="text-sm text-red-600" role="alert">
              {errors.comment}
            </p>
          )}
          <span className="text-xs text-gray-500 ml-auto">
            {comment.length}/1000
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-4 h-4 mr-2" aria-hidden="true" />
            Abbrechen
          </button>
        )}
        
        <ButtonLoading
          type="submit"
          loading={isSubmitting}
          disabled={rating === 0 || comment.trim().length < 10}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4 mr-2" aria-hidden="true" />
          {submitLabel}
        </ButtonLoading>
      </div>

      {/* Guidelines */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-1">
          Bewertungsrichtlinien
        </h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Seien Sie ehrlich und konstruktiv</li>
          <li>• Beschreiben Sie Ihre Erfahrung konkret</li>
          <li>• Vermeiden Sie persönliche Angriffe</li>
          <li>• Respektieren Sie die Privatsphäre</li>
        </ul>
      </div>
    </form>
  )
}

// Compact review form for modals or inline use
export function CompactReviewForm({
  itemId,
  userId,
  rentalId,
  onSubmit,
  onCancel,
  className = ''
}: ReviewFormProps) {
  const { data: session } = useSession()
  const { success, error } = useToast()
  
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      error('Sie müssen angemeldet sein')
      return
    }

    if (rating === 0) {
      error('Bitte geben Sie eine Bewertung ab')
      return
    }

    if (comment.trim().length < 5) {
      error('Der Kommentar ist zu kurz')
      return
    }

    setIsSubmitting(true)
    
    try {
      await onSubmit({
        rating,
        comment: comment.trim(),
        itemId,
        userId,
        rentalId
      })
      
      success('Bewertung gespeichert')
      setRating(0)
      setComment('')
      
    } catch (err) {
      error('Fehler beim Speichern')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!session) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <p className="text-sm text-gray-600 mb-2">
          Anmelden für Bewertung
        </p>
        <a
          href="/auth/signin"
          className="text-blue-600 hover:underline text-sm"
        >
          Anmelden
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
      <RatingStars
        rating={rating}
        interactive
        onRatingChange={setRating}
      />
      
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Kurzer Kommentar..."
        rows={2}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
        maxLength={500}
      />
      
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">
          {comment.length}/500
        </span>
        
        <div className="space-x-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              Abbrechen
            </button>
          )}
          
          <ButtonLoading
            type="submit"
            loading={isSubmitting}
            disabled={rating === 0 || comment.trim().length < 5}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Senden
          </ButtonLoading>
        </div>
      </div>
    </form>
  )
}