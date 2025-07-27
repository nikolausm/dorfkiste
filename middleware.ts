import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { applyRateLimit } from './src/lib/rate-limit-edge';

export async function middleware(request: NextRequest) {
  // Apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    try {
      const rateLimitResult = await applyRateLimit(request);
      
      if (!rateLimitResult.success && rateLimitResult.response) {
        return rateLimitResult.response;
      }

      // If rate limit passed, continue with the request but add headers
      const response = NextResponse.next();
      
      if (rateLimitResult.headers) {
        Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      }

      return response;
    } catch (error) {
      console.error('Rate limiting middleware error:', error);
      // Continue without rate limiting if there's an error
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};