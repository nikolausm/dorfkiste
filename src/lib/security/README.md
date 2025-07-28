# Security Module Documentation

This module provides comprehensive security features for the Dorfkiste application, including:

- Security Headers (CSP, HSTS, X-Frame-Options, etc.)
- CORS Configuration
- Rate Limiting
- CSRF Protection

## Usage

### 1. Middleware Integration

The security middleware is automatically applied to all routes through `/src/middleware.ts`. It handles:

- Security headers on all responses
- CORS for API routes
- Rate limiting based on endpoint type
- CSRF validation

### 2. API Route Protection

For specific API routes that need custom rate limiting:

```typescript
import { authRateLimit, createSecureResponse } from '@/lib/security';

export async function POST(request: Request) {
  // Apply authentication rate limit
  const rateLimitResult = await authRateLimit(request);
  if (rateLimitResult) {
    return rateLimitResult; // 429 response
  }

  // Your API logic here
  const result = await processLogin(request);
  
  // Return secure response
  return createSecureResponse(result);
}
```

### 3. Rate Limiting Types

Different endpoints have different rate limits:

- **Auth endpoints** (`/api/auth/*`): 5 requests per 15 minutes
- **Password reset**: 3 requests per hour
- **Upload endpoints**: 20 requests per hour
- **Payment endpoints**: 10 requests per 10 minutes
- **Search endpoints**: 30 requests per minute
- **General API**: 100 requests per 15 minutes

### 4. Security Headers

The following security headers are automatically applied:

- **Content-Security-Policy**: Restricts resource loading
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **Strict-Transport-Security**: Forces HTTPS (production only)
- **Permissions-Policy**: Controls browser features
- **Referrer-Policy**: Controls referrer information

### 5. CORS Configuration

CORS is automatically configured for API routes with:

- Allowed origins based on environment
- Credentials support
- Proper preflight handling
- Configurable methods and headers

### 6. Environment Variables

Add these to your `.env.local`:

```env
# Security
SESSION_SECRET=your-secure-session-secret
ALLOWED_ORIGINS=https://dorfkiste.de,https://www.dorfkiste.de

# Rate limiting (uses Redis if available)
REDIS_URL=redis://localhost:6379
```

### 7. Customization

To customize security settings, modify `/src/lib/security/config.ts`:

```typescript
export const securityConfig = {
  // Modify rate limits
  rateLimiting: {
    auth: {
      max: 10, // Increase to 10 attempts
      windowMs: 30 * 60 * 1000, // 30 minutes
    }
  },
  
  // Add allowed origins
  cors: {
    allowedOrigins: [
      ...securityConfig.cors.allowedOrigins,
      'https://admin.dorfkiste.de'
    ]
  }
};
```

### 8. Testing Security Headers

Use tools like:
- [Security Headers](https://securityheaders.com/)
- [Mozilla Observatory](https://observatory.mozilla.org/)
- Chrome DevTools Security tab

### 9. Monitoring

Rate limit violations are logged with:
- IP address or user ID
- Endpoint accessed
- Timestamp
- Remaining time until reset

Check logs for security events:
```typescript
log.security('Rate limit exceeded', { ... });
```

## Security Best Practices

1. **Never disable security headers** without understanding the implications
2. **Keep rate limits strict** for authentication endpoints
3. **Monitor rate limit logs** for potential attacks
4. **Review CSP violations** in browser console
5. **Test CORS configuration** thoroughly
6. **Update allowed origins** carefully in production
7. **Use HTTPS** in production (enforced by HSTS)
8. **Implement CSRF tokens** for state-changing operations