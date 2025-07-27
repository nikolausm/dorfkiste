import { log, PerformanceTimer } from './logger';

// Database operation types
export type DatabaseOperation = 
  | 'create' 
  | 'read' 
  | 'update' 
  | 'delete' 
  | 'findMany' 
  | 'findUnique' 
  | 'aggregate' 
  | 'count';

// Database logging utility class
export class DatabaseLogger {
  private model: string;
  private operation: DatabaseOperation;
  private timer: PerformanceTimer;
  private context: Record<string, any>;

  constructor(model: string, operation: DatabaseOperation, context: Record<string, any> = {}) {
    this.model = model;
    this.operation = operation;
    this.context = context;
    this.timer = new PerformanceTimer();
  }

  // Log successful database operation
  success(result?: any): void {
    const duration = this.timer.end('Database operation completed', {
      model: this.model,
      operation: this.operation,
      success: true,
      resultCount: this.getResultCount(result),
      ...this.context,
      type: 'database_operation'
    });

    // Alert on slow queries (>1 second)
    if (duration > 1000) {
      log.warn('Slow database query detected', {
        model: this.model,
        operation: this.operation,
        duration,
        threshold: '1000ms',
        ...this.context,
        type: 'database_slow_query'
      });
    }
  }

  // Log database operation error
  error(error: Error): void {
    this.timer.end('Database operation failed', {
      model: this.model,
      operation: this.operation,
      success: false,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      ...this.context,
      type: 'database_error'
    });

    log.error('Database operation failed', {
      model: this.model,
      operation: this.operation,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      ...this.context,
      type: 'database_operation_error'
    });
  }

  // Log database validation error
  validationError(error: any): void {
    log.warn('Database validation error', {
      model: this.model,
      operation: this.operation,
      validationError: error,
      ...this.context,
      type: 'database_validation_error'
    });
  }

  // Get result count for logging
  private getResultCount(result: any): number | undefined {
    if (!result) return undefined;
    if (Array.isArray(result)) return result.length;
    if (typeof result === 'object' && 'count' in result) return result.count;
    return 1;
  }

  // Static helper methods for common operations
  static logUserOperation(operation: DatabaseOperation, userId?: string, context: Record<string, any> = {}) {
    return new DatabaseLogger('User', operation, { userId, ...context });
  }

  static logItemOperation(operation: DatabaseOperation, itemId?: string, context: Record<string, any> = {}) {
    return new DatabaseLogger('Item', operation, { itemId, ...context });
  }

  static logRentalOperation(operation: DatabaseOperation, rentalId?: string, context: Record<string, any> = {}) {
    return new DatabaseLogger('Rental', operation, { rentalId, ...context });
  }

  static logPaymentOperation(operation: DatabaseOperation, paymentId?: string, context: Record<string, any> = {}) {
    return new DatabaseLogger('Payment', operation, { paymentId, ...context });
  }

  static logReviewOperation(operation: DatabaseOperation, reviewId?: string, context: Record<string, any> = {}) {
    return new DatabaseLogger('Review', operation, { reviewId, ...context });
  }

  static logMessageOperation(operation: DatabaseOperation, messageId?: string, context: Record<string, any> = {}) {
    return new DatabaseLogger('Message', operation, { messageId, ...context });
  }
}

// Wrapper function for database operations with automatic logging
export async function withDatabaseLogging<T>(
  model: string,
  operation: DatabaseOperation,
  fn: () => Promise<T>,
  context: Record<string, any> = {}
): Promise<T> {
  const dbLogger = new DatabaseLogger(model, operation, context);
  
  try {
    const result = await fn();
    dbLogger.success(result);
    return result;
  } catch (error) {
    if (error instanceof Error) {
      dbLogger.error(error);
    } else {
      dbLogger.error(new Error(String(error)));
    }
    throw error;
  }
}

// Rate limiting detection and logging
export class RateLimitLogger {
  private identifier: string;
  private limit: number;
  private window: string;

  constructor(identifier: string, limit: number, window: string) {
    this.identifier = identifier;
    this.limit = limit;
    this.window = window;
  }

  // Log rate limit violation
  violation(currentCount: number, context: Record<string, any> = {}): void {
    log.rateLimit('Rate limit violation detected', {
      identifier: this.identifier,
      limit: this.limit,
      window: this.window,
      currentCount,
      violation: true,
      ...context,
      type: 'rate_limit_violation'
    });
  }

  // Log rate limit warning (approaching limit)
  warning(currentCount: number, context: Record<string, any> = {}): void {
    log.warn('Rate limit warning - approaching limit', {
      identifier: this.identifier,
      limit: this.limit,
      window: this.window,
      currentCount,
      percentageUsed: Math.round((currentCount / this.limit) * 100),
      ...context,
      type: 'rate_limit_warning'
    });
  }

  // Log successful request within limits
  success(currentCount: number, context: Record<string, any> = {}): void {
    log.debug('Request within rate limits', {
      identifier: this.identifier,
      limit: this.limit,
      window: this.window,
      currentCount,
      remaining: this.limit - currentCount,
      ...context,
      type: 'rate_limit_success'
    });
  }
}

// File upload logging utility
export class FileUploadLogger {
  private fileType: string;
  private maxSize: number;
  private timer: PerformanceTimer;
  private context: Record<string, any>;

  constructor(fileType: string, maxSize: number, context: Record<string, any> = {}) {
    this.fileType = fileType;
    this.maxSize = maxSize;
    this.context = context;
    this.timer = new PerformanceTimer();
  }

  // Log successful file upload
  success(fileName: string, fileSize: number, uploadPath: string): void {
    this.timer.end('File upload completed', {
      fileType: this.fileType,
      fileName,
      fileSize,
      uploadPath,
      maxSize: this.maxSize,
      success: true,
      ...this.context,
      type: 'file_upload_success'
    });

    log.upload('File uploaded successfully', {
      fileType: this.fileType,
      fileName,
      fileSize,
      uploadPath,
      maxSize: this.maxSize,
      ...this.context,
      type: 'file_upload_completed'
    });
  }

  // Log file upload error
  error(fileName: string, error: Error): void {
    this.timer.end('File upload failed', {
      fileType: this.fileType,
      fileName,
      success: false,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      ...this.context,
      type: 'file_upload_error'
    });

    log.error('File upload failed', {
      fileType: this.fileType,
      fileName,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      ...this.context,
      type: 'file_upload_failed'
    });
  }

  // Log file validation error
  validationError(fileName: string, reason: string, details?: any): void {
    log.warn('File upload validation failed', {
      fileType: this.fileType,
      fileName,
      reason,
      details,
      ...this.context,
      type: 'file_upload_validation_error'
    });
  }

  // Log file size violation
  sizeViolation(fileName: string, fileSize: number): void {
    log.warn('File size exceeds limit', {
      fileType: this.fileType,
      fileName,
      fileSize,
      maxSize: this.maxSize,
      violation: 'size_limit',
      ...this.context,
      type: 'file_upload_size_violation'
    });
  }
}