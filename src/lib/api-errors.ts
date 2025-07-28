import { NextResponse } from 'next/server'
import { z } from 'zod'
import { ValidationError } from '@/lib/validation'

// ==========================================
// ERROR TYPES AND CODES
// ==========================================

export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  
  // Validation
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  
  // Resource
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Server
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  BAD_GATEWAY = 'BAD_GATEWAY',
  
  // Business Logic
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  ITEM_UNAVAILABLE = 'ITEM_UNAVAILABLE',
  RENTAL_CONFLICT = 'RENTAL_CONFLICT',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
}

// ==========================================
// ERROR RESPONSE INTERFACE
// ==========================================

export interface ApiErrorResponse {
  error: {
    code: ErrorCode
    message: string
    details?: ValidationError[] | Record<string, any>
    timestamp: string
    requestId?: string
    path?: string
    method?: string
  }
}

// ==========================================
// ERROR CLASS
// ==========================================

export class ApiError extends Error {
  constructor(
    public code: ErrorCode,
    public statusCode: number,
    message: string,
    public details?: ValidationError[] | Record<string, any>
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// ==========================================
// ERROR FACTORY FUNCTIONS
// ==========================================

export function createErrorResponse(
  error: ApiError | Error | z.ZodError,
  request?: Request
): NextResponse<ApiErrorResponse> {
  let code: ErrorCode
  let statusCode: number
  let message: string
  let details: ValidationError[] | Record<string, any> | undefined
  
  if (error instanceof ApiError) {
    code = error.code
    statusCode = error.statusCode
    message = error.message
    details = error.details
  } else if (error instanceof z.ZodError) {
    code = ErrorCode.VALIDATION_FAILED
    statusCode = 400
    message = 'Validation failed'
    details = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }))
  } else {
    // Generic error
    code = ErrorCode.INTERNAL_ERROR
    statusCode = 500
    message = process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : error.message
  }
  
  const errorResponse: ApiErrorResponse = {
    error: {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
      ...(request && {
        path: new URL(request.url).pathname,
        method: request.method
      })
    }
  }
  
  return NextResponse.json(errorResponse, { status: statusCode })
}

// ==========================================
// COMMON ERROR RESPONSES
// ==========================================

export const ApiErrors = {
  // Authentication & Authorization
  unauthorized: (message = 'Authentication required') => 
    new ApiError(ErrorCode.UNAUTHORIZED, 401, message),
    
  forbidden: (message = 'Access denied') => 
    new ApiError(ErrorCode.FORBIDDEN, 403, message),
    
  invalidCredentials: () => 
    new ApiError(ErrorCode.INVALID_CREDENTIALS, 401, 'Invalid email or password'),
    
  tokenExpired: () => 
    new ApiError(ErrorCode.TOKEN_EXPIRED, 401, 'Token has expired'),
    
  tokenInvalid: () => 
    new ApiError(ErrorCode.TOKEN_INVALID, 401, 'Invalid token'),
  
  // Validation
  validationFailed: (details: ValidationError[]) => 
    new ApiError(ErrorCode.VALIDATION_FAILED, 400, 'Validation failed', details),
    
  invalidInput: (field: string, message: string) => 
    new ApiError(ErrorCode.INVALID_INPUT, 400, message, [{ field, message }]),
    
  missingRequiredField: (field: string) => 
    new ApiError(ErrorCode.MISSING_REQUIRED_FIELD, 400, `${field} is required`, [{ field, message: `${field} is required` }]),
    
  invalidFileType: (allowedTypes: string[]) => 
    new ApiError(ErrorCode.INVALID_FILE_TYPE, 400, `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`),
    
  fileTooLarge: (maxSizeMB: number) => 
    new ApiError(ErrorCode.FILE_TOO_LARGE, 400, `File size exceeds ${maxSizeMB}MB limit`),
  
  // Resource
  notFound: (resource: string) => 
    new ApiError(ErrorCode.NOT_FOUND, 404, `${resource} not found`),
    
  alreadyExists: (resource: string) => 
    new ApiError(ErrorCode.ALREADY_EXISTS, 409, `${resource} already exists`),
    
  conflict: (message: string) => 
    new ApiError(ErrorCode.CONFLICT, 409, message),
  
  // Rate Limiting
  rateLimitExceeded: (retryAfter: number) => 
    new ApiError(ErrorCode.RATE_LIMIT_EXCEEDED, 429, 'Too many requests', { retryAfter }),
  
  // Server
  internalError: (message = 'Internal server error') => 
    new ApiError(ErrorCode.INTERNAL_ERROR, 500, message),
    
  serviceUnavailable: (message = 'Service temporarily unavailable') => 
    new ApiError(ErrorCode.SERVICE_UNAVAILABLE, 503, message),
    
  badGateway: (message = 'Bad gateway') => 
    new ApiError(ErrorCode.BAD_GATEWAY, 502, message),
  
  // Business Logic
  insufficientFunds: (required: number, available: number) => 
    new ApiError(ErrorCode.INSUFFICIENT_FUNDS, 400, 'Insufficient funds', { required, available }),
    
  itemUnavailable: (itemId: string, reason?: string) => 
    new ApiError(ErrorCode.ITEM_UNAVAILABLE, 400, reason || 'Item is not available', { itemId }),
    
  rentalConflict: (message: string) => 
    new ApiError(ErrorCode.RENTAL_CONFLICT, 409, message),
    
  paymentFailed: (reason: string) => 
    new ApiError(ErrorCode.PAYMENT_FAILED, 400, `Payment failed: ${reason}`),
}

