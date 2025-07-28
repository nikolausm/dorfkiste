import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'
import { sanitizeString } from '@/lib/validation'

// ==========================================
// ENHANCED SECURITY VALIDATION
// ==========================================

/**
 * Enhanced string sanitization with additional security checks
 */
function enhancedSanitizeString(input: string, maxLength: number = 1000): string {
  // First apply basic sanitization
  let sanitized = sanitizeString(input)
  
  // Remove any potential script tags or event handlers
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
  
  // Limit length after sanitization
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }
  
  return sanitized
}

/**
 * Validate and sanitize location string
 */
function sanitizeLocation(location: string): string {
  // Remove any HTML and limit to alphanumeric, spaces, commas, and common punctuation
  const sanitized = location.replace(/<[^>]*>/g, '')
    .replace(/[^a-zA-Z0-9\s,.\-äöüÄÖÜß]/g, '')
    .trim()
  
  return sanitized.substring(0, 200)
}

/**
 * Validate price string and convert to number
 */
function validatePriceString(val: string | null | undefined): number | null {
  if (!val || val === '') return null
  
  // Remove any non-numeric characters except decimal point
  const cleaned = val.replace(/[^0-9.]/g, '')
  
  // Ensure only one decimal point
  const parts = cleaned.split('.')
  if (parts.length > 2) return null
  
  const num = parseFloat(cleaned)
  
  // Validate the number
  if (isNaN(num) || num < 0 || num > 999999.99) return null
  
  // Round to 2 decimal places
  return Math.round(num * 100) / 100
}

// ==========================================
// ITEM CONDITION WITH GERMAN SUPPORT
// ==========================================

export const ItemCondition = z.enum([
  'neu',
  'sehr_gut',
  'gut',
  'gebraucht',
  'defekt'
])

export const ItemConditionMap = {
  'neu': 'new',
  'sehr_gut': 'like_new',
  'gut': 'good',
  'gebraucht': 'fair',
  'defekt': 'poor'
} as const

// ==========================================
// DELIVERY OPTIONS
// ==========================================

export const DeliveryOption = z.enum(['pickup', 'delivery', 'both', 'none'])

// ==========================================
// ENHANCED ITEM SCHEMAS
// ==========================================

/**
 * Base item schema with enhanced validation
 */
const baseItemSchemaEnhanced = z.object({
  title: z.string()
    .min(3, 'Titel muss mindestens 3 Zeichen lang sein')
    .max(100, 'Titel darf maximal 100 Zeichen lang sein')
    .transform(val => enhancedSanitizeString(val, 100))
    .refine(val => val.length >= 3, 'Titel muss nach Bereinigung mindestens 3 Zeichen lang sein'),
  
  description: z.string()
    .min(10, 'Beschreibung muss mindestens 10 Zeichen lang sein')
    .max(2000, 'Beschreibung darf maximal 2000 Zeichen lang sein')
    .transform(val => enhancedSanitizeString(val, 2000))
    .refine(val => val.length >= 10, 'Beschreibung muss nach Bereinigung mindestens 10 Zeichen lang sein')
    .optional(),
  
  categoryId: z.string()
    .uuid('Ungültige Kategorie-ID')
    .refine(val => val.length === 36, 'Kategorie-ID muss ein gültiges UUID-Format haben'),
  
  condition: ItemCondition,
  
  pricePerDay: z.union([
    z.string().transform(validatePriceString),
    z.number().min(0).max(999999.99),
    z.null()
  ]).optional(),
  
  pricePerHour: z.union([
    z.string().transform(validatePriceString),
    z.number().min(0).max(999999.99),
    z.null()
  ]).optional(),
  
  deposit: z.union([
    z.string().transform(validatePriceString),
    z.number().min(0).max(999999.99),
    z.null()
  ]).optional(),
  
  location: z.string()
    .min(3, 'Standort muss mindestens 3 Zeichen lang sein')
    .max(200, 'Standort darf maximal 200 Zeichen lang sein')
    .transform(sanitizeLocation)
    .refine(val => val.length >= 3, 'Standort muss nach Bereinigung mindestens 3 Zeichen lang sein'),
  
  latitude: z.union([
    z.string().transform(val => {
      if (!val || val === '') return null
      const num = parseFloat(val)
      if (isNaN(num) || num < -90 || num > 90) return null
      return num
    }),
    z.number().min(-90).max(90),
    z.null()
  ]).optional(),
  
  longitude: z.union([
    z.string().transform(val => {
      if (!val || val === '') return null
      const num = parseFloat(val)
      if (isNaN(num) || num < -180 || num > 180) return null
      return num
    }),
    z.number().min(-180).max(180),
    z.null()
  ]).optional(),
  
  available: z.boolean().default(true),
  
  // Enhanced delivery options
  deliveryOption: DeliveryOption.default('pickup'),
  
  deliveryAvailable: z.boolean().default(false),
  
  deliveryFee: z.union([
    z.string().transform(validatePriceString),
    z.number().min(0).max(999.99),
    z.null()
  ]).optional(),
  
  deliveryRadius: z.union([
    z.string().transform(val => {
      if (!val || val === '') return null
      const num = parseFloat(val)
      if (isNaN(num) || num < 0 || num > 100) return null
      return num
    }),
    z.number().min(0).max(100),
    z.null()
  ]).optional(),
  
  deliveryDetails: z.string()
    .max(500, 'Lieferdetails dürfen maximal 500 Zeichen lang sein')
    .transform(val => enhancedSanitizeString(val, 500))
    .optional(),
  
  pickupAvailable: z.boolean().default(true),
  
  pickupDetails: z.string()
    .max(500, 'Abholdetails dürfen maximal 500 Zeichen lang sein')
    .transform(val => enhancedSanitizeString(val, 500))
    .optional(),
})

