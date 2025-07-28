import { NextRequest, NextResponse } from 'next/server';
import { securityConfig } from './config';

/**
 * CORS middleware for API routes
 * Handles preflight requests and sets appropriate CORS headers
 */
export function corsMiddleware(request: NextRequest): NextResponse | null {
  // Only apply CORS to API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return null;
  }

  const origin = request.headers.get('origin');
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });
    
    // Set CORS headers for preflight
    if (origin) {
      if (securityConfig.cors.allowedOrigins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
      } else if (process.env.NODE_ENV === 'development') {
        // More permissive in development
        response.headers.set('Access-Control-Allow-Origin', origin);
      }
    }
    
    response.headers.set('Access-Control-Allow-Methods', securityConfig.cors.methods.join(', '));
    response.headers.set('Access-Control-Allow-Headers', securityConfig.cors.allowedHeaders.join(', '));
    response.headers.set('Access-Control-Max-Age', securityConfig.cors.maxAge.toString());
    
    if (securityConfig.cors.credentials) {
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
    
    return response;
  }
  
  return null;
}

/**
 * Apply CORS headers to a response
 */
export function applyCorsHeaders(request: NextRequest, response: NextResponse): NextResponse {
  const origin = request.headers.get('origin');
  
  if (origin) {
    // Check if origin is allowed
    if (securityConfig.cors.allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    } else if (process.env.NODE_ENV === 'development') {
      // More permissive in development
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
  }
  
  // Always set these headers for actual requests
  if (securityConfig.cors.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  
  response.headers.set('Access-Control-Expose-Headers', securityConfig.cors.exposedHeaders.join(', '));
  
  return response;
}