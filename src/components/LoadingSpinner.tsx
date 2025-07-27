"use client"

import React from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

export default function LoadingSpinner({ size = 'md', className = '', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 
        className={`${sizeClasses[size]} animate-spin text-blue-600`}
        aria-hidden="true"
      />
      {text && (
        <p className="mt-2 text-sm text-gray-600" aria-live="polite">
          {text}
        </p>
      )}
      <span className="sr-only">Lädt...</span>
    </div>
  )
}

// Progress indicator for multi-step processes
interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  steps?: string[]
  className?: string
}

export function ProgressIndicator({ 
  currentStep, 
  totalSteps, 
  steps = [], 
  className = '' 
}: ProgressIndicatorProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>Schritt {currentStep} von {totalSteps}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Fortschritt: ${Math.round(progress)} Prozent`}
        />
      </div>

      {steps.length > 0 && (
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`flex items-center text-sm ${
                index < currentStep 
                  ? 'text-green-600' 
                  : index === currentStep 
                    ? 'text-blue-600 font-medium' 
                    : 'text-gray-400'
              }`}
            >
              <div 
                className={`w-2 h-2 rounded-full mr-3 ${
                  index < currentStep 
                    ? 'bg-green-600' 
                    : index === currentStep 
                      ? 'bg-blue-600' 
                      : 'bg-gray-300'
                }`}
                aria-hidden="true"
              />
              {step}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Inline loading state for buttons
interface ButtonLoadingProps {
  loading: boolean
  children: React.ReactNode
  disabled?: boolean
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export function ButtonLoading({ 
  loading, 
  children, 
  disabled, 
  className = '',
  onClick,
  type = 'button'
}: ButtonLoadingProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`relative inline-flex items-center justify-center ${className} ${
        loading || disabled ? 'cursor-not-allowed opacity-75' : ''
      }`}
      aria-disabled={disabled || loading}
    >
      {loading && (
        <Loader2 
          className="w-4 h-4 animate-spin mr-2" 
          aria-hidden="true"
        />
      )}
      {children}
      {loading && <span className="sr-only">Lädt...</span>}
    </button>
  )
}