/**
 * Create item schema with image validation
 */
export const createItemSchemaEnhanced = baseItemSchemaEnhanced.extend({
  imageUrls: z.array(
    z.string()
      .url('Ungültige Bild-URL')
      .refine(url => {
        // Validate URL format and protocol
        try {
          const parsed = new URL(url)
          return ['http:', 'https:'].includes(parsed.protocol)
        } catch {
          return false
        }
      }, 'URL muss mit http:// oder https:// beginnen')
      .refine(url => {
        // Check for suspicious patterns
        const suspicious = [
          'javascript:',
          'data:',
          'vbscript:',
          'file:',
          '<script',
          'onerror=',
          'onclick='
        ]
        return !suspicious.some(pattern => url.toLowerCase().includes(pattern))
      }, 'URL enthält verdächtige Muster')
  )
    .min(1, 'Mindestens ein Bild ist erforderlich')
    .max(10, 'Maximal 10 Bilder erlaubt'),
})
  .refine(data => {
    // At least one price must be set
    return data.pricePerDay !== null || data.pricePerHour !== null
  }, {
    message: 'Mindestens ein Preis (pro Tag oder pro Stunde) muss angegeben werden',
    path: ['pricePerDay']
  })
  .refine(data => {
    // If delivery is available, fee must be set
    if (data.deliveryAvailable && data.deliveryFee === null) {
      return false
    }
    return true
  }, {
    message: 'Liefergebühr muss angegeben werden, wenn Lieferung verfügbar ist',
    path: ['deliveryFee']
  })

/**
 * Update item schema (all fields optional)
 */
export const updateItemSchemaEnhanced = baseItemSchemaEnhanced.extend({
  imageUrls: z.array(
    z.string()
      .url('Ungültige Bild-URL')
      .refine(url => {
        try {
          const parsed = new URL(url)
          return ['http:', 'https:'].includes(parsed.protocol)
        } catch {
          return false
        }
      }, 'URL muss mit http:// oder https:// beginnen')
  )
    .min(1, 'Mindestens ein Bild ist erforderlich')
    .max(10, 'Maximal 10 Bilder erlaubt')
    .optional(),
}).partial()

/**
 * Bulk update schema for multiple items
 */
export const bulkUpdateItemSchema = z.object({
  itemIds: z.array(z.string().uuid()).min(1).max(100),
  updates: updateItemSchemaEnhanced
})

/**
 * Item search query schema with enhanced validation
 */
export const itemSearchSchemaEnhanced = z.object({
  query: z.string()
    .max(100, 'Suchbegriff darf maximal 100 Zeichen lang sein')
    .transform(val => enhancedSanitizeString(val, 100))
    .optional(),
  
  category: z.string()
    .max(50, 'Kategoriename darf maximal 50 Zeichen lang sein')
    .transform(val => enhancedSanitizeString(val, 50))
    .optional(),
  
  categoryId: z.string().uuid().optional(),
  
  location: z.string()
    .max(200, 'Standort darf maximal 200 Zeichen lang sein')
    .transform(sanitizeLocation)
    .optional(),
  
  minPrice: z.union([
    z.string().transform(val => {
      const num = parseFloat(val)
      return isNaN(num) || num < 0 ? 0 : num
    }),
    z.number().min(0)
  ]).optional(),
  
  maxPrice: z.union([
    z.string().transform(val => {
      const num = parseFloat(val)
      return isNaN(num) || num < 0 ? 999999 : num
    }),
    z.number().min(0)
  ]).optional(),
  
  condition: z.array(ItemCondition).optional(),
  
  available: z.union([
    z.boolean(),
    z.string().transform(val => val === 'true')
  ]).optional(),
  
  deliveryAvailable: z.union([
    z.boolean(),
    z.string().transform(val => val === 'true')
  ]).optional(),
  
  radius: z.union([
    z.string().transform(val => {
      const num = parseFloat(val)
      return isNaN(num) || num < 0 ? 0 : Math.min(num, 100)
    }),
    z.number().min(0).max(100)
  ]).optional(),
  
  userId: z.string().uuid().optional(),
  
  sortBy: z.enum([
    'created',
    'price',
    'price-low',
    'price-high',
    'name',
    'location',
    'newest',
    'popular'
  ]).default('created'),
  
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  
  page: z.union([
    z.string().transform(val => {
      const num = parseInt(val, 10)
      return isNaN(num) || num < 1 ? 1 : num
    }),
    z.number().int().min(1)
  ]).default(1),
  
  limit: z.union([
    z.string().transform(val => {
      const num = parseInt(val, 10)
      return isNaN(num) || num < 1 ? 20 : Math.min(num, 100)
    }),
    z.number().int().min(1).max(100)
  ]).default(20),
})
  .refine(data => {
    // Validate price range
    if (data.minPrice !== undefined && data.maxPrice !== undefined) {
      return data.minPrice <= data.maxPrice
    }
    return true
  }, {
    message: 'Mindestpreis darf nicht höher als Höchstpreis sein',
    path: ['minPrice']
  })

// ==========================================
// TYPE EXPORTS
// ==========================================

export type CreateItemInputEnhanced = z.infer<typeof createItemSchemaEnhanced>
export type UpdateItemInputEnhanced = z.infer<typeof updateItemSchemaEnhanced>
export type ItemSearchQueryEnhanced = z.infer<typeof itemSearchSchemaEnhanced>
export type BulkUpdateItemInput = z.infer<typeof bulkUpdateItemSchema>
export type ItemConditionType = z.infer<typeof ItemCondition>
export type DeliveryOptionType = z.infer<typeof DeliveryOption>