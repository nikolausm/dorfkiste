import { NextRequest } from 'next/server';

// Rate limit configurations for different endpoint types
export const RATE_LIMITS = {
  AUTHENTICATION: {
    requests: 5,
    window: 60 * 1000, // 1 minute
    message: 'Too many authentication attempts. Please try again in 1 minute.',
  },
  SEARCH_BROWSE: {
    requests: 100,
    window: 60 * 1000, // 1 minute
    message: 'Too many search requests. Please try again in 1 minute.',
  },
  PAYMENT: {
    requests: 10,
    window: 60 * 60 * 1000, // 1 hour
    message: 'Too many payment attempts. Please try again in 1 hour.',
  },
  FILE_UPLOAD: {
    requests: 20,
    window: 60 * 60 * 1000, // 1 hour
    message: 'Upload limit exceeded. Please try again in 1 hour.',
  },
  GENERAL_API: {
    requests: 60,
    window: 60 * 1000, // 1 minute
    message: 'API rate limit exceeded. Please try again in 1 minute.',
  },
  ADMIN: {
    requests: 30,
    window: 60 * 1000, // 1 minute
    message: 'Admin API rate limit exceeded.',
  },
} as const;

export type RateLimitType = keyof typeof RATE_LIMITS;

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  message?: string;
}

interface RateLimitOptions {
  requests: number;
  window: number;
  message: string;
}

class RateLimiter {
  private memoryStore = new Map<string, { count: number; resetTime: number }>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Edge Runtime doesn't support Redis, use memory-based rate limiting
    console.log('ℹ️ Using memory-based rate limiting (Edge Runtime)');
    this.startMemoryCleanup();
  }

  private startMemoryCleanup() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.memoryStore.entries()) {
        if (value.resetTime <= now) {
          this.memoryStore.delete(key);
        }
      }
    }, 5 * 60 * 1000);
  }

  private getClientIdentifier(request: NextRequest): string {
    // Try to get user ID from session/token first
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      try {
        // Extract user ID from JWT if available
        const token = authHeader.replace('Bearer ', '');
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          throw new Error('Invalid token format');
        }
        const payload = JSON.parse(atob(tokenParts[1]));
        if (payload.sub || payload.userId) {
          return `user:${payload.sub || payload.userId}`;
        }
      } catch {
        // Invalid token, fall back to IP
      }
    }

    // Fall back to IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = (forwarded && typeof forwarded === 'string' ? forwarded.split(',')[0] : null) || realIp || '127.0.0.1';
    
    return `ip:${ip}`;
  }


  private rateLimitWithMemory(
    key: string,
    options: RateLimitOptions
  ): RateLimitResult {
    const now = Date.now();
    const window = Math.floor(now / options.window);
    const windowKey = `${key}:${window}`;
    
    const existing = this.memoryStore.get(windowKey);
    const count = existing ? existing.count + 1 : 1;
    const resetTime = (window + 1) * options.window;

    this.memoryStore.set(windowKey, { count, resetTime });

    if (count > options.requests) {
      return {
        success: false,
        remaining: 0,
        resetTime,
        message: options.message,
      };
    }

    return {
      success: true,
      remaining: Math.max(0, options.requests - count),
      resetTime,
    };
  }

  async checkRateLimit(
    request: NextRequest,
    limitType: RateLimitType
  ): Promise<RateLimitResult> {
    const startTime = Date.now();
    
    const identifier = this.getClientIdentifier(request);
    const key = `${typeof limitType === 'string' ? limitType.toLowerCase() : limitType}:${identifier}`;
    const options = RATE_LIMITS[limitType];

    const result = this.rateLimitWithMemory(key, options);

    // Ensure we meet the <5ms performance requirement
    const duration = Date.now() - startTime;
    if (duration > 5) {
      console.warn(`Rate limit check took ${duration}ms for ${key}`);
    }

    return result;
  }

  async cleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

export { rateLimiter };

// Helper function to determine rate limit type based on path
export function getRateLimitType(pathname: string): RateLimitType {
  // Authentication endpoints
  if (pathname.includes('/api/auth/') || 
      pathname.includes('/api/auth/register') ||
      pathname.includes('/api/auth/forgot-password') ||
      pathname.includes('/api/auth/reset-password')) {
    return 'AUTHENTICATION';
  }

  // Payment endpoints
  if (pathname.includes('/api/payments/')) {
    return 'PAYMENT';
  }

  // File upload endpoints
  if (pathname.includes('/api/upload') || 
      pathname.includes('/api/analyze-image')) {
    return 'FILE_UPLOAD';
  }

  // Search and browse endpoints
  if (pathname.includes('/api/items') || 
      pathname.includes('/api/categories') ||
      pathname.includes('/api/watchlist')) {
    return 'SEARCH_BROWSE';
  }

  // Admin endpoints
  if (pathname.includes('/api/admin/')) {
    return 'ADMIN';
  }

  // Default for all other API endpoints
  return 'GENERAL_API';
}

// Middleware helper function
export async function applyRateLimit(request: NextRequest): Promise<{
  success: boolean;
  response?: Response;
  headers?: Record<string, string>;
}> {
  const pathname = request.nextUrl.pathname;
  
  // Skip rate limiting for non-API routes
  if (!pathname.startsWith('/api/')) {
    return { success: true };
  }

  const limitType = getRateLimitType(pathname);
  const result = await rateLimiter.checkRateLimit(request, limitType);

  const headers = {
    'X-RateLimit-Limit': RATE_LIMITS[limitType].requests.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetTime.toString(),
    'X-RateLimit-Window': RATE_LIMITS[limitType].window.toString(),
  };

  if (!result.success) {
    const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
    
    return {
      success: false,
      response: new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: result.message,
          retryAfter,
          resetTime: result.resetTime,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': retryAfter.toString(),
            ...headers,
          },
        }
      ),
    };
  }

  return { success: true, headers };
}

// Helper for API routes to add rate limit headers
export function addRateLimitHeaders(
  response: Response,
  headers: Record<string, string>
): Response {
  const newHeaders = new Headers(response.headers);
  Object.entries(headers).forEach(([key, value]) => {
    newHeaders.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}