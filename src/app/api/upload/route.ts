import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { randomUUID } from "crypto"
import { 
  ApiErrors, 
  withApiErrorHandling,
  RequestSizeLimits 
} from "@/lib/api-errors"
import { 
  validateFileUpload, 
  validateImageMetadata,
  processUploadedImage,
  validateMultipartUpload 
} from "@/lib/upload-validation"
import { uploadRateLimit } from "@/lib/security/rate-limit"
import { log } from "@/lib/logger"

export const POST = withApiErrorHandling(async function(request: NextRequest) {
  // Validate authentication
  const session = await auth()
  
  if (!session?.user?.id) {
    throw ApiErrors.unauthorized()
  }

  // Check request size
  const contentLength = request.headers.get('content-length')
  if (contentLength && parseInt(contentLength) > RequestSizeLimits.FILE_MAX_SIZE) {
    throw ApiErrors.fileTooLarge(RequestSizeLimits.FILE_MAX_SIZE / 1024 / 1024)
  }

  // Apply rate limiting
  const rateLimitResponse = await uploadRateLimit(request, session.user.id)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  // Validate multipart upload
  const multipartValidation = await validateMultipartUpload(request, 1)
  if (!multipartValidation.valid) {
    return multipartValidation.error!
  }

  const file = multipartValidation.files![0]
  
  // Validate file upload with enhanced security
  const fileValidation = await validateFileUpload(file, 'image')
  
  if (!fileValidation.valid) {
    throw ApiErrors.invalidInput('file', fileValidation.error!)
  }

  // Read and validate image
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  
  // Validate image metadata
  const metadataValidation = await validateImageMetadata(buffer)
  
  if (!metadataValidation.valid) {
    throw ApiErrors.invalidInput('image', metadataValidation.error!)
  }

  // Process and optimize image
  const processedBuffer = await processUploadedImage(buffer, {
    maxWidth: 2000,
    maxHeight: 2000,
    quality: 85,
    format: 'webp',
  })

  // Generate secure filename
  const fileExtension = 'webp' // Always save as webp after processing
  const filename = `${session.user.id}_${randomUUID()}.${fileExtension}`
  
  // Create upload directory structure
  const userUploadDir = join(process.cwd(), "public", "uploads", session.user.id)
  try {
    await mkdir(userUploadDir, { recursive: true })
  } catch (error) {
    log.error('Failed to create upload directory', { error, path: userUploadDir })
  }

  // Save processed file
  const filepath = join(userUploadDir, filename)
  await writeFile(filepath, processedBuffer)

  // Log successful upload
  log.info('File uploaded successfully', {
    userId: session.user.id,
    filename: fileValidation.sanitizedFilename,
    processedFilename: filename,
    originalSize: fileValidation.fileSize,
    processedSize: processedBuffer.length,
    metadata: metadataValidation.metadata,
  })

  // Return the public URL and metadata
  const url = `/uploads/${session.user.id}/${filename}`

  return NextResponse.json({ 
    url,
    filename: fileValidation.sanitizedFilename,
    size: processedBuffer.length,
    dimensions: {
      width: metadataValidation.metadata!.width,
      height: metadataValidation.metadata!.height,
    },
    format: 'webp',
  })
})