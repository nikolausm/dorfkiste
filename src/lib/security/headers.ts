import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { securityConfig, buildCSPString, buildPermissionsPolicyString } from './config'

/**
 * Apply comprehensive security headers to the response
 */
export function applySecurityHeaders(request: NextRequest, response: NextResponse): NextResponse {
  // Content Security Policy
  const cspString = buildCSPString(securityConfig.csp);
  response.headers.set('Content-Security-Policy', cspString);

  // X-Frame-Options
  response.headers.set('X-Frame-Options', securityConfig.headers.frameOptions);

  // X-Content-Type-Options
  response.headers.set('X-Content-Type-Options', securityConfig.headers.contentTypeOptions);

  // X-XSS-Protection
  response.headers.set('X-XSS-Protection', securityConfig.headers.xssProtection);

  // Referrer-Policy
  response.headers.set('Referrer-Policy', securityConfig.headers.referrerPolicy);

  // Permissions-Policy
  const permissionsPolicyString = buildPermissionsPolicyString(securityConfig.headers.permissionsPolicy);
  response.headers.set('Permissions-Policy', permissionsPolicyString);

  // Strict-Transport-Security (HSTS) - only in production
  if (securityConfig.headers.hsts) {
    const hstsValue = `max-age=${securityConfig.headers.hsts.maxAge}${
      securityConfig.headers.hsts.includeSubDomains ? '; includeSubDomains' : ''
    }${securityConfig.headers.hsts.preload ? '; preload' : ''}`;
    response.headers.set('Strict-Transport-Security', hstsValue);
  }

  // Custom headers
  for (const [key, value] of Object.entries(securityConfig.headers.custom)) {
    response.headers.set(key, value);
  }

  // Remove potentially dangerous headers
  response.headers.delete('X-Powered-By');
  response.headers.delete('Server');

  return response;
}

/**
 * Handle CORS for API routes with comprehensive configuration
 */
export function handleCors(request: NextRequest, response: NextResponse): NextResponse {
  const origin = request.headers.get('origin');
  
  // Check if origin is allowed
  if (origin && securityConfig.cors.allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else if (process.env.NODE_ENV === 'development' && origin) {
    // In development, be more permissive but still validate
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    response.headers.set('Access-Control-Allow-Methods', securityConfig.cors.methods.join(', '));
    response.headers.set('Access-Control-Allow-Headers', securityConfig.cors.allowedHeaders.join(', '));
    response.headers.set('Access-Control-Max-Age', securityConfig.cors.maxAge.toString());
  }
  
  // Set other CORS headers
  if (securityConfig.cors.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  response.headers.set('Access-Control-Expose-Headers', securityConfig.cors.exposedHeaders.join(', '));
  
  return response;
}

/**
 * Combined security middleware for comprehensive protection
 */
export function applySecurityMiddleware(request: NextRequest, response: NextResponse): NextResponse {
  // Apply security headers
  response = applySecurityHeaders(request, response);
  
  // Handle CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response = handleCors(request, response);
  }
  
  return response;
}

/**
 * Security headers middleware for Next.js Edge Runtime
 */
export function securityHeadersMiddleware(request: NextRequest): NextResponse {
  const response = NextResponse.next();
  return applySecurityMiddleware(request, response);
}