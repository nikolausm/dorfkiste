import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import DOMPurify from 'isomorphic-dompurify';

// ==========================================
// XSS SANITIZATION UTILITIES
// ==========================================

/**
 * Sanitizes string input to prevent XSS attacks
 */
export function sanitizeString(input: string): string {
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [] 
  });
}

/**
 * Sanitizes object with string values recursively
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj } as any;
  
  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) : 
        typeof item === 'object' && item !== null ? sanitizeObject(item) : item
      );
    }
  }
  
  return sanitized as T;
}

// ==========================================
// BASE SCHEMAS
// ==========================================

// Common field types with security constraints
const emailSchema = z.string()
  .email('Invalid email format')
  .max(254, 'Email too long')
  .transform(sanitizeString);

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number');

const nameSchema = z.string()
  .min(1, 'Name is required')
  .max(100, 'Name too long')
  .regex(/^[a-zA-Z\s\-\.äöüÄÖÜß]+$/, 'Invalid characters in name')
  .transform(sanitizeString);

const descriptionSchema = z.string()
  .min(1, 'Description is required')
  .max(2000, 'Description too long')
  .transform(sanitizeString);

const priceSchema = z.number()
  .min(0, 'Price cannot be negative')
  .max(999999.99, 'Price too high')
  .multipleOf(0.01, 'Price can have at most 2 decimal places');

const idSchema = z.string()
  .uuid('Invalid ID format');

const phoneSchema = z.string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
  .optional()
  .transform(value => value ? sanitizeString(value) : value);

// ==========================================
// USER SCHEMAS
// ==========================================

export const userRegistrationSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema,
  password: passwordSchema
});

export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
});

export const userUpdateSchema = z.object({
  name: nameSchema.optional(),
  bio: z.string()
    .max(500, 'Bio too long')
    .transform(sanitizeString)
    .optional(),
  avatarUrl: z.string()
    .url('Invalid avatar URL')
    .optional()
});

export const passwordResetRequestSchema = z.object({
  email: emailSchema
});

export const passwordResetSchema = z.object({
  token: z.string().uuid('Invalid reset token'),
  password: passwordSchema
});

// ==========================================
// ITEM SCHEMAS
// ==========================================

export const itemCreateSchema = z.object({
  title: z.string()
    .min(1, 'Item title is required')
    .max(100, 'Item title too long')
    .transform(sanitizeString),
  description: descriptionSchema.optional(),
  categoryId: z.string()
    .min(1, 'Category is required')
    .transform(sanitizeString),
  pricePerDay: priceSchema.optional(),
  pricePerHour: priceSchema.optional(),
  deposit: priceSchema.optional(),
  location: z.string()
    .min(1, 'Location is required')
    .max(200, 'Location too long')
    .transform(sanitizeString),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  condition: z.enum(['neu', 'sehr gut', 'gut', 'gebraucht']),
  available: z.boolean().default(true),
  deliveryAvailable: z.boolean().default(false),
  deliveryFee: priceSchema.optional(),
  deliveryRadius: z.number().min(0).max(100).optional(), // km
  deliveryDetails: z.string()
    .max(500, 'Delivery details too long')
    .transform(sanitizeString)
    .optional(),
  pickupAvailable: z.boolean().default(true),
  imageUrls: z.array(z.string().url('Invalid image URL')).max(10, 'Too many images').optional()
});

export const itemUpdateSchema = itemCreateSchema.partial().extend({
  id: idSchema
});

export const itemSearchSchema = z.object({
  query: z.string()
    .max(100, 'Search query too long')
    .transform(sanitizeString)
    .optional(),
  category: z.string()
    .max(50, 'Category name too long')
    .transform(sanitizeString)
    .optional(),
  location: z.string()
    .max(200, 'Location too long')
    .transform(sanitizeString)
    .optional(),
  minPrice: priceSchema.optional(),
  maxPrice: priceSchema.optional(),
  condition: z.array(z.enum(['new', 'like_new', 'good', 'fair', 'poor'])).optional(),
  available: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['price', 'name', 'created', 'location']).default('created'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// ==========================================
// RENTAL SCHEMAS
// ==========================================

export const rentalRequestSchema = z.object({
  itemId: idSchema,
  startDate: z.string()
    .datetime('Invalid start date format')
    .refine(date => new Date(date) > new Date(), {
      message: 'Start date must be in the future'
    }),
  endDate: z.string()
    .datetime('Invalid end date format'),
  message: z.string()
    .max(500, 'Message too long')
    .transform(sanitizeString)
    .optional(),
  deliveryOption: z.enum(['pickup', 'delivery', 'meetup']),
  deliveryAddress: z.string()
    .max(200, 'Delivery address too long')
    .transform(sanitizeString)
    .optional()
}).refine(data => {
  return new Date(data.endDate) > new Date(data.startDate);
}, {
  message: 'End date must be after start date',
  path: ['endDate']
});

export const rentalUpdateSchema = z.object({
  id: idSchema,
  status: z.enum(['pending', 'approved', 'rejected', 'active', 'completed', 'cancelled']),
  adminMessage: z.string()
    .max(500, 'Admin message too long')
    .transform(sanitizeString)
    .optional()
});

export const rentalReviewSchema = z.object({
  rentalId: idSchema,
  rating: z.number().int().min(1).max(5),
  comment: z.string()
    .max(1000, 'Review comment too long')
    .transform(sanitizeString)
    .optional()
});

// ==========================================
// PAYMENT SCHEMAS
// ==========================================

export const paymentIntentSchema = z.object({
  rentalId: idSchema,
  amount: priceSchema,
  currency: z.string().length(3, 'Invalid currency code').default('EUR'),
  paymentMethod: z.enum(['stripe', 'paypal']).default('stripe')
});

export const paymentConfirmationSchema = z.object({
  paymentIntentId: z.string().min(1, 'Payment intent ID is required'),
  rentalId: idSchema
});

export const refundRequestSchema = z.object({
  rentalId: idSchema,
  amount: priceSchema.optional(),
  reason: z.string()
    .min(10, 'Refund reason must be at least 10 characters')
    .max(500, 'Refund reason too long')
    .transform(sanitizeString)
});

// ==========================================
// ADMIN SCHEMAS
// ==========================================

export const adminUserUpdateSchema = z.object({
  id: idSchema,
  role: z.enum(['user', 'admin']),
  isBlocked: z.boolean().optional(),
  adminNotes: z.string()
    .max(1000, 'Admin notes too long')
    .transform(sanitizeString)
    .optional()
});

export const adminItemModerationSchema = z.object({
  id: idSchema,
  status: z.enum(['approved', 'rejected', 'flagged']),
  moderationReason: z.string()
    .max(500, 'Moderation reason too long')
    .transform(sanitizeString)
    .optional()
});

export const adminAnalyticsSchema = z.object({
  startDate: z.string().datetime('Invalid start date format'),
  endDate: z.string().datetime('Invalid end date format'),
  metric: z.enum(['users', 'items', 'rentals', 'revenue']).optional()
}).refine(data => {
  return new Date(data.endDate) > new Date(data.startDate);
}, {
  message: 'End date must be after start date',
  path: ['endDate']
});

// ==========================================
// WATCHLIST SCHEMAS
// ==========================================

export const watchlistAddSchema = z.object({
  itemId: idSchema
});

export const watchlistRemoveSchema = z.object({
  itemId: idSchema
});

// ==========================================
// VALIDATION MIDDLEWARE
// ==========================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

/**
 * Creates a validation middleware for API routes
 */
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return async function validateRequest(
    request: NextRequest,
    source: 'body' | 'query' | 'params' = 'body'
  ): Promise<ValidationResult<T>> {
    try {
      let data: unknown;

      switch (source) {
        case 'body':
          try {
            data = await request.json();
          } catch (error) {
            return {
              success: false,
              errors: [{ field: 'body', message: 'Invalid JSON in request body' }]
            };
          }
          break;
        case 'query':
          const url = new URL(request.url);
          data = Object.fromEntries(url.searchParams.entries());
          break;
        case 'params':
          // For params, you'll need to pass them explicitly
          throw new Error('Params validation requires explicit data passing');
        default:
          throw new Error(`Invalid validation source: ${source}`);
      }

      // Sanitize the data before validation
      const sanitizedData = typeof data === 'object' && data !== null ? 
        sanitizeObject(data as Record<string, any>) : data;

      const result = schema.safeParse(sanitizedData);

      if (result.success) {
        return {
          success: true,
          data: result.data
        };
      } else {
        const errors: ValidationError[] = result.error.issues.map(error => ({
          field: error.path.join('.'),
          message: error.message
        }));

        return {
          success: false,
          errors
        };
      }
    } catch (error) {
      return {
        success: false,
        errors: [{ 
          field: 'general', 
          message: error instanceof Error ? error.message : 'Validation failed' 
        }]
      };
    }
  };
}

