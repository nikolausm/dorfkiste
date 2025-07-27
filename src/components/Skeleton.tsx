"use client"

import React from 'react'

interface SkeletonProps {
  className?: string
  children?: React.ReactNode
}

export function Skeleton({ className = '', children }: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      aria-hidden="true"
    >
      {children}
    </div>
  )
}

// ItemCard Skeleton for loading states in item lists
export function ItemCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded hover:shadow-lg transition-shadow">
      <div className="relative">
        {/* Image Skeleton */}
        <Skeleton className="aspect-square w-full" />
        
        {/* Content Skeleton */}
        <div className="p-3 space-y-3">
          {/* Title */}
          <Skeleton className="h-4 w-3/4" />
          
          {/* Price */}
          <div className="space-y-1">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
          
          {/* Condition & Location */}
          <div className="space-y-1">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-28" />
          </div>
          
          {/* Seller Info */}
          <div className="pt-2 border-t border-gray-100">
            <Skeleton className="h-3 w-40" />
          </div>
          
          {/* Stats */}
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Detail Page Skeleton for item detail loading
export function DetailPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery Skeleton */}
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded" />
            ))}
          </div>
        </div>
        
        {/* Content Skeleton */}
        <div className="space-y-6">
          {/* Title and Price */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-32" />
          </div>
          
          {/* Details */}
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-3">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          
          {/* Seller Info */}
          <div className="border-t pt-6 space-y-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Profile Page Skeleton
export function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-6">
          <Skeleton className="w-24 h-24 rounded-full" />
          <div className="space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg border">
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
        
        {/* Content Sections */}
        <div className="space-y-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg border">
              <Skeleton className="h-5 w-32 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, j) => (
                  <ItemCardSkeleton key={j} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// List Skeleton for search results, categories, etc.
export function ListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <ItemCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Table Skeleton for admin panels, rental history, etc.
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-3">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {[...Array(columns)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-20" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="px-6 py-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {[...Array(columns)].map((_, j) => (
                <Skeleton key={j} className="h-4 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Form Skeleton for loading forms
export function FormSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded border" />
        </div>
      ))}
      <Skeleton className="h-12 w-32 rounded-lg" />
    </div>
  )
}