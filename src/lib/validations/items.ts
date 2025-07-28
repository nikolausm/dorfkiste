import { z } from 'zod'

// Common item condition enum
export const ItemCondition = z.enum(['new', 'like_new', 'good', 'fair', 'poor'])

// Base item schema for shared fields
const baseItemSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters')
    .trim(),
  
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters')
    .trim(),
  
  categoryId: z.string()
    .uuid('Invalid category ID'),
  
  condition: ItemCondition,
  
  pricePerDay: z.string()
    .optional()
    .nullable()
    .refine((val) => {
      if (!val || val === '') return true
      const num = parseFloat(val)
      return !isNaN(num) && num >= 0
    }, 'Price per day must be a positive number'),
  
  pricePerHour: z.string()
    .optional()
    .nullable()
    .refine((val) => {
      if (!val || val === '') return true
      const num = parseFloat(val)
      return !isNaN(num) && num >= 0
    }, 'Price per hour must be a positive number'),
  
  deposit: z.string()
    .optional()
    .nullable()
    .refine((val) => {
      if (!val || val === '') return true
      const num = parseFloat(val)
      return !isNaN(num) && num >= 0
    }, 'Deposit must be a positive number'),
  
  location: z.string()
    .min(3, 'Location must be at least 3 characters')
    .max(200, 'Location must be less than 200 characters')
    .trim(),
  
  latitude: z.string()
    .optional()
    .nullable()
    .refine((val) => {
      if (!val || val === '') return true
      const num = parseFloat(val)
      return !isNaN(num) && num >= -90 && num <= 90
    }, 'Latitude must be between -90 and 90'),
  
  longitude: z.string()
    .optional()
    .nullable()
    .refine((val) => {
      if (!val || val === '') return true
      const num = parseFloat(val)
      return !isNaN(num) && num >= -180 && num <= 180
    }, 'Longitude must be between -180 and 180'),
  
  available: z.boolean().default(true),
})

// Create item schema
export const createItemSchema = baseItemSchema.extend({
  imageUrls: z.array(z.string().url('Invalid image URL'))
    .min(1, 'At least one image is required')
    .max(10, 'Maximum 10 images allowed'),
})

// Update item schema (all fields optional for partial updates)
export const updateItemSchema = baseItemSchema.extend({
  imageUrls: z.array(z.string().url('Invalid image URL'))
    .min(1, 'At least one image is required')
    .max(10, 'Maximum 10 images allowed')
    .optional(),
}).partial()

// Item ID parameter schema
export const itemIdSchema = z.object({
  id: z.string().uuid('Invalid item ID'),
})

// Query parameters for listing items
export const listItemsQuerySchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  condition: ItemCondition.optional(),
  minPrice: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true
      const num = parseFloat(val)
      return !isNaN(num) && num >= 0
    }, 'Min price must be a positive number'),
  maxPrice: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true
      const num = parseFloat(val)
      return !isNaN(num) && num >= 0
    }, 'Max price must be a positive number'),
  available: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
  userId: z.string().uuid().optional(),
  sortBy: z.enum(['createdAt', 'pricePerDay', 'pricePerHour', 'title']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.string()
    .optional()
    .transform(val => val ? parseInt(val, 10) : 1)
    .refine(val => val > 0, 'Page must be greater than 0'),
  limit: z.string()
    .optional()
    .transform(val => val ? parseInt(val, 10) : 20)
    .refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
})

// Type exports
export type CreateItemInput = z.infer<typeof createItemSchema>
export type UpdateItemInput = z.infer<typeof updateItemSchema>
export type ItemIdParams = z.infer<typeof itemIdSchema>
export type ListItemsQuery = z.infer<typeof listItemsQuerySchema>