/**
 * Validates request data with explicit data passing
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    // Sanitize the data before validation
    const sanitizedData = typeof data === 'object' && data !== null ? 
      sanitizeObject(data as Record<string, any>) : data;

    const result = schema.safeParse(sanitizedData);

    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    } else {
      const errors: ValidationError[] = result.error.issues.map(error => ({
        field: error.path.join('.'),
        message: error.message
      }));

      return {
        success: false,
        errors
      };
    }
  } catch (error) {
    return {
      success: false,
      errors: [{ 
        field: 'general', 
        message: error instanceof Error ? error.message : 'Validation failed' 
      }]
    };
  }
}

/**
 * Creates a standardized error response for validation failures
 */
export function createValidationErrorResponse(errors: ValidationError[]): NextResponse {
  return NextResponse.json(
    {
      error: 'Validation failed',
      details: errors,
      timestamp: new Date().toISOString()
    },
    { status: 400 }
  );
}

/**
 * Utility function to extract and validate path parameters
 */
export function validatePathParams(params: Record<string, string | string[]>, schema: z.ZodSchema): ValidationResult<any> {
  return validateData(schema, params);
}

// ==========================================
// RATE LIMITING SCHEMAS
// ==========================================

export const rateLimitSchema = z.object({
  ip: z.string(),
  endpoint: z.string().max(100),
  timestamp: z.number().int().positive()
});

