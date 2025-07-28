import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { ApiErrors, AllowedFileTypes } from '@/lib/api-errors'
import { log } from '@/lib/logger'

// ==========================================
// FILE UPLOAD VALIDATION & SECURITY
// ==========================================

export interface FileValidationResult {
  valid: boolean
  error?: string
  sanitizedFilename?: string
  mimeType?: string
  fileSize?: number
}

export interface ImageMetadata {
  width: number
  height: number
  format: string
  hasAlpha: boolean
  isAnimated?: boolean
}

// ==========================================
// SECURITY CONFIGURATIONS
// ==========================================

export const UploadSecurityConfig = {
  // Maximum file sizes
  maxFileSizeBytes: {
    image: 10 * 1024 * 1024, // 10MB
    document: 5 * 1024 * 1024, // 5MB
  },
  
  // Allowed MIME types with strict validation
  allowedMimeTypes: {
    images: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ],
    documents: [
      'application/pdf',
    ],
  },
  
  // Allowed file extensions
  allowedExtensions: {
    images: ['.jpg', '.jpeg', '.png', '.webp'],
    documents: ['.pdf'],
  },
  
  // Image dimension limits
  imageDimensions: {
    minWidth: 100,
    minHeight: 100,
    maxWidth: 5000,
    maxHeight: 5000,
    maxPixels: 25000000, // 25 megapixels
  },
  
  // Filename validation
  filenameMaxLength: 255,
  filenamePattern: /^[a-zA-Z0-9\-_\.]+$/,
  
  // Magic number validation for file types
  magicNumbers: {
    jpeg: [0xFF, 0xD8, 0xFF],
    png: [0x89, 0x50, 0x4E, 0x47],
    webp: [0x52, 0x49, 0x46, 0x46], // RIFF header
    pdf: [0x25, 0x50, 0x44, 0x46], // %PDF
  },
}

// ==========================================
// FILE VALIDATION FUNCTIONS
// ==========================================

/**
 * Validates file magic numbers to ensure file type matches extension
 */
export async function validateMagicNumbers(
  buffer: Buffer,
  declaredMimeType: string
): Promise<boolean> {
  const magicNumbers = UploadSecurityConfig.magicNumbers
  
  // Check JPEG
  if (declaredMimeType === 'image/jpeg' || declaredMimeType === 'image/jpg') {
    return buffer[0] === magicNumbers.jpeg[0] && 
           buffer[1] === magicNumbers.jpeg[1] && 
           buffer[2] === magicNumbers.jpeg[2]
  }
  
  // Check PNG
  if (declaredMimeType === 'image/png') {
    return buffer[0] === magicNumbers.png[0] && 
           buffer[1] === magicNumbers.png[1] && 
           buffer[2] === magicNumbers.png[2] && 
           buffer[3] === magicNumbers.png[3]
  }
  
  // Check WebP
  if (declaredMimeType === 'image/webp') {
    return buffer[0] === magicNumbers.webp[0] && 
           buffer[1] === magicNumbers.webp[1] && 
           buffer[2] === magicNumbers.webp[2] && 
           buffer[3] === magicNumbers.webp[3]
  }
  
  // Check PDF
  if (declaredMimeType === 'application/pdf') {
    return buffer[0] === magicNumbers.pdf[0] && 
           buffer[1] === magicNumbers.pdf[1] && 
           buffer[2] === magicNumbers.pdf[2] && 
           buffer[3] === magicNumbers.pdf[3]
  }
  
  return false
}

/**
 * Sanitizes filename to prevent directory traversal and other attacks
 */
export function sanitizeFilename(filename: string): string {
  // Remove any path components
  let sanitized = filename.split(/[\/\\]/).pop() || ''
  
  // Remove any non-alphanumeric characters except dash, underscore, and dot
  sanitized = sanitized.replace(/[^a-zA-Z0-9\-_\.]/g, '')
  
  // Ensure filename doesn't start with a dot (hidden file)
  if (sanitized.startsWith('.')) {
    sanitized = sanitized.substring(1)
  }
  
  // Limit filename length
  if (sanitized.length > UploadSecurityConfig.filenameMaxLength) {
    const extension = sanitized.substring(sanitized.lastIndexOf('.'))
    const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.'))
    sanitized = nameWithoutExt.substring(0, UploadSecurityConfig.filenameMaxLength - extension.length) + extension
  }
  
  return sanitized
}

/**
 * Validates file upload with comprehensive security checks
 */
export async function validateFileUpload(
  file: File,
  fileType: 'image' | 'document' = 'image'
): Promise<FileValidationResult> {
  try {
    // Sanitize filename
    const sanitizedFilename = sanitizeFilename(file.name)
    
    if (!sanitizedFilename) {
      return {
        valid: false,
        error: 'Invalid filename',
      }
    }
    
    // Check file extension
    const extension = sanitizedFilename.substring(sanitizedFilename.lastIndexOf('.')).toLowerCase()
    const allowedExtensions = UploadSecurityConfig.allowedExtensions[fileType === 'image' ? 'images' : 'documents']
    
    if (!allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `Invalid file extension. Allowed: ${allowedExtensions.join(', ')}`,
      }
    }
    
    // Check MIME type
    const allowedMimeTypes = UploadSecurityConfig.allowedMimeTypes[fileType === 'image' ? 'images' : 'documents']
    
    if (!allowedMimeTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed: ${allowedMimeTypes.join(', ')}`,
      }
    }
    
    // Check file size
    const maxSize = UploadSecurityConfig.maxFileSizeBytes[fileType]
    
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File too large. Maximum size: ${maxSize / 1024 / 1024}MB`,
      }
    }
    
    // Check if file is empty
    if (file.size === 0) {
      return {
        valid: false,
        error: 'File is empty',
      }
    }
    
    // Read file buffer for magic number validation
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Validate magic numbers
    const magicNumbersValid = await validateMagicNumbers(buffer, file.type)
    
    if (!magicNumbersValid) {
      log.security('File upload failed magic number validation', {
        filename: sanitizedFilename,
        declaredType: file.type,
        size: file.size,
      })
      
      return {
        valid: false,
        error: 'File content does not match declared type',
      }
    }
    
    return {
      valid: true,
      sanitizedFilename,
      mimeType: file.type,
      fileSize: file.size,
    }
  } catch (error) {
    log.error('File validation error', { error })
    
    return {
      valid: false,
      error: 'File validation failed',
    }
  }
}