// ==========================================
// ERROR HANDLER WRAPPER
// ==========================================

export function withApiErrorHandling<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args)
    } catch (error) {
      console.error('API Error:', error)
      
      // Extract request from args if available
      const request = args.find(arg => arg instanceof Request || arg?.url)
      
      return createErrorResponse(error as Error, request)
    }
  }) as T
}

// ==========================================
// VALIDATION ERROR HELPERS
// ==========================================

export function formatZodErrors(error: z.ZodError): ValidationError[] {
  return error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message
  }))
}

export function createValidationErrorResponse(
  errors: ValidationError[],
  request?: Request
): NextResponse<ApiErrorResponse> {
  return createErrorResponse(ApiErrors.validationFailed(errors), request)
}

// ==========================================
// REQUEST SIZE LIMITS
// ==========================================

export const RequestSizeLimits = {
  JSON_MAX_SIZE: 1 * 1024 * 1024, // 1MB for JSON payloads
  FILE_MAX_SIZE: 10 * 1024 * 1024, // 10MB for file uploads
  TOTAL_MAX_SIZE: 20 * 1024 * 1024, // 20MB total request size
}

// ==========================================
// FILE TYPE VALIDATION
// ==========================================

export const AllowedFileTypes = {
  images: {
    mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    extensions: ['.jpg', '.jpeg', '.png', '.webp'],
    maxSizeMB: 10,
  },
  documents: {
    mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    extensions: ['.pdf', '.doc', '.docx'],
    maxSizeMB: 5,
  },
}

export function validateFileType(
  file: File,
  allowedTypes: typeof AllowedFileTypes.images
): { valid: boolean; error?: ApiError } {
  // Check file type
  if (!allowedTypes.mimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: ApiErrors.invalidFileType(allowedTypes.mimeTypes)
    }
  }
  
  // Check file extension
  const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
  if (!allowedTypes.extensions.includes(extension)) {
    return {
      valid: false,
      error: ApiErrors.invalidFileType(allowedTypes.extensions)
    }
  }
  
  // Check file size
  const maxSizeBytes = allowedTypes.maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: ApiErrors.fileTooLarge(allowedTypes.maxSizeMB)
    }
  }
  
  return { valid: true }
}