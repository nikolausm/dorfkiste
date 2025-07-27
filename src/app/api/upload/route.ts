import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { randomUUID } from "crypto"
import { fileUploadSchema, validateData } from "@/lib/validation"
import { validateAuth, withErrorHandling } from "@/lib/validation-middleware"

export const POST = withErrorHandling(async function(request: NextRequest) {
  // Validate authentication
  const authResult = await validateAuth()
  
  if (!authResult.success) {
    return authResult.response!
  }

  const formData = await request.formData()
  const file = formData.get("file") as File

  if (!file) {
    return NextResponse.json(
      { error: "No file provided" },
      { status: 400 }
    )
  }

  // Validate file using schema
  const fileData = {
    filename: file.name,
    fileType: file.type,
    fileSize: file.size
  }

  const validation = validateData(fileUploadSchema, fileData)
  
  if (!validation.success) {
    return NextResponse.json(
      { 
        error: "File validation failed",
        details: validation.errors
      },
      { status: 400 }
    )
  }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const fileExtension = typeof file.name === 'string' ? file.name.split(".").pop() : undefined
    const filename = `${randomUUID()}.${fileExtension}`
    
    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), "public", "uploads")
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Save file
    const filepath = join(uploadDir, filename)
    await writeFile(filepath, buffer)

    // Return the public URL
    const url = `/uploads/${filename}`

  return NextResponse.json({ url })
})