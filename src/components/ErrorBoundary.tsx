"use client"

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  level?: 'global' | 'component'
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  public render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      const isGlobal = this.props.level === 'global'

      return (
        <div className={`flex flex-col items-center justify-center p-8 ${
          isGlobal ? 'min-h-screen bg-gray-50' : 'min-h-[400px] bg-white border border-red-200 rounded-lg'
        }`}>
          <div className="max-w-md text-center">
            <div className="mb-6">
              <AlertTriangle 
                className="w-16 h-16 text-red-500 mx-auto mb-4" 
                aria-hidden="true"
              />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isGlobal ? 'Etwas ist schiefgelaufen' : 'Fehler beim Laden'}
              </h2>
              <p className="text-gray-600">
                {isGlobal 
                  ? 'Es tut uns leid, aber ein unerwarteter Fehler ist aufgetreten.'
                  : 'Dieser Bereich konnte nicht geladen werden.'
                }
              </p>
            </div>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left bg-gray-100 p-4 rounded-lg">
                <summary className="cursor-pointer font-medium text-gray-800 mb-2">
                  Fehlerdetails
                </summary>
                <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-auto">
                  {this.state.error.message}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Seite neu laden"
              >
                <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                Erneut versuchen
              </button>
              
              {isGlobal && (
                <button
                  onClick={this.handleGoHome}
                  className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  aria-label="Zur Startseite"
                >
                  <Home className="w-4 h-4 mr-2" aria-hidden="true" />
                  Zur Startseite
                </button>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Component-level error boundary with smaller design
export function ComponentErrorBoundary({ children, onError }: { 
  children: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void 
}) {
  return (
    <ErrorBoundary level="component" onError={onError}>
      {children}
    </ErrorBoundary>
  )
}

// Global error boundary for app-wide errors
export function GlobalErrorBoundary({ children, onError }: { 
  children: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void 
}) {
  return (
    <ErrorBoundary level="global" onError={onError}>
      {children}
    </ErrorBoundary>
  )
}