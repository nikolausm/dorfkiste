# Integration Test Plan - Security & Validation Fixes

## Overview
This document outlines the integration test plan for the security and validation fixes implemented across the Dorfkiste application.

## Test Scope

### 1. Security Middleware Integration
- **Location**: `/src/middleware.ts` and `/src/lib/security/`
- **Components**:
  - Security headers (CSP, HSTS, X-Frame-Options)
  - CORS configuration
  - Rate limiting
  - CSRF protection

### 2. API Validation Middleware
- **Location**: `/src/lib/validation-middleware.ts`
- **Components**:
  - Authentication validation
  - Request body validation
  - Query parameter validation
  - Ownership validation
  - Error handling wrapper

### 3. Items API Integration
- **Location**: `/src/app/api/items/route.ts`
- **Integration Points**:
  - Enhanced validation schemas
  - Rate limiting (search and general API)
  - Error handling with `withApiErrorHandling`
  - Security headers via middleware

## Test Scenarios

### Security Tests

#### 1. Rate Limiting
```bash
# Test authentication rate limiting (5 attempts per 15 min)
for i in {1..6}; do curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"test123"}'; done
# Expected: 6th request returns 429 with Retry-After header
```

#### 2. Security Headers
```bash
# Check security headers
curl -I http://localhost:3000/api/items
# Expected headers:
# - X-Content-Type-Options: nosniff
# - X-Frame-Options: DENY
# - X-XSS-Protection: 1; mode=block
# - Content-Security-Policy: [policy]
# - Referrer-Policy: origin-when-cross-origin
```

#### 3. CORS
```bash
# Test CORS preflight
curl -X OPTIONS http://localhost:3000/api/items -H "Origin: https://dorfkiste.de" -H "Access-Control-Request-Method: GET"
# Expected: 200 with Access-Control-Allow-Origin header
```

### Validation Tests

#### 1. Authentication Required
```bash
# Test unauthenticated request
curl -X POST http://localhost:3000/api/items -H "Content-Type: application/json" -d '{"title":"Test"}'
# Expected: 401 Unauthorized
```

#### 2. Input Validation
```bash
# Test invalid input
curl -X POST http://localhost:3000/api/items -H "Authorization: Bearer [token]" -H "Content-Type: application/json" -d '{"title":"","pricePerDay":-10}'
# Expected: 400 with validation errors
```

#### 3. Query Parameter Validation
```bash
# Test invalid query parameters
curl "http://localhost:3000/api/items?page=0&limit=200"
# Expected: 400 with validation errors (page must be >= 1, limit must be <= 100)
```

### Integration Tests

#### 1. Full Request Flow
```javascript
// Test complete request flow with all middleware
describe('API Integration', () => {
  it('should handle valid request with all security measures', async () => {
    const response = await fetch('/api/items', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test Item',
        description: 'Test Description',
        categoryId: 'valid-uuid',
        pricePerDay: 10,
        location: 'Test Location',
        imageUrls: ['https://example.com/image.jpg']
      })
    });
    
    expect(response.status).toBe(201);
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
  });
});
```

#### 2. Error Handling Chain
```javascript
// Test error propagation through middleware
describe('Error Handling', () => {
  it('should handle database errors gracefully', async () => {
    // Mock prisma to throw error
    jest.spyOn(prisma.item, 'create').mockRejectedValue(new Error('DB Error'));
    
    const response = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer valid-token' },
      body: JSON.stringify(validItemData)
    });
    
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Internal server error');
    expect(data.timestamp).toBeDefined();
  });
});
```

## Performance Tests

### 1. Rate Limiter Performance
```javascript
// Verify <5ms response time
const start = Date.now();
await rateLimiter.checkRateLimit(request, 'GENERAL_API');
const duration = Date.now() - start;
expect(duration).toBeLessThan(5);
```

### 2. Concurrent Request Handling
```javascript
// Test 50 concurrent requests
const requests = Array(50).fill(null).map(() => 
  fetch('/api/items?q=test')
);
const results = await Promise.all(requests);
// All should complete within reasonable time
```

## Regression Tests

### 1. Existing Functionality
- Verify item creation still works
- Verify search functionality unchanged
- Verify pagination still functions
- Verify category filtering works

### 2. Breaking Changes
- No existing API contracts broken
- All existing query parameters still supported
- Response formats unchanged

## Security Audit Checklist

- [ ] No sensitive data in logs
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] Rate limiting prevents brute force
- [ ] CSRF protection on state-changing operations
- [ ] Proper error messages (no stack traces in production)
- [ ] Request size limits enforced
- [ ] Authentication properly validated
- [ ] Authorization checks for resources

## Monitoring & Alerting

### 1. Rate Limit Monitoring
```javascript
// Log rate limit violations
log.security('Rate limit exceeded', {
  ip: request.ip,
  endpoint: pathname,
  userId: userId,
  remaining: 0,
  resetTime: resetTime
});
```

### 2. Security Event Tracking
- Monitor 429 responses
- Track authentication failures
- Log validation errors
- Alert on suspicious patterns

## Deployment Checklist

1. **Environment Variables**
   - [ ] SESSION_SECRET configured
   - [ ] ALLOWED_ORIGINS set correctly
   - [ ] Redis URL configured (optional)

2. **Production Settings**
   - [ ] HSTS enabled in production
   - [ ] CSP policy reviewed
   - [ ] Rate limits appropriate for load

3. **Testing**
   - [ ] All integration tests pass
   - [ ] Performance benchmarks met
   - [ ] Security headers validated

## Known Issues & Limitations

1. **In-Memory Rate Limiting**: Current implementation uses in-memory storage. For production, Redis is recommended.
2. **CSRF Token**: Currently relies on origin validation. Consider implementing token-based CSRF for enhanced security.
3. **Build Error**: There's a duplicate export issue in email-service.ts that needs resolution.

## Recommendations

1. **Immediate Actions**:
   - Fix the duplicate export in email-service.ts
   - Add integration tests for all security features
   - Deploy with monitoring enabled

2. **Future Improvements**:
   - Implement Redis for distributed rate limiting
   - Add request signing for API-to-API calls
   - Implement more sophisticated CSRF protection
   - Add security scanning to CI/CD pipeline

## Conclusion

The security and validation implementations are comprehensive and follow best practices. All major security concerns have been addressed:

- ✅ Rate limiting implemented with different tiers
- ✅ Security headers properly configured
- ✅ CORS configured for API routes
- ✅ Input validation with Zod schemas
- ✅ Authentication and authorization checks
- ✅ Error handling standardized
- ✅ Request size limits enforced

The system is ready for production deployment after resolving the build error and adding comprehensive integration tests.