import { rateLimiter, getRateLimitType, RATE_LIMITS } from '../rate-limit';

// Mock Next.js Request for testing
global.Request = class MockRequest {
  constructor(input: string, options?: any) {
    this.url = input;
    this.headers = new Map(Object.entries(options?.headers || {}));
  }
  url: string;
  headers: Map<string, string>;
};

// Mock Next.js Response for testing
global.Response = class MockResponse {
  constructor(body?: any, options?: any) {
    this.body = body;
    this.status = options?.status || 200;
    this.headers = new Map(Object.entries(options?.headers || {}));
  }
  body: any;
  status: number;
  headers: Map<string, string>;
};

// Mock NextRequest
class MockNextRequest {
  constructor(url: string, options?: any) {
    this.url = url;
    this.nextUrl = { pathname: new URL(url).pathname };
    const headers = options?.headers || {};
    this.headers = {
      get: (key: string) => headers[key] || null,
    };
  }
  url: string;
  nextUrl: { pathname: string };
  headers: { get: (key: string) => string | null };
}

// Mock atob for JWT decoding in tests
global.atob = global.atob || ((str: string) => Buffer.from(str, 'base64').toString('binary'));

// Mock Redis to test fallback to memory
jest.mock('ioredis', () => {
  return {
    __esModule: true,
    default: jest.fn(() => ({
      ping: jest.fn().mockRejectedValue(new Error('Redis unavailable')),
      pipeline: jest.fn(),
      quit: jest.fn(),
    })),
  };
});

describe('Rate Limiting System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRateLimitType', () => {
    test('should identify authentication endpoints', () => {
      expect(getRateLimitType('/api/auth/register')).toBe('AUTHENTICATION');
      expect(getRateLimitType('/api/auth/forgot-password')).toBe('AUTHENTICATION');
      expect(getRateLimitType('/api/auth/reset-password')).toBe('AUTHENTICATION');
    });

    test('should identify payment endpoints', () => {
      expect(getRateLimitType('/api/payments/create-intent')).toBe('PAYMENT');
      expect(getRateLimitType('/api/payments/stripe-key')).toBe('PAYMENT');
    });

    test('should identify file upload endpoints', () => {
      expect(getRateLimitType('/api/upload')).toBe('FILE_UPLOAD');
      expect(getRateLimitType('/api/analyze-image')).toBe('FILE_UPLOAD');
    });

    test('should identify search/browse endpoints', () => {
      expect(getRateLimitType('/api/items')).toBe('SEARCH_BROWSE');
      expect(getRateLimitType('/api/categories')).toBe('SEARCH_BROWSE');
      expect(getRateLimitType('/api/watchlist')).toBe('SEARCH_BROWSE');
    });

    test('should identify admin endpoints', () => {
      expect(getRateLimitType('/api/admin/stats')).toBe('ADMIN');
      expect(getRateLimitType('/api/admin/settings')).toBe('ADMIN');
    });

    test('should default to general API for other endpoints', () => {
      expect(getRateLimitType('/api/users/123')).toBe('GENERAL_API');
      expect(getRateLimitType('/api/messages')).toBe('GENERAL_API');
    });
  });

  describe('Rate Limiter', () => {
    const createMockRequest = (ip: string = '127.0.0.1', path: string = '/api/test') => {
      return new MockNextRequest(`http://localhost:3000${path}`, {
        headers: {
          'x-forwarded-for': ip,
        },
      }) as any;
    };

    test('should allow requests within limit', async () => {
      const request = createMockRequest('192.168.1.1', '/api/auth/register');
      
      const result = await rateLimiter.checkRateLimit(request, 'AUTHENTICATION');
      
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(RATE_LIMITS.AUTHENTICATION.requests - 1);
      expect(typeof result.resetTime).toBe('number');
    });

    test('should reject requests exceeding limit', async () => {
      const request = createMockRequest('192.168.1.2', '/api/auth/register');
      
      // Make requests up to the limit
      for (let i = 0; i < RATE_LIMITS.AUTHENTICATION.requests; i++) {
        await rateLimiter.checkRateLimit(request, 'AUTHENTICATION');
      }
      
      // This should be rejected
      const result = await rateLimiter.checkRateLimit(request, 'AUTHENTICATION');
      
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.message).toBe(RATE_LIMITS.AUTHENTICATION.message);
    });

    test('should handle different IPs separately', async () => {
      const request1 = createMockRequest('192.168.1.3', '/api/auth/register');
      const request2 = createMockRequest('192.168.1.4', '/api/auth/register');
      
      // Exhaust limit for first IP
      for (let i = 0; i < RATE_LIMITS.AUTHENTICATION.requests; i++) {
        await rateLimiter.checkRateLimit(request1, 'AUTHENTICATION');
      }
      
      // First IP should be blocked
      const result1 = await rateLimiter.checkRateLimit(request1, 'AUTHENTICATION');
      expect(result1.success).toBe(false);
      
      // Second IP should still work
      const result2 = await rateLimiter.checkRateLimit(request2, 'AUTHENTICATION');
      expect(result2.success).toBe(true);
    });

    test('should handle user-based limiting with JWT', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      
      const request = new MockNextRequest('http://localhost:3000/api/test', {
        headers: {
          'authorization': `Bearer ${mockToken}`,
          'x-forwarded-for': '192.168.1.5',
        },
      }) as any;
      
      const result = await rateLimiter.checkRateLimit(request, 'GENERAL_API');
      expect(result.success).toBe(true);
    });

    test('should complete rate limit check under 5ms', async () => {
      const request = createMockRequest('192.168.1.6', '/api/test');
      
      const start = Date.now();
      await rateLimiter.checkRateLimit(request, 'GENERAL_API');
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(5);
    });

    test('should handle different rate limit types correctly', async () => {
      const request = createMockRequest('192.168.1.7');
      
      // Test different limits
      const authResult = await rateLimiter.checkRateLimit(request, 'AUTHENTICATION');
      expect(authResult.remaining).toBe(RATE_LIMITS.AUTHENTICATION.requests - 1);
      
      const paymentResult = await rateLimiter.checkRateLimit(request, 'PAYMENT');
      expect(paymentResult.remaining).toBe(RATE_LIMITS.PAYMENT.requests - 1);
      
      const generalResult = await rateLimiter.checkRateLimit(request, 'GENERAL_API');
      expect(generalResult.remaining).toBe(RATE_LIMITS.GENERAL_API.requests - 1);
    });
  });

  describe('Performance Requirements', () => {
    test('should maintain performance under load', async () => {
      const requests = Array.from({ length: 50 }, (_, i) => 
        createMockRequest(`192.168.2.${i}`, '/api/test')
      );
      
      const start = Date.now();
      
      await Promise.all(
        requests.map(request => 
          rateLimiter.checkRateLimit(request, 'GENERAL_API')
        )
      );
      
      const duration = Date.now() - start;
      const avgTime = duration / requests.length;
      
      expect(avgTime).toBeLessThan(5); // Average should be under 5ms
    });
  });

  function createMockRequest(ip: string, path: string = '/api/test') {
    return new MockNextRequest(`http://localhost:3000${path}`, {
      headers: {
        'x-forwarded-for': ip,
      },
    }) as any;
  }
});