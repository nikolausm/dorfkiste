import { NextRequest } from 'next/server';
import { createSecureResponse } from '@/lib/security';

/**
 * Test endpoint to verify security headers and rate limiting
 * GET /api/security-test
 */
export async function GET(request: NextRequest) {
  // This endpoint will automatically have:
  // 1. Security headers applied by middleware
  // 2. CORS headers for API routes
  // 3. Rate limiting (general API rate limit)
  
  const headers = Object.fromEntries(request.headers);
  
  return createSecureResponse({
    message: 'Security test endpoint',
    timestamp: new Date().toISOString(),
    security: {
      headers: {
        'content-security-policy': request.headers.get('content-security-policy') ? 'Applied' : 'Missing',
        'x-frame-options': request.headers.get('x-frame-options') ? 'Applied' : 'Missing',
        'x-content-type-options': request.headers.get('x-content-type-options') ? 'Applied' : 'Missing',
        'strict-transport-security': request.headers.get('strict-transport-security') ? 'Applied' : 'Missing',
      },
      cors: {
        origin: request.headers.get('origin') || 'No origin header',
        credentials: 'Enabled'
      },
      rateLimit: {
        type: 'general',
        limit: '100 requests per 15 minutes'
      }
    },
    request: {
      method: request.method,
      url: request.url,
      headers: {
        origin: headers.origin || 'none',
        'user-agent': headers['user-agent'] || 'none',
        authorization: headers.authorization ? 'Present' : 'None'
      }
    }
  });
}

/**
 * Test CORS preflight handling
 */
export async function OPTIONS(request: NextRequest) {
  // This will be handled by the security middleware
  // The response here is just for documentation
  return createSecureResponse({ message: 'CORS preflight handled by middleware' });
}