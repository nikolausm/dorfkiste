import { NextRequest, NextResponse } from 'next/server';
import { applySecurityHeaders } from './headers';
import { corsMiddleware, applyCorsHeaders } from './cors';
import { applyRateLimit, shouldApplyRateLimit } from './rate-limit';
import { securityConfig } from './config';
import { log } from '@/lib/logger';

/**
 * Comprehensive security middleware for Next.js
 * Combines security headers, CORS, and rate limiting
 */
export async function securityMiddleware(request: NextRequest): Promise<NextResponse> {
  try {
    // Handle CORS preflight requests first
    const corsResponse = corsMiddleware(request);
    if (corsResponse) {
      // Apply security headers to CORS preflight response
      return applySecurityHeaders(request, corsResponse);
    }

    // Check if rate limiting should be applied
    const rateLimitType = shouldApplyRateLimit(request.nextUrl.pathname);
    if (rateLimitType) {
      // Extract user ID from auth header if available
      const authHeader = request.headers.get('authorization');
      let userId: string | undefined;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        // You might want to decode JWT here to get user ID
        // For now, we'll just use undefined
        userId = undefined;
      }
      
      // Apply rate limiting
      const rateLimitResponse = await applyRateLimit(request, rateLimitType, userId);
      if (rateLimitResponse) {
        // Rate limit exceeded, return 429 response with security headers
        return applySecurityHeaders(request, rateLimitResponse);
      }
    }

    // Continue with the request
    const response = NextResponse.next();
    
    // Apply security headers
    const securedResponse = applySecurityHeaders(request, response);
    
    // Apply CORS headers for API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return applyCorsHeaders(request, securedResponse);
    }
    
    return securedResponse;
  } catch (error) {
    // Log security middleware errors
    log.error('Security middleware error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      path: request.nextUrl.pathname,
      method: request.method
    });
    
    // Continue with basic security headers on error
    const response = NextResponse.next();
    return applySecurityHeaders(request, response);
  }
}

/**
 * Check if the request path should bypass security middleware
 */
export function shouldBypassSecurity(pathname: string): boolean {
  // Static assets
  if (pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    return true;
  }
  
  // Next.js internals
  if (pathname.startsWith('/_next/') || pathname.startsWith('/__nextjs')) {
    return true;
  }
  
  // Health check endpoints (if configured to bypass)
  if (pathname === '/api/health' || pathname === '/api/monitoring') {
    return true;
  }
  
  return false;
}

/**
 * Create a security-enhanced response
 */
export function createSecureResponse(
  body: any,
  init?: ResponseInit
): NextResponse {
  const response = NextResponse.json(body, init);
  
  // Apply basic security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
}

/**
 * Validate request origin for CSRF protection
 */
export function validateOrigin(request: NextRequest): boolean {
  // Skip CSRF for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return true;
  }
  
  // Skip for excluded routes
  const pathname = request.nextUrl.pathname;
  if (securityConfig.csrf.excludedRoutes.some(route => pathname.startsWith(route))) {
    return true;
  }
  
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  
  // In development, be more permissive
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  // Check if origin matches host
  if (origin && host) {
    try {
      const originUrl = new URL(origin);
      return originUrl.host === host;
    } catch {
      return false;
    }
  }
  
  // No origin header (same-origin request)
  return !origin;
}