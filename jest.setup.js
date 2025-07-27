// Jest setup file for global test configuration
global.console = {
  ...console,
  // Suppress console.log/warn/error during tests unless specified
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};