/**
 * Security configuration for the Dorfkiste application
 * Provides environment-based security settings
 */

export const securityConfig = {
  // CORS configuration
  cors: {
    // Allowed origins based on environment
    allowedOrigins: process.env.NODE_ENV === 'production' 
      ? (process.env.ALLOWED_ORIGINS?.split(',') || ['https://dorfkiste.de'])
      : ['http://localhost:3000', 'http://localhost:3001'],
    
    credentials: true,
    maxAge: 86400, // 24 hours
    
    // Allowed methods
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    
    // Allowed headers
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-CSRF-Token',
      'X-Session-Id'
    ],
    
    // Exposed headers
    exposedHeaders: ['X-Total-Count', 'X-Page-Count']
  },

  // Content Security Policy configuration
  csp: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'", // Required for Next.js
      "'unsafe-eval'", // Required for Next.js in dev
      "https://js.stripe.com",
      "https://www.paypal.com",
      "https://www.paypalobjects.com",
      "https://www.google-analytics.com",
      "https://www.googletagmanager.com"
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'", // Required for styled components
      "https://fonts.googleapis.com"
    ],
    imgSrc: [
      "'self'",
      "data:",
      "blob:",
      "https://*.supabase.co",
      "https://images.unsplash.com",
      "https://picsum.photos",
      "https://stripe.com",
      "https://www.paypalobjects.com"
    ],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    connectSrc: [
      "'self'",
      "https://*.supabase.co",
      "https://api.stripe.com",
      "https://api.paypal.com",
      "https://api.unsplash.com",
      "wss://*.supabase.co", // WebSocket for real-time
      process.env.NODE_ENV === 'development' ? "ws://localhost:*" : ""
    ].filter(Boolean),
    mediaSrc: ["'self'", "https://*.supabase.co"],
    objectSrc: ["'none'"],
    childSrc: ["'self'", "https://js.stripe.com", "https://www.paypal.com"],
    frameAncestors: ["'none'"],
    formAction: ["'self'"],
    baseUri: ["'self'"],
    manifestSrc: ["'self'"],
    workerSrc: ["'self'", "blob:"],
    upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : undefined
  },

  // Rate limiting configuration
  rateLimiting: {
    // General API rate limit
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      message: 'Zu viele Anfragen von dieser IP, bitte versuchen Sie es später erneut.',
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: false
    },

    // Strict rate limit for authentication endpoints
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // Limit each IP to 5 requests per windowMs
      message: 'Zu viele Anmeldeversuche, bitte versuchen Sie es in 15 Minuten erneut.',
      standardHeaders: true,
      legacyHeaders: false,
      skipFailedRequests: false
    },

    // Rate limit for password reset endpoints
    passwordReset: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 3, // Limit each IP to 3 password reset requests per hour
      message: 'Zu viele Passwort-Zurücksetzungsanfragen, bitte versuchen Sie es später erneut.',
      standardHeaders: true,
      legacyHeaders: false
    },

    // Rate limit for file uploads
    upload: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 20, // Limit each IP to 20 upload requests per hour
      message: 'Upload-Limit erreicht, bitte versuchen Sie es später erneut.',
      standardHeaders: true,
      legacyHeaders: false
    },

    // Rate limit for payment endpoints
    payment: {
      windowMs: 10 * 60 * 1000, // 10 minutes
      max: 10, // Limit each IP to 10 payment requests per 10 minutes
      message: 'Zu viele Zahlungsanfragen, bitte versuchen Sie es später erneut.',
      standardHeaders: true,
      legacyHeaders: false
    },

    // Rate limit for search/listing endpoints
    search: {
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 30, // Limit each IP to 30 search requests per minute
      message: 'Zu viele Suchanfragen, bitte versuchen Sie es später erneut.',
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: true
    }
  },

  // Security headers configuration
  headers: {
    // X-Frame-Options
    frameOptions: 'DENY',
    
    // X-Content-Type-Options
    contentTypeOptions: 'nosniff',
    
    // X-XSS-Protection (legacy but still useful)
    xssProtection: '1; mode=block',
    
    // Referrer-Policy
    referrerPolicy: 'strict-origin-when-cross-origin',
    
    // Permissions-Policy
    permissionsPolicy: {
      camera: ['none'],
      microphone: ['none'],
      geolocation: ['self'],
      payment: ['self', 'https://js.stripe.com', 'https://www.paypal.com']
    },
    
    // Strict-Transport-Security (HSTS)
    hsts: process.env.NODE_ENV === 'production' ? {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    } : undefined,
    
    // Additional custom headers
    custom: {
      'X-DNS-Prefetch-Control': 'on',
      'X-Permitted-Cross-Domain-Policies': 'none'
    }
  },

  // Session configuration
  session: {
    name: 'dorfkiste.sid',
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    }
  },

  // CSRF protection configuration
  csrf: {
    enabled: true,
    tokenLength: 32,
    cookieName: 'csrf-token',
    headerName: 'X-CSRF-Token',
    excludedRoutes: ['/api/webhook', '/api/health', '/api/monitoring']
  }
};

// Helper function to build CSP string
export function buildCSPString(csp: typeof securityConfig.csp): string {
  const directives: string[] = [];
  
  for (const [key, value] of Object.entries(csp)) {
    if (value && Array.isArray(value) && value.length > 0) {
      const directiveName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      directives.push(`${directiveName} ${value.join(' ')}`);
    }
  }
  
  return directives.join('; ');
}

// Helper function to build Permissions-Policy string
export function buildPermissionsPolicyString(policy: typeof securityConfig.headers.permissionsPolicy): string {
  const directives: string[] = [];
  
  for (const [key, value] of Object.entries(policy)) {
    if (Array.isArray(value)) {
      const allowList = value.map(v => v === 'none' ? '' : `"${v}"`).filter(Boolean).join(' ');
      directives.push(`${key}=(${allowList || ''})`);
    }
  }
  
  return directives.join(', ');
}