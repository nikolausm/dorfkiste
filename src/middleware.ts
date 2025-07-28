import { NextRequest, NextResponse } from "next/server";
import { securityMiddleware, shouldBypassSecurity } from "@/lib/security/middleware";

export async function middleware(request: NextRequest) {
  // Apply security middleware to all routes
  const pathname = request.nextUrl.pathname;
  
  // Check if we should bypass security for this path
  if (!shouldBypassSecurity(pathname)) {
    // Apply security middleware (headers, CORS, rate limiting)
    const securityResponse = await securityMiddleware(request);
    
    // If security middleware returned a response (rate limit, CORS preflight), return it
    if (securityResponse.status !== 200 || request.method === 'OPTIONS') {
      return securityResponse;
    }
  }
  
  // Continue with default behavior
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
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}