"use client"

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastState {
  toasts: Toast[]
}

type ToastAction = 
  | { type: 'ADD_TOAST'; toast: Toast }
  | { type: 'REMOVE_TOAST'; id: string }
  | { type: 'CLEAR_ALL' }

const toastReducer = (state: ToastState, action: ToastAction): ToastState => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, action.toast]
      }
    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.id)
      }
    case 'CLEAR_ALL':
      return {
        ...state,
        toasts: []
      }
    default:
      return state
  }
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearAll: () => void
  // Convenience methods
  success: (title: string, message?: string, options?: Partial<Toast>) => void
  error: (title: string, message?: string, options?: Partial<Toast>) => void
  warning: (title: string, message?: string, options?: Partial<Toast>) => void
  info: (title: string, message?: string, options?: Partial<Toast>) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(toastReducer, { toasts: [] })

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 11)
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast
    }
    
    dispatch({ type: 'ADD_TOAST', toast: newToast })

    // Auto-remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', id })
      }, newToast.duration)
    }
  }, [])

  const removeToast = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TOAST', id })
  }, [])

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' })
  }, [])

  // Convenience methods
  const success = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    addToast({ type: 'success', title, message, ...options })
  }, [addToast])

  const error = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    addToast({ type: 'error', title, message, duration: 8000, ...options })
  }, [addToast])

  const warning = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    addToast({ type: 'warning', title, message, duration: 6000, ...options })
  }, [addToast])

  const info = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    addToast({ type: 'info', title, message, ...options })
  }, [addToast])

  const value: ToastContextValue = {
    toasts: state.toasts,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div 
      className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none"
      aria-live="polite"
      aria-label="Benachrichtigungen"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

interface ToastItemProps {
  toast: Toast
  onRemove: (id: string) => void
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const [isLeaving, setIsLeaving] = React.useState(false)

  useEffect(() => {
    // Trigger animation on mount
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  const handleRemove = () => {
    setIsLeaving(true)
    setTimeout(() => onRemove(toast.id), 300)
  }

  const getToastStyles = () => {
    const base = "flex items-start p-4 rounded-lg shadow-lg border pointer-events-auto transform transition-all duration-300 ease-out"
    
    if (isLeaving) {
      return `${base} translate-x-full opacity-0`
    }
    
    if (!isVisible) {
      return `${base} translate-x-full opacity-0`
    }

    const typeStyles = {
      success: "bg-green-50 border-green-200 text-green-800",
      error: "bg-red-50 border-red-200 text-red-800",
      warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
      info: "bg-blue-50 border-blue-200 text-blue-800"
    }

    return `${base} translate-x-0 opacity-100 ${typeStyles[toast.type]}`
  }

  const getIcon = () => {
    const iconProps = { className: "w-5 h-5 flex-shrink-0 mt-0.5", 'aria-hidden': true }
    
    switch (toast.type) {
      case 'success':
        return <CheckCircle {...iconProps} />
      case 'error':
        return <AlertCircle {...iconProps} />
      case 'warning':
        return <AlertTriangle {...iconProps} />
      case 'info':
        return <Info {...iconProps} />
    }
  }

  return (
    <div className={getToastStyles()} role="alert">
      {getIcon()}
      
      <div className="ml-3 flex-1 min-w-0">
        <p className="text-sm font-medium">
          {toast.title}
        </p>
        {toast.message && (
          <p className="mt-1 text-sm opacity-90">
            {toast.message}
          </p>
        )}
        {toast.action && (
          <div className="mt-2">
            <button
              onClick={toast.action.onClick}
              className="text-sm underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded"
            >
              {toast.action.label}
            </button>
          </div>
        )}
      </div>

      <button
        onClick={handleRemove}
        className="ml-4 inline-flex flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded p-1"
        aria-label="Benachrichtigung schließen"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  )
}