import { NextRequest, NextResponse } from 'next/server';
import { log, Logger, PerformanceTimer, LogContext } from '../logger';

// Types for middleware configuration
export interface LoggingMiddlewareConfig {
  enableRequestLogging?: boolean;
  enableResponseLogging?: boolean;
  enablePerformanceMetrics?: boolean;
  logRequestBody?: boolean;
  logResponseBody?: boolean;
  excludePaths?: string[];
  maxBodySize?: number;
}

// Default configuration
const DEFAULT_CONFIG: LoggingMiddlewareConfig = {
  enableRequestLogging: true,
  enableResponseLogging: true,
  enablePerformanceMetrics: true,
  logRequestBody: true,
  logResponseBody: false, // Usually too verbose for responses
  excludePaths: ['/api/health', '/favicon.ico'],
  maxBodySize: 1024, // 1KB max for body logging
};

// Extract IP address from request
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const remoteAddr = (forwarded && typeof forwarded === 'string' ? forwarded.split(',')[0] : null) || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
  
  return (forwarded && typeof forwarded === 'string' ? forwarded.split(',')[0]?.trim() : null) || realIp || remoteAddr;
}

// Extract user agent safely
function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown';
}

// Sanitize request/response body for logging
function sanitizeBody(body: any, maxSize: number): any {
  if (!body) return null;
  
  try {
    const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
    if (bodyString.length > maxSize) {
      return `[TRUNCATED - ${bodyString.length} chars, showing first ${maxSize}]: ${typeof bodyString === 'string' ? bodyString.substring(0, maxSize) : '[INVALID_BODY]'}...`;
    }
    return body;
  } catch (error) {
    return '[UNPARSEABLE_BODY]';
  }
}

// Check if path should be excluded from logging
function shouldExcludePath(pathname: string, excludePaths: string[]): boolean {
  return excludePaths.some(path => 
    pathname === path || pathname.startsWith(path + '/')
  );
}

// Request logging middleware wrapper
export function withLogging(
  handler: (request: NextRequest) => Promise<NextResponse> | NextResponse,
  config: LoggingMiddlewareConfig = {}
) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  return async function loggingHandler(request: NextRequest): Promise<NextResponse> {
    const correlationId = Logger.generateCorrelationId();
    const logger = log.child(correlationId);
    const timer = new PerformanceTimer(correlationId);
    
    const { pathname, search } = new URL(request.url);
    const fullPath = pathname + search;
    
    // Skip logging for excluded paths
    if (shouldExcludePath(pathname, mergedConfig.excludePaths || [])) {
      return await handler(request);
    }
    
    // Extract request context
    const requestContext: LogContext = {
      correlationId,
      method: request.method,
      url: fullPath,
      userAgent: getUserAgent(request),
      ip: getClientIp(request),
      headers: Object.fromEntries(request.headers.entries()),
    };
    
    // Log incoming request
    if (mergedConfig.enableRequestLogging) {
      let requestBody = null;
      
      if (mergedConfig.logRequestBody && 
          request.method !== 'GET' && 
          request.method !== 'DELETE') {
        try {
          // Clone request to avoid consuming the body
          const clonedRequest = request.clone();
          const body = await clonedRequest.text();
          requestBody = sanitizeBody(body, mergedConfig.maxBodySize || 1024);
        } catch (error) {
          requestBody = '[ERROR_READING_BODY]';
        }
      }
      
      logger.http('Incoming request', {
        ...requestContext,
        requestBody,
        type: 'request_start'
      });
    }
    
    let response: NextResponse;
    let error: Error | null = null;
    
    try {
      // Add correlation ID to request headers for downstream services
      const modifiedRequest = new NextRequest(request.url, {
        method: request.method,
        headers: {
          ...Object.fromEntries(request.headers.entries()),
          'x-correlation-id': correlationId,
        },
        body: request.body,
      });
      
      response = await handler(modifiedRequest);
      
      // Add correlation ID to response headers
      response.headers.set('x-correlation-id', correlationId);
      
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err));
      
      // Log error
      logger.error('Request handler error', {
        ...requestContext,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      });
      
      // Create error response
      response = NextResponse.json(
        { 
          error: 'Internal Server Error',
          correlationId,
        },
        { 
          status: 500,
          headers: { 'x-correlation-id': correlationId }
        }
      );
    }
    
    // Log response
    if (mergedConfig.enableResponseLogging) {
      const responseTime = timer.end('Request completed', {
        ...requestContext,
        statusCode: response.status,
        type: 'request_end'
      });
      
      const responseContext: LogContext = {
        ...requestContext,
        statusCode: response.status,
        responseTime,
        responseHeaders: Object.fromEntries(response.headers.entries()),
      };
      
      // Log response body if enabled (usually only for errors)
      if (mergedConfig.logResponseBody || response.status >= 400) {
        try {
          const clonedResponse = response.clone();
          const responseBody = await clonedResponse.text();
          responseContext.responseBody = sanitizeBody(
            responseBody, 
            mergedConfig.maxBodySize || 1024
          );
        } catch (bodyError) {
          responseContext.responseBody = '[ERROR_READING_RESPONSE_BODY]';
        }
      }
      
      if (response.status >= 500) {
        logger.error('Server error response', responseContext);
      } else if (response.status >= 400) {
        logger.warn('Client error response', responseContext);
      } else {
        logger.http('Successful response', responseContext);
      }
    }
    
    // Performance monitoring alerts
    if (mergedConfig.enablePerformanceMetrics) {
      const responseTime = performance.now() - timer['startTime'];
      
      if (responseTime > 5000) { // 5 seconds
        logger.warn('Slow request detected', {
          ...requestContext,
          responseTime: Math.round(responseTime),
          threshold: '5000ms',
          type: 'performance_alert'
        });
      }
    }
    
    return response;
  };
}

// API route wrapper for easy integration
export function createLoggingWrapper(config?: LoggingMiddlewareConfig) {
  return function loggingWrapper(
    handler: (request: NextRequest) => Promise<NextResponse> | NextResponse
  ) {
    return withLogging(handler, config);
  };
}

// Express-style middleware for Next.js API routes
export async function loggingMiddleware(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse> | NextResponse,
  config?: LoggingMiddlewareConfig
): Promise<NextResponse> {
  const wrappedHandler = withLogging(handler, config);
  return await wrappedHandler(request);
}

// Quick setup function for route handlers
export function loggedRoute(
  handler: (request: NextRequest) => Promise<NextResponse> | NextResponse,
  config?: LoggingMiddlewareConfig
) {
  return withLogging(handler, config);
}

// Export types
export type { LoggingMiddlewareConfig };