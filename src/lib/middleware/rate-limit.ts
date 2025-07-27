import { NextRequest, NextResponse } from 'next/server';
import { log } from '../logger';
import { RateLimitLogger } from '../database-logger';

// Rate limit configuration interface
export interface RateLimitConfig {
  limit: number;
  window: number; // in milliseconds
  identifier?: (request: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (request: NextRequest) => string;
  onLimitReached?: (request: NextRequest, identifier: string) => Promise<NextResponse> | NextResponse;
}

// Default configurations for different endpoints
export const RATE_LIMIT_CONFIGS = {
  // Authentication endpoints - strict limits
  auth: {
    limit: 5,
    window: 15 * 60 * 1000, // 15 minutes
  },
  
  // Payment endpoints - moderate limits
  payment: {
    limit: 20,
    window: 60 * 1000, // 1 minute
  },
  
  // API endpoints - generous limits
  api: {
    limit: 100,
    window: 60 * 1000, // 1 minute
  },
  
  // File upload - restrictive limits
  upload: {
    limit: 10,
    window: 60 * 1000, // 1 minute
  },
} as const;

// In-memory store for rate limiting (in production, use Redis)
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class MemoryStore {
  private store = new Map<string, RateLimitEntry>();
  
  async get(key: string): Promise<RateLimitEntry | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    
    // Clean up expired entries
    if (Date.now() > entry.resetTime) {
      this.store.delete(key);
      return null;
    }
    
    return entry;
  }
  
  async set(key: string, entry: RateLimitEntry): Promise<void> {
    this.store.set(key, entry);
  }
  
  async increment(key: string, window: number): Promise<{ count: number; resetTime: number }> {
    const now = Date.now();
    const existing = await this.get(key);
    
    if (!existing) {
      const entry = { count: 1, resetTime: now + window };
      await this.set(key, entry);
      return entry;
    }
    
    existing.count++;
    await this.set(key, existing);
    return existing;
  }
  
  // Clean up expired entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

// Global store instance
const store = new MemoryStore();

// Clean up expired entries every 5 minutes
setInterval(() => store.cleanup(), 5 * 60 * 1000);

// Default identifier generator (IP + User-Agent)
function defaultIdentifier(request: NextRequest): string {
  const ip = getClientIp(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return `${ip}:${typeof userAgent === 'string' ? userAgent.slice(0, 50) : 'unknown'}`;
}

// Extract client IP
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  return (forwarded && typeof forwarded === 'string' ? forwarded.split(',')[0]?.trim() : null) || realIp || 'unknown';
}

// Default key generator
function defaultKeyGenerator(request: NextRequest, identifier: string): string {
  const { pathname } = new URL(request.url);
  return `rate_limit:${pathname}:${identifier}`;
}

// Rate limiting middleware
export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<NextResponse | null> {
  const {
    limit,
    window,
    identifier = defaultIdentifier,
    keyGenerator = defaultKeyGenerator,
    onLimitReached,
  } = config;

  const id = identifier(request);
  const key = keyGenerator(request, id);
  const rateLimitLogger = new RateLimitLogger(id, limit, `${window}ms`);

  try {
    const { count, resetTime } = await store.increment(key, window);
    const remaining = Math.max(0, limit - count);
    const resetTimeSeconds = Math.ceil(resetTime / 1000);

    // Add rate limit headers to response
    const headers = {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': resetTimeSeconds.toString(),
    };

    if (count > limit) {
      // Rate limit exceeded
      rateLimitLogger.violation(count, {
        ip: getClientIp(request),
        userAgent: request.headers.get('user-agent'),
        path: new URL(request.url).pathname,
        method: request.method,
      });

      if (onLimitReached) {
        return await onLimitReached(request, id);
      }

      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many requests. Limit: ${limit} per ${window}ms`,
          retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            ...headers,
            'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Warn when approaching limit (>80%)
    if (count > limit * 0.8) {
      rateLimitLogger.warning(count, {
        ip: getClientIp(request),
        path: new URL(request.url).pathname,
        method: request.method,
      });
    } else {
      rateLimitLogger.success(count, {
        ip: getClientIp(request),
        path: new URL(request.url).pathname,
        method: request.method,
      });
    }

    // Return null to continue processing, but log the attempt
    return null;
  } catch (error) {
    log.error('Rate limiting error', {
      identifier: id,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
      type: 'rate_limit_error',
    });

    // On error, allow the request to proceed
    return null;
  }
}

// Higher-order function to create rate-limited route handlers
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse> | NextResponse,
  config: RateLimitConfig
) {
  return async function rateLimitedHandler(request: NextRequest): Promise<NextResponse> {
    const rateLimitResponse = await rateLimit(request, config);
    
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    return await handler(request);
  };
}

// Predefined rate limit decorators
export function withAuthRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse> | NextResponse
) {
  return withRateLimit(handler, RATE_LIMIT_CONFIGS.auth);
}

export function withPaymentRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse> | NextResponse
) {
  return withRateLimit(handler, RATE_LIMIT_CONFIGS.payment);
}

export function withApiRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse> | NextResponse
) {
  return withRateLimit(handler, RATE_LIMIT_CONFIGS.api);
}

export function withUploadRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse> | NextResponse
) {
  return withRateLimit(handler, RATE_LIMIT_CONFIGS.upload);
}

// User-specific rate limiting (requires authentication)
export function withUserRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse> | NextResponse,
  config: Omit<RateLimitConfig, 'identifier'> & { getUserId: (request: NextRequest) => Promise<string | null> }
) {
  return withRateLimit(handler, {
    ...config,
    identifier: async (request: NextRequest) => {
      const userId = await config.getUserId(request);
      return userId || defaultIdentifier(request);
    },
  });
}