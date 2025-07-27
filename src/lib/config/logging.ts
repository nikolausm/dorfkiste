/**
 * Centralized logging configuration for different environments
 */

export interface LoggingConfig {
  level: string;
  enableFileLogging: boolean;
  enableConsoleLogging: boolean;
  logDirectory: string;
  maxFileSize: string;
  maxFiles: string;
  enableRequestLogging: boolean;
  enablePerformanceMonitoring: boolean;
  enableSecurityLogging: boolean;
  enableDatabaseLogging: boolean;
  slowQueryThreshold: number; // milliseconds
  performanceThreshold: number; // milliseconds
  rateLimitLogging: boolean;
  sensitiveDataFiltering: boolean;
  correlationIdHeader: string;
  logFormat: 'json' | 'text';
  timezone: string;
}

// Base configuration
const baseConfig: LoggingConfig = {
  level: 'info',
  enableFileLogging: true,
  enableConsoleLogging: true,
  logDirectory: 'logs',
  maxFileSize: '20m',
  maxFiles: '14d',
  enableRequestLogging: true,
  enablePerformanceMonitoring: true,
  enableSecurityLogging: true,
  enableDatabaseLogging: true,
  slowQueryThreshold: 1000,
  performanceThreshold: 5000,
  rateLimitLogging: true,
  sensitiveDataFiltering: true,
  correlationIdHeader: 'x-correlation-id',
  logFormat: 'json',
  timezone: 'UTC',
};

// Development configuration
export const developmentConfig: LoggingConfig = {
  ...baseConfig,
  level: 'debug',
  logFormat: 'text', // More readable in development
  slowQueryThreshold: 500, // Lower threshold for development
  performanceThreshold: 2000,
};

// Production configuration
export const productionConfig: LoggingConfig = {
  ...baseConfig,
  level: 'info',
  enableConsoleLogging: false, // Reduce noise in production
  maxFileSize: '100m',
  maxFiles: '30d',
  slowQueryThreshold: 2000, // Higher threshold for production
  performanceThreshold: 10000,
};

// Testing configuration
export const testConfig: LoggingConfig = {
  ...baseConfig,
  level: 'warn', // Reduce log noise during tests
  enableFileLogging: false, // Don't create files during tests
  enableRequestLogging: false,
  enablePerformanceMonitoring: false,
  rateLimitLogging: false,
};

// Staging configuration
export const stagingConfig: LoggingConfig = {
  ...baseConfig,
  level: 'debug', // More verbose for debugging staging issues
  maxFileSize: '50m',
  maxFiles: '7d',
  slowQueryThreshold: 1000,
  performanceThreshold: 5000,
};

// Get configuration based on environment
export function getLoggingConfig(): LoggingConfig {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return productionConfig;
    case 'staging':
      return stagingConfig;
    case 'test':
      return testConfig;
    case 'development':
    default:
      return developmentConfig;
  }
}

// Environment-specific overrides from environment variables
export function getEnvOverrides(): Partial<LoggingConfig> {
  const overrides: Partial<LoggingConfig> = {};
  
  if (process.env.LOG_LEVEL) {
    overrides.level = process.env.LOG_LEVEL;
  }
  
  if (process.env.LOG_DIRECTORY) {
    overrides.logDirectory = process.env.LOG_DIRECTORY;
  }
  
  if (process.env.DISABLE_FILE_LOGGING === 'true') {
    overrides.enableFileLogging = false;
  }
  
  if (process.env.DISABLE_CONSOLE_LOGGING === 'true') {
    overrides.enableConsoleLogging = false;
  }
  
  if (process.env.SLOW_QUERY_THRESHOLD) {
    overrides.slowQueryThreshold = parseInt(process.env.SLOW_QUERY_THRESHOLD, 10);
  }
  
  if (process.env.PERFORMANCE_THRESHOLD) {
    overrides.performanceThreshold = parseInt(process.env.PERFORMANCE_THRESHOLD, 10);
  }
  
  if (process.env.LOG_FORMAT) {
    overrides.logFormat = process.env.LOG_FORMAT as 'json' | 'text';
  }
  
  if (process.env.LOG_TIMEZONE) {
    overrides.timezone = process.env.LOG_TIMEZONE;
  }
  
  return overrides;
}

// Final configuration with environment overrides
export const loggingConfig: LoggingConfig = {
  ...getLoggingConfig(),
  ...getEnvOverrides(),
};

// Validation for logging configuration
export function validateLoggingConfig(config: LoggingConfig): string[] {
  const errors: string[] = [];
  
  if (!['error', 'warn', 'info', 'debug'].includes(config.level)) {
    errors.push(`Invalid log level: ${config.level}`);
  }
  
  if (config.slowQueryThreshold < 0) {
    errors.push('Slow query threshold must be non-negative');
  }
  
  if (config.performanceThreshold < 0) {
    errors.push('Performance threshold must be non-negative');
  }
  
  if (!['json', 'text'].includes(config.logFormat)) {
    errors.push(`Invalid log format: ${config.logFormat}`);
  }
  
  return errors;
}

// Log configuration at startup
export function logConfigurationAtStartup(): void {
  const config = loggingConfig;
  const errors = validateLoggingConfig(config);
  
  if (errors.length > 0) {
    console.error('Logging configuration errors:', errors);
    throw new Error(`Invalid logging configuration: ${errors.join(', ')}`);
  }
  
  console.log('Logging configuration loaded:', {
    environment: process.env.NODE_ENV || 'development',
    level: config.level,
    fileLogging: config.enableFileLogging,
    consoleLogging: config.enableConsoleLogging,
    logDirectory: config.logDirectory,
    format: config.logFormat,
    timezone: config.timezone,
  });
}