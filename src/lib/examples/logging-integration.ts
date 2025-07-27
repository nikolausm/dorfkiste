/**
 * EXAMPLE: How to integrate logging system into API routes
 * 
 * This file demonstrates proper usage of the logging system
 * across different scenarios and endpoints.
 */

import { NextRequest, NextResponse } from 'next/server';
import { loggedRoute, withLogging } from '../middleware/logging';
import { withApiRateLimit, withAuthRateLimit } from '../middleware/rate-limit';
import { log, Logger, PerformanceTimer } from '../logger';
import { DatabaseLogger, withDatabaseLogging } from '../database-logger';
import { auth } from '../auth';
import { prisma } from '../prisma';

// Example 1: Simple API route with logging
export const simpleApiRoute = loggedRoute(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  log.info('Search API called', {
    query,
    hasQuery: !!query,
    type: 'search_request'
  });
  
  return NextResponse.json({ results: [] });
});

// Example 2: Authentication endpoint with rate limiting and security logging
export const authRoute = withAuthRateLimit(
  loggedRoute(async (request: NextRequest) => {
    const correlationId = request.headers.get('x-correlation-id') || 'unknown';
    const logger = log.child(correlationId);
    
    try {
      const body = await request.json();
      const { email, password } = body;
      
      // Security logging for auth attempts
      logger.security('Authentication attempt', {
        email,
        hasPassword: !!password,
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        type: 'auth_attempt'
      });
      
      // Simulate authentication logic here
      return NextResponse.json({ success: true });
      
    } catch (error) {
      logger.error('Authentication error', error);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
  })
);

// Example 3: Database operations with logging
export const userRoute = loggedRoute(async (request: NextRequest) => {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const userId = session.user.id;
  
  try {
    // Method 1: Using DatabaseLogger class
    const dbLogger = DatabaseLogger.logUserOperation('findUnique', userId, {
      operation: 'get_user_profile'
    });
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true }
    });
    
    if (user) {
      dbLogger.success(user);
      log.info('User profile retrieved', {
        userId,
        type: 'user_profile_access'
      });
    } else {
      dbLogger.error(new Error('User not found'));
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(user);
    
  } catch (error) {
    log.error('Database error in user route', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

// Example 4: Complex operation with multiple logging points
export const rentalCreationRoute = loggedRoute(async (request: NextRequest) => {
  const timer = new PerformanceTimer();
  const correlationId = request.headers.get('x-correlation-id') || 'unknown';
  const logger = log.child(correlationId);
  
  try {
    const session = await auth();
    if (!session?.user?.id) {
      logger.security('Unauthorized rental creation attempt', {
        type: 'rental_unauthorized'
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { itemId, startDate, endDate } = body;
    
    logger.info('Rental creation started', {
      userId: session.user.id,
      itemId,
      startDate,
      endDate,
      type: 'rental_creation_start'
    });
    
    // Database operations with logging
    const result = await withDatabaseLogging(
      'Rental',
      'create',
      async () => {
        return await prisma.rental.create({
          data: {
            itemId,
            renterId: session.user.id,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            status: 'pending'
          }
        });
      },
      {
        userId: session.user.id,
        itemId,
        operation: 'rental_creation'
      }
    );
    
    timer.end('Rental created successfully', {
      userId: session.user.id,
      rentalId: result.id,
      itemId,
      type: 'rental_creation_success'
    });
    
    return NextResponse.json(result);
    
  } catch (error) {
    timer.end('Rental creation failed', {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message
      } : error,
      type: 'rental_creation_error'
    });
    
    logger.error('Rental creation failed', error);
    return NextResponse.json({ error: 'Failed to create rental' }, { status: 500 });
  }
});

// Example 5: File upload with logging
export const fileUploadRoute = loggedRoute(async (request: NextRequest) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      log.warn('File upload attempted without file', {
        userId: session.user.id,
        type: 'file_upload_no_file'
      });
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Log file upload details
    log.upload('File upload started', {
      userId: session.user.id,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      type: 'file_upload_start'
    });
    
    // Simulate file processing
    const uploadPath = `/uploads/${Date.now()}-${file.name}`;
    
    log.upload('File upload completed', {
      userId: session.user.id,
      fileName: file.name,
      fileSize: file.size,
      uploadPath,
      type: 'file_upload_success'
    });
    
    return NextResponse.json({ path: uploadPath });
    
  } catch (error) {
    log.error('File upload error', {
      userId: session.user.id,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error,
      type: 'file_upload_error'
    });
    
    return NextResponse.json({ error: 'File upload failed' }, { status: 500 });
  }
});

// Example 6: Manual logging setup for custom scenarios
export const customLoggingRoute = async (request: NextRequest) => {
  // Create custom logging configuration
  const customHandler = withLogging(
    async (req: NextRequest) => {
      // Your route logic here
      return NextResponse.json({ message: 'Custom logging example' });
    },
    {
      enableRequestLogging: true,
      enableResponseLogging: true,
      enablePerformanceMetrics: true,
      logRequestBody: false, // Disable for privacy
      logResponseBody: false,
      excludePaths: ['/health'],
      maxBodySize: 500
    }
  );
  
  return await customHandler(request);
};

// Example 7: Error handling with proper logging
export const errorHandlingRoute = loggedRoute(async (request: NextRequest) => {
  const correlationId = request.headers.get('x-correlation-id') || 'unknown';
  const logger = log.child(correlationId);
  
  try {
    // Simulate some operation that might fail
    const result = await riskyOperation();
    
    logger.info('Operation completed successfully', {
      result: result.id,
      type: 'operation_success'
    });
    
    return NextResponse.json(result);
    
  } catch (error) {
    if (error instanceof ValidationError) {
      logger.warn('Validation error', {
        validationErrors: error.errors,
        type: 'validation_error'
      });
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: error.errors 
      }, { status: 400 });
    }
    
    if (error instanceof NotFoundError) {
      logger.info('Resource not found', {
        resource: error.resource,
        type: 'not_found'
      });
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    // Unexpected error
    logger.error('Unexpected error in operation', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

// Helper classes for example
class ValidationError extends Error {
  constructor(public errors: string[]) {
    super('Validation failed');
    this.name = 'ValidationError';
  }
}

class NotFoundError extends Error {
  constructor(public resource: string) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}

async function riskyOperation() {
  // Simulate operation that might fail
  if (Math.random() > 0.7) {
    throw new ValidationError(['Invalid input']);
  }
  if (Math.random() > 0.8) {
    throw new NotFoundError('item');
  }
  return { id: 'success-123' };
}