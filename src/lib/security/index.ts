/**
 * Security module exports
 * Provides comprehensive security utilities for the Dorfkiste application
 */

// Configuration
export { securityConfig } from './config';

// Headers
export { 
  applySecurityHeaders, 
  handleCors, 
  applySecurityMiddleware,
  securityHeadersMiddleware 
} from './headers';

// CORS
export { 
  corsMiddleware, 
  applyCorsHeaders 
} from './cors';

// Rate limiting
export {
  applyRateLimit,
  authRateLimit,
  apiRateLimit,
  publicRateLimit,
  passwordResetRateLimit,
  uploadRateLimit,
  paymentRateLimit,
  searchRateLimit,
  shouldApplyRateLimit,
  getClientIdentifier,
  rateLimitResponse
} from './rate-limit';

// Main middleware
export { 
  securityMiddleware,
  shouldBypassSecurity,
  createSecureResponse,
  validateOrigin
} from './middleware';

// Types
export type { RateLimiterRes } from 'rate-limiter-flexible';