/**
 * Validates image dimensions and metadata
 */
export async function validateImageMetadata(
  buffer: Buffer
): Promise<{ valid: boolean; error?: string; metadata?: ImageMetadata }> {
  try {
    const image = sharp(buffer)
    const metadata = await image.metadata()
    
    if (!metadata.width || !metadata.height) {
      return {
        valid: false,
        error: 'Unable to read image dimensions',
      }
    }
    
    const { imageDimensions } = UploadSecurityConfig
    
    // Check minimum dimensions
    if (metadata.width < imageDimensions.minWidth || metadata.height < imageDimensions.minHeight) {
      return {
        valid: false,
        error: `Image too small. Minimum dimensions: ${imageDimensions.minWidth}x${imageDimensions.minHeight}px`,
      }
    }
    
    // Check maximum dimensions
    if (metadata.width > imageDimensions.maxWidth || metadata.height > imageDimensions.maxHeight) {
      return {
        valid: false,
        error: `Image too large. Maximum dimensions: ${imageDimensions.maxWidth}x${imageDimensions.maxHeight}px`,
      }
    }
    
    // Check total pixel count
    const totalPixels = metadata.width * metadata.height
    if (totalPixels > imageDimensions.maxPixels) {
      return {
        valid: false,
        error: `Image resolution too high. Maximum: ${imageDimensions.maxPixels / 1000000} megapixels`,
      }
    }
    
    // Check for potentially malicious animated images
    if (metadata.pages && metadata.pages > 1) {
      return {
        valid: false,
        error: 'Animated images are not allowed',
      }
    }
    
    return {
      valid: true,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format || 'unknown',
        hasAlpha: metadata.hasAlpha || false,
        isAnimated: (metadata.pages || 1) > 1,
      },
    }
  } catch (error) {
    log.error('Image metadata validation error', { error })
    
    return {
      valid: false,
      error: 'Unable to process image',
    }
  }
}

/**
 * Processes and optimizes uploaded image
 */
export async function processUploadedImage(
  buffer: Buffer,
  options?: {
    maxWidth?: number
    maxHeight?: number
    quality?: number
    format?: 'jpeg' | 'png' | 'webp'
  }
): Promise<Buffer> {
  const {
    maxWidth = 2000,
    maxHeight = 2000,
    quality = 85,
    format = 'webp',
  } = options || {}
  
  try {
    let pipeline = sharp(buffer)
    
    // Resize if necessary (maintaining aspect ratio)
    pipeline = pipeline.resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    
    // Remove metadata for privacy
    pipeline = pipeline.rotate() // Auto-rotate based on EXIF
      .removeMetadata()
    
    // Convert to specified format
    if (format === 'jpeg') {
      pipeline = pipeline.jpeg({ quality, progressive: true })
    } else if (format === 'png') {
      pipeline = pipeline.png({ quality, compressionLevel: 9 })
    } else if (format === 'webp') {
      pipeline = pipeline.webp({ quality })
    }
    
    return await pipeline.toBuffer()
  } catch (error) {
    log.error('Image processing error', { error })
    throw new Error('Failed to process image')
  }
}

/**
 * Middleware for validating multipart form uploads
 */
export async function validateMultipartUpload(
  request: NextRequest,
  maxFiles: number = 10
): Promise<{ valid: boolean; error?: NextResponse; files?: File[] }> {
  try {
    const contentType = request.headers.get('content-type') || ''
    
    if (!contentType.includes('multipart/form-data')) {
      return {
        valid: false,
        error: NextResponse.json(
          ApiErrors.invalidInput('content-type', 'Expected multipart/form-data'),
          { status: 400 }
        ),
      }
    }
    
    const formData = await request.formData()
    const files: File[] = []
    
    // Extract all files from form data
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        files.push(value)
      }
    }
    
    if (files.length === 0) {
      return {
        valid: false,
        error: NextResponse.json(
          ApiErrors.missingRequiredField('file'),
          { status: 400 }
        ),
      }
    }
    
    if (files.length > maxFiles) {
      return {
        valid: false,
        error: NextResponse.json(
          ApiErrors.invalidInput('files', `Maximum ${maxFiles} files allowed`),
          { status: 400 }
        ),
      }
    }
    
    return {
      valid: true,
      files,
    }
  } catch (error) {
    log.error('Multipart upload validation error', { error })
    
    return {
      valid: false,
      error: NextResponse.json(
        ApiErrors.invalidInput('upload', 'Failed to process upload'),
        { status: 400 }
      ),
    }
  }
}