"use client"

import Image from 'next/image'
import Link from 'next/link'
import { Heart, Clock } from 'lucide-react'
import { useState } from 'react'
import { generateItemImageUrl } from '@/lib/image-generator'
import { CompactRating } from './RatingStars'

interface ItemCardProps {
  id: string
  title: string
  imageUrl?: string
  pricePerDay?: number | null
  pricePerHour?: number | null
  location: string
  condition: string
  available: boolean
  user: {
    id: string
    name: string | null
    rating?: number
    reviewCount?: number
  }
  endTime?: Date
  viewCount?: number
  isWatched?: boolean
  category?: string
}

export default function ItemCard({
  id,
  title,
  imageUrl,
  pricePerDay,
  pricePerHour,
  location,
  condition,
  available,
  user,
  endTime,
  viewCount = 0,
  isWatched = false,
  category
}: ItemCardProps) {
  const [imgError, setImgError] = useState(false)
  const [watched, setWatched] = useState(isWatched)
  
  const handleWatchClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setWatched(!watched)
    // TODO: API call to update watchlist
  }

  const formatTimeLeft = () => {
    if (!endTime) return null
    const now = new Date()
    const end = new Date(endTime)
    const diff = end.getTime() - now.getTime()
    
    if (diff <= 0) return "Beendet"
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}T ${hours}Std`
    return `${hours}Std`
  }

  return (
    <div className="bg-white border border-gray-200 rounded hover:shadow-lg transition-shadow">
      <Link href={`/items/${id}`} className="block">
        <div className="relative">
          {/* Image */}
          <div className="relative aspect-square bg-gray-100">
            <Image
              src={imgError || !imageUrl ? generateItemImageUrl(id, title, category) : imageUrl}
              alt={title}
              fill
              className="object-cover"
              onError={() => setImgError(true)}
              unoptimized
            />
            {!available && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="text-white font-bold text-lg">Nicht verfügbar</span>
              </div>
            )}
            
            {/* Watch Button */}
            <button
              onClick={handleWatchClick}
              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:shadow-md transition-shadow"
              aria-label="Zur Beobachtungsliste hinzufügen"
            >
              <Heart
                className={`w-5 h-5 ${watched ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
              />
            </button>
          </div>

          {/* Content */}
          <div className="p-3">
            {/* Title */}
            <h3 className="text-sm font-normal text-gray-900 line-clamp-2 mb-1 hover:text-blue-600">
              {title}
            </h3>

            {/* Price */}
            <div className="mb-2">
              {pricePerDay && (
                <div className="text-lg font-bold text-gray-900">
                  {pricePerDay}€<span className="text-sm font-normal">/Tag</span>
                </div>
              )}
              {pricePerHour && (
                <div className="text-sm text-gray-600">
                  oder {pricePerHour}€/Stunde
                </div>
              )}
            </div>

            {/* Condition & Location */}
            <div className="text-xs text-gray-600 space-y-1">
              <div>Zustand: {condition}</div>
              <div>{location}</div>
            </div>

            {/* Seller Info */}
            <div className="mt-2 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-600">von </span>
                    <span className="text-blue-600 hover:underline truncate">
                      {user.name || 'Unbekannt'}
                    </span>
                  </div>
                  {user.rating && (
                    <CompactRating 
                      rating={user.rating} 
                      reviewCount={user.reviewCount}
                      className="mt-1" 
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-3">
                {viewCount > 0 && (
                  <span>{viewCount} Aufrufe</span>
                )}
                {watched && (
                  <span className="text-red-600">Beobachtet</span>
                )}
              </div>
              {formatTimeLeft() && (
                <div className="flex items-center text-red-600">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTimeLeft()}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}