import { NextRequest, NextResponse } from 'next/server'
import { RateLimiterMemory, RateLimiterRedis, RateLimiterRes } from 'rate-limiter-flexible'
import { getRedis } from '@/lib/redis'
import { log } from '@/lib/logger'
import { securityConfig } from './config'

// Convert our config format to rate-limiter-flexible format
const convertRateLimitConfig = (config: typeof securityConfig.rateLimiting.general) => ({
  points: config.max,
  duration: Math.floor(config.windowMs / 1000), // Convert ms to seconds
  blockDuration: Math.floor(config.windowMs / 1000),
})

// Rate limiter configurations for different endpoints
export const rateLimitConfigs = {
  // General API endpoints
  general: convertRateLimitConfig(securityConfig.rateLimiting.general),
  
  // Strict limits for authentication endpoints
  auth: convertRateLimitConfig(securityConfig.rateLimiting.auth),
  
  // Very strict limits for password reset
  passwordReset: convertRateLimitConfig(securityConfig.rateLimiting.passwordReset),
  
  // Upload endpoints
  upload: convertRateLimitConfig(securityConfig.rateLimiting.upload),
  
  // Payment endpoints
  payment: convertRateLimitConfig(securityConfig.rateLimiting.payment),
  
  // Search/listing endpoints
  search: convertRateLimitConfig(securityConfig.rateLimiting.search),
  
  // Backwards compatibility aliases
  api: convertRateLimitConfig(securityConfig.rateLimiting.general),
  public: convertRateLimitConfig(securityConfig.rateLimiting.search),
}

// Create rate limiter instances
const createRateLimiter = async (name: string, config: typeof rateLimitConfigs.auth) => {
  // Try to use Redis if available, otherwise fall back to memory
  const redisClient = await getRedis()
  
  if (redisClient) {
    return new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: `rate_limit_${name}`,
      points: config.points,
      duration: config.duration,
      blockDuration: config.blockDuration,
    })
  } else {
    return new RateLimiterMemory({
      keyPrefix: `rate_limit_${name}`,
      points: config.points,
      duration: config.duration,
      blockDuration: config.blockDuration,
    })
  }
}

// Rate limiter instances cache
const rateLimitersCache: {
  [key: string]: RateLimiterMemory | RateLimiterRedis
} = {}

// Get or create rate limiter
async function getRateLimiter(type: keyof typeof rateLimitConfigs): Promise<RateLimiterMemory | RateLimiterRedis> {
  if (!rateLimitersCache[type]) {
    rateLimitersCache[type] = await createRateLimiter(type, rateLimitConfigs[type])
  }
  return rateLimitersCache[type]!
}

// Get client identifier (IP address or user ID)
export function getClientIdentifier(request: NextRequest, userId?: string): string {
  // Use user ID if available
  if (userId) {
    return `user_${userId}`
  }
  
  // Otherwise use IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : request.ip || 'unknown'
  
  return `ip_${ip}`
}

// Rate limit response with localized messages
export function rateLimitResponse(rateLimiterRes: RateLimiterRes, limiterType: keyof typeof rateLimitConfigs): NextResponse {
  // Get the appropriate message from config
  const configKey = limiterType as keyof typeof securityConfig.rateLimiting;
  const message = securityConfig.rateLimiting[configKey]?.message || 
    'Zu viele Anfragen, bitte versuchen Sie es später erneut.';
  
  const response = NextResponse.json(
    { 
      error: 'Too many requests',
      message: message,
      retryAfter: Math.round(rateLimiterRes.msBeforeNext / 1000) || 60,
    },
    { status: 429 }
  )
  
  // Add rate limit headers as per config
  const config = securityConfig.rateLimiting[configKey];
  if (config?.standardHeaders) {
    response.headers.set('X-RateLimit-Limit', rateLimiterRes.points.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimiterRes.remainingPoints.toString())
    response.headers.set('X-RateLimit-Reset', new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString())
  }
  
  response.headers.set('Retry-After', Math.round(rateLimiterRes.msBeforeNext / 1000).toString())
  
  return response
}

// Apply rate limiting
export async function applyRateLimit(
  request: NextRequest,
  limiterType: keyof typeof rateLimitConfigs,
  userId?: string
): Promise<NextResponse | null> {
  try {
    const identifier = getClientIdentifier(request, userId)
    const rateLimiter = await getRateLimiter(limiterType)
    
    // Consume a point
    await rateLimiter.consume(identifier)
    
    // Log rate limit consumption
    log.debug('Rate limit consumed', {
      type: limiterType,
      identifier,
      path: request.nextUrl.pathname,
      method: request.method,
    })
    
    return null // No rate limit exceeded
  } catch (rateLimiterRes) {
    if (rateLimiterRes instanceof RateLimiterRes) {
      // Log rate limit exceeded
      log.security('Rate limit exceeded', {
        type: limiterType,
        identifier: getClientIdentifier(request, userId),
        path: request.nextUrl.pathname,
        method: request.method,
        points: rateLimiterRes.points,
        consumedPoints: rateLimiterRes.consumedPoints,
        msBeforeNext: rateLimiterRes.msBeforeNext,
      })
      
      return rateLimitResponse(rateLimiterRes, limiterType)
    }
    
    // Handle other errors
    log.error('Rate limiter error', {
      error: rateLimiterRes,
      type: limiterType,
      path: request.nextUrl.pathname,
    })
    
    return null
  }
}

// Rate limit middleware for different route types
export async function authRateLimit(request: NextRequest, userId?: string): Promise<NextResponse | null> {
  return applyRateLimit(request, 'auth', userId)
}

export async function apiRateLimit(request: NextRequest, userId?: string): Promise<NextResponse | null> {
  return applyRateLimit(request, 'api', userId)
}

export async function publicRateLimit(request: NextRequest): Promise<NextResponse | null> {
  return applyRateLimit(request, 'public')
}

export async function passwordResetRateLimit(request: NextRequest): Promise<NextResponse | null> {
  return applyRateLimit(request, 'passwordReset')
}

export async function uploadRateLimit(request: NextRequest, userId?: string): Promise<NextResponse | null> {
  return applyRateLimit(request, 'upload', userId)
}

// New rate limit functions for additional endpoint types
export async function paymentRateLimit(request: NextRequest, userId?: string): Promise<NextResponse | null> {
  return applyRateLimit(request, 'payment', userId)
}

export async function searchRateLimit(request: NextRequest, userId?: string): Promise<NextResponse | null> {
  return applyRateLimit(request, 'search', userId)
}

// Helper to check if path matches rate limit pattern
export function shouldApplyRateLimit(pathname: string): keyof typeof rateLimitConfigs | null {
  // Password reset specific (most restrictive)
  if (pathname.match(/^\/api\/auth\/(forgot-password|reset-password)/)) {
    return 'passwordReset'
  }
  
  // Authentication endpoints
  if (pathname.match(/^\/api\/auth\/(signin|register|login)/)) {
    return 'auth'
  }
  
  // Payment endpoints
  if (pathname.match(/^\/api\/payments?\//)) {
    return 'payment'
  }
  
  // Upload endpoints
  if (pathname.match(/^\/api\/(upload|analyze-image)/)) {
    return 'upload'
  }
  
  // Search/listing endpoints
  if (pathname.match(/^\/api\/(items|categories|search|rentals)$/) && pathname.includes('?')) {
    return 'search'
  }
  
  // General API endpoints
  if (pathname.startsWith('/api/')) {
    return 'general'
  }
  
  return null
}