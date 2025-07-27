import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { 
  ValidationResult, 
  createValidationErrorResponse,
  validateData 
} from '@/lib/validation';
import { z } from 'zod';

// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
}

/**
 * Validates user authentication and returns user data
 */
export async function validateAuth(requireAdmin: boolean = false): Promise<{
  success: boolean;
  user?: AuthenticatedUser;
  response?: NextResponse;
}> {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return {
        success: false,
        response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      };
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true
      }
    });

    if (!user) {
      return {
        success: false,
        response: NextResponse.json({ error: 'User not found' }, { status: 404 })
      };
    }

    if (requireAdmin && !user.isAdmin) {
      return {
        success: false,
        response: NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
      };
    }

    return {
      success: true,
      user
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      response: NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
    };
  }
}

// ==========================================
// VALIDATION HELPERS
// ==========================================

/**
 * Validates request body with authentication
 */
export async function validateRequestWithAuth<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>,
  requireAdmin: boolean = false
): Promise<{
  success: boolean;
  data?: T;
  user?: AuthenticatedUser;
  response?: NextResponse;
}> {
  // First validate authentication
  const authResult = await validateAuth(requireAdmin);
  
  if (!authResult.success) {
    return {
      success: false,
      response: authResult.response
    };
  }

  // Then validate request body
  try {
    const body = await request.json();
    const validation = validateData(schema, body);
    
    if (!validation.success) {
      return {
        success: false,
        response: createValidationErrorResponse(validation.errors!)
      };
    }

    return {
      success: true,
      data: validation.data,
      user: authResult.user
    };
  } catch (error) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    };
  }
}

/**
 * Validates query parameters with authentication
 */
export async function validateQueryWithAuth<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>,
  requireAdmin: boolean = false
): Promise<{
  success: boolean;
  data?: T;
  user?: AuthenticatedUser;
  response?: NextResponse;
}> {
  // First validate authentication
  const authResult = await validateAuth(requireAdmin);
  
  if (!authResult.success) {
    return {
      success: false,
      response: authResult.response
    };
  }

  // Then validate query parameters
  const { searchParams } = new URL(request.url);
  const queryData = Object.fromEntries(searchParams.entries());
  
  const validation = validateData(schema, queryData);
  
  if (!validation.success) {
    return {
      success: false,
      response: createValidationErrorResponse(validation.errors!)
    };
  }

  return {
    success: true,
    data: validation.data,
    user: authResult.user
  };
}

// ==========================================
// RATE LIMITING MIDDLEWARE
// ==========================================

interface RateLimitConfig {
  requests: number;
  windowMs: number;
  identifier?: string;
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple in-memory rate limiting (should be replaced with Redis in production)
 */
export function rateLimit(config: RateLimitConfig) {
  return (request: NextRequest): NextResponse | null => {
    const now = Date.now();
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const key = config.identifier || ip;
    
    const limit = rateLimitStore.get(key);
    
    if (!limit || now > limit.resetTime) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return null; // Allow request
    }
    
    if (limit.count >= config.requests) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((limit.resetTime - now) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((limit.resetTime - now) / 1000).toString()
          }
        }
      );
    }
    
    limit.count++;
    return null; // Allow request
  };
}

// ==========================================
// OWNERSHIP VALIDATION
// ==========================================

/**
 * Validates that a user owns a specific item
 */
export async function validateItemOwnership(
  itemId: string, 
  userId: string
): Promise<{
  success: boolean;
  item?: any;
  response?: NextResponse;
}> {
  try {
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        user: {
          select: { id: true, name: true }
        }
      }
    });

    if (!item) {
      return {
        success: false,
        response: NextResponse.json({ error: 'Item not found' }, { status: 404 })
      };
    }

    if (item.userId !== userId) {
      return {
        success: false,
        response: NextResponse.json({ error: 'Forbidden - Not item owner' }, { status: 403 })
      };
    }

    return {
      success: true,
      item
    };
  } catch (error) {
    console.error('Ownership validation error:', error);
    return {
      success: false,
      response: NextResponse.json({ error: 'Validation failed' }, { status: 500 })
    };
  }
}

/**
 * Validates that a user is involved in a rental (as owner or renter)
 */
export async function validateRentalAccess(
  rentalId: string, 
  userId: string,
  requireOwner: boolean = false
): Promise<{
  success: boolean;
  rental?: any;
  response?: NextResponse;
}> {
  try {
    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      include: {
        item: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
        },
        renter: {
          select: { id: true, name: true }
        }
      }
    });

    if (!rental) {
      return {
        success: false,
        response: NextResponse.json({ error: 'Rental not found' }, { status: 404 })
      };
    }

    const isOwner = rental.item.userId === userId;
    const isRenter = rental.renterId === userId;

    if (requireOwner && !isOwner) {
      return {
        success: false,
        response: NextResponse.json({ error: 'Forbidden - Item owner access required' }, { status: 403 })
      };
    }

    if (!isOwner && !isRenter) {
      return {
        success: false,
        response: NextResponse.json({ error: 'Forbidden - Not involved in this rental' }, { status: 403 })
      };
    }

    return {
      success: true,
      rental
    };
  } catch (error) {
    console.error('Rental access validation error:', error);
    return {
      success: false,
      response: NextResponse.json({ error: 'Validation failed' }, { status: 500 })
    };
  }
}

// ==========================================
// ERROR HANDLING WRAPPER
// ==========================================

/**
 * Wraps API handlers with standardized error handling
 */
export function withErrorHandling(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error('API Error:', error);
      
      // Log detailed error for debugging (remove in production)
      if (process.env.NODE_ENV === 'development') {
        console.error('Stack trace:', error);
      }
      
      return NextResponse.json(
        { 
          error: 'Internal server error',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
  };
}

// ==========================================
// COMMON VALIDATION SCHEMAS
// ==========================================

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format')
});

export const paginationSchema = z.object({
  page: z.string().optional().default('1').transform(Number).refine(n => n >= 1, 'Page must be >= 1'),
  limit: z.string().optional().default('20').transform(Number).refine(n => n >= 1 && n <= 100, 'Limit must be 1-100'),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});