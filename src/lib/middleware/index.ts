// Middleware exports for easy importing
export { 
  withLogging, 
  createLoggingWrapper,
  loggingMiddleware,
  loggedRoute,
  type LoggingMiddlewareConfig 
} from './logging';

// Re-export logger for convenience
export { log, Logger, PerformanceTimer, type LogContext } from '../logger';