import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { randomUUID } from 'crypto';

// Log levels hierarchy: error < warn < info < debug
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// Sensitive fields to filter from logs
const SENSITIVE_FIELDS = [
  'password', 'token', 'authorization', 'cookie', 'session',
  'secret', 'key', 'credentials', 'auth', 'bearer',
  'client_secret', 'refresh_token', 'access_token'
];

// Custom log format with correlation ID and request context
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf((info) => {
    const { timestamp, level, message, correlationId, ...meta } = info;
    
    // Filter sensitive data from meta
    const filteredMeta = filterSensitiveData(meta);
    
    const logEntry = {
      timestamp,
      level,
      message,
      correlationId: correlationId || 'system',
      ...filteredMeta,
    };
    
    return JSON.stringify(logEntry);
  })
);

// Development format for better readability in console
const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf((info) => {
    const { timestamp, level, message, correlationId, ...meta } = info;
    const metaString = Object.keys(meta).length ? JSON.stringify(filterSensitiveData(meta), null, 2) : '';
    return `${timestamp} [${correlationId || 'system'}] ${level}: ${message} ${metaString}`;
  })
);

// Function to filter sensitive data
function filterSensitiveData(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(filterSensitiveData);
  }
  
  const filtered: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const keyLower = typeof key === 'string' ? key.toLowerCase() : String(key).toLowerCase();
    const isSensitive = SENSITIVE_FIELDS.some(field => keyLower.includes(field));
    
    if (isSensitive) {
      filtered[key] = '[FILTERED]';
    } else if (typeof value === 'object' && value !== null) {
      filtered[key] = filterSensitiveData(value);
    } else {
      filtered[key] = value;
    }
  }
  
  return filtered;
}

// Create daily rotate file transport for combined logs
const createRotateFileTransport = (filename: string, level?: string) => {
  return new DailyRotateFile({
    filename: `logs/${filename}-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level,
    format: customFormat,
  });
};

// Create logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  levels: LOG_LEVELS,
  transports: [
    // Console transport
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production' ? customFormat : devFormat,
    }),
    
    // Combined logs (all levels)
    createRotateFileTransport('combined'),
    
    // Error logs only
    createRotateFileTransport('error', 'error'),
    
    // Access logs for API requests
    createRotateFileTransport('access', 'info'),
  ],
  
  // Handle uncaught exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' }),
  ],
});

// Enhanced logger interface with correlation ID support
export interface LogContext {
  correlationId?: string;
  userId?: string;
  userAgent?: string;
  ip?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  responseTime?: number;
  [key: string]: any;
}

class Logger {
  private correlationId?: string;
  
  constructor(correlationId?: string) {
    this.correlationId = correlationId;
  }
  
  // Create child logger with correlation ID
  child(correlationId: string): Logger {
    return new Logger(correlationId);
  }
  
  // Generate new correlation ID
  static generateCorrelationId(): string {
    return randomUUID();
  }
  
  error(message: string, context?: LogContext | Error): void {
    const logContext = this.buildLogContext(context);
    logger.error(message, logContext);
  }
  
  warn(message: string, context?: LogContext): void {
    const logContext = this.buildLogContext(context);
    logger.warn(message, logContext);
  }
  
  info(message: string, context?: LogContext): void {
    const logContext = this.buildLogContext(context);
    logger.info(message, logContext);
  }
  
  debug(message: string, context?: LogContext): void {
    const logContext = this.buildLogContext(context);
    logger.debug(message, logContext);
  }
  
  // HTTP request logging with performance metrics
  http(message: string, context: LogContext): void {
    const logContext = this.buildLogContext({
      ...context,
      type: 'http_request'
    });
    logger.info(message, logContext);
  }
  
  // Security event logging
  security(message: string, context: LogContext): void {
    const logContext = this.buildLogContext({
      ...context,
      type: 'security_event',
      severity: 'high'
    });
    logger.warn(message, logContext);
  }
  
  // Payment transaction logging
  payment(message: string, context: LogContext): void {
    const logContext = this.buildLogContext({
      ...context,
      type: 'payment_transaction'
    });
    logger.info(message, logContext);
  }
  
  // Database operation logging
  database(message: string, context: LogContext): void {
    const logContext = this.buildLogContext({
      ...context,
      type: 'database_operation'
    });
    logger.info(message, logContext);
  }
  
  // Rate limit violation logging
  rateLimit(message: string, context: LogContext): void {
    const logContext = this.buildLogContext({
      ...context,
      type: 'rate_limit_violation',
      severity: 'medium'
    });
    logger.warn(message, logContext);
  }
  
  // File upload logging
  upload(message: string, context: LogContext): void {
    const logContext = this.buildLogContext({
      ...context,
      type: 'file_upload'
    });
    logger.info(message, logContext);
  }
  
  private buildLogContext(context?: LogContext | Error): LogContext {
    const baseContext: LogContext = {
      correlationId: this.correlationId,
    };
    
    if (context instanceof Error) {
      return {
        ...baseContext,
        error: {
          name: context.name,
          message: context.message,
          stack: context.stack,
        }
      };
    }
    
    return {
      ...baseContext,
      ...context,
    };
  }
}

// Performance monitoring helper
export class PerformanceTimer {
  private startTime: number;
  private correlationId: string;
  
  constructor(correlationId?: string) {
    this.startTime = performance.now();
    this.correlationId = correlationId || Logger.generateCorrelationId();
  }
  
  end(message: string, context?: LogContext): number {
    const endTime = performance.now();
    const duration = Math.round(endTime - this.startTime);
    
    const log = new Logger(this.correlationId);
    log.info(message, {
      ...context,
      responseTime: duration,
      unit: 'ms'
    });
    
    return duration;
  }
}

// Create default logger instance
export const log = new Logger();

// Export Logger class for creating child loggers
export { Logger };

// Export winston logger for advanced usage
export { logger as winstonLogger };

// Type exports
export type { LogContext };