// ==========================================
// FILE UPLOAD SCHEMAS
// ==========================================

export const fileUploadSchema = z.object({
  filename: z.string()
    .min(1, 'Filename is required')
    .max(255, 'Filename too long')
    .regex(/^[a-zA-Z0-9\s\-_\.]+$/, 'Invalid characters in filename')
    .transform(sanitizeString),
  fileType: z.string()
    .regex(/^image\/(jpeg|jpg|png|webp)$/, 'Only JPEG, PNG, and WebP images are allowed'),
  fileSize: z.number()
    .int('File size must be an integer')
    .min(1, 'File cannot be empty')
    .max(10 * 1024 * 1024, 'File size cannot exceed 10MB') // 10MB limit
});

// ==========================================
// EXPORT TYPES
// ==========================================

export type UserRegistration = z.infer<typeof userRegistrationSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
export type ItemCreate = z.infer<typeof itemCreateSchema>;
export type ItemUpdate = z.infer<typeof itemUpdateSchema>;
export type ItemSearch = z.infer<typeof itemSearchSchema>;
export type RentalRequest = z.infer<typeof rentalRequestSchema>;
export type RentalUpdate = z.infer<typeof rentalUpdateSchema>;
export type PaymentIntent = z.infer<typeof paymentIntentSchema>;
export type AdminUserUpdate = z.infer<typeof adminUserUpdateSchema>;
export type FileUpload = z.infer<typeof fileUploadSchema>;