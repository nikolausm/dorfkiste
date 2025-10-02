'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';

interface OfferThumbnailProps {
  offer?: {
    id: number;
    title: string;
    isService?: boolean;
    firstPicture?: {
      id: number;
      fileName: string;
      contentType: string;
      displayOrder: number;
    };
  } | null;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  isInactive?: boolean; // New prop to indicate inactive/deleted offers
}

export default function OfferThumbnail({
  offer,
  size = 'medium',
  className = '',
  isInactive = false
}: OfferThumbnailProps) {
  const [imageError, setImageError] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-16 h-16';
      case 'large':
        return 'w-32 h-32';
      case 'medium':
      default:
        return 'w-20 h-20';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 'text-xs';
      case 'large':
        return 'text-sm';
      case 'medium':
      default:
        return 'text-xs';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 'w-6 h-6';
      case 'large':
        return 'w-12 h-12';
      case 'medium':
      default:
        return 'w-8 h-8';
    }
  };

  // Handle case when offer is completely missing/deleted
  if (!offer) {
    return (
      <div className={`${getSizeClasses()} ${className} relative`}>
        <div className="w-full h-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400">
          {/* Archive icon with X overlay */}
          <div className="relative">
            <svg className={`${getIconSize()}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            {/* X overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <span className={`${getTextSize()} font-medium mt-1 text-center leading-tight`}>
            Nicht<br />verfügbar
          </span>
        </div>
      </div>
    );
  }

  // If offer exists but has image
  if (offer.firstPicture && !imageError) {
    return (
      <div className={`${getSizeClasses()} ${className} relative`}>
        {/* Loading spinner overlay */}
        {isImageLoading && (
          <div className="absolute inset-0 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600"></div>
          </div>
        )}

        {/* Actual image */}
        <img
          src={apiClient.getPictureUrl(offer.firstPicture.id)}
          alt={offer.title}
          className={`w-full h-full object-cover rounded-lg border border-gray-200 transition-all duration-200 ${
            isInactive
              ? 'filter grayscale opacity-50'
              : ''
          }`}
          onLoadStart={() => setIsImageLoading(true)}
          onLoad={() => setIsImageLoading(false)}
          onError={() => {
            setImageError(true);
            setIsImageLoading(false);
          }}
        />

        {/* Inactive overlay */}
        {isInactive && !isImageLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg flex items-center justify-center">
            <div className="bg-white bg-opacity-90 px-2 py-1 rounded text-center shadow-sm">
              <span className={`${getTextSize()} font-semibold text-gray-700`}>
                Nicht verfügbar
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default placeholder for offers without images (active or inactive)
  return (
    <div className={`${getSizeClasses()} ${className} relative`}>
      <div className={`w-full h-full rounded-lg border border-gray-200 flex items-center justify-center transition-all duration-200 ${
        isInactive
          ? 'bg-gray-100 filter grayscale opacity-50'
          : 'bg-gray-100'
      } text-gray-400`}>
        {offer.isService ? (
          <svg className={`${getIconSize()}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ) : (
          <svg className={`${getIconSize()}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )}
      </div>

      {/* Inactive overlay for placeholder icons */}
      {isInactive && (
        <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg flex items-center justify-center">
          <div className="bg-white bg-opacity-90 px-2 py-1 rounded text-center shadow-sm">
            <span className={`${getTextSize()} font-semibold text-gray-700`}>
              Nicht verfügbar
            </span>
          </div>
        </div>
      )}
    </div>
  );
}