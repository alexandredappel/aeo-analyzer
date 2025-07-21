/**
 * Simple logging utility for AEO Auditor API
 * Provides formatted console output with timestamps and colors
 */

// Interface pour les codes de couleur ANSI
interface ColorCodes {
  readonly reset: string;
  readonly bright: string;
  readonly dim: string;
  readonly red: string;
  readonly green: string;
  readonly yellow: string;
  readonly blue: string;
  readonly magenta: string;
  readonly cyan: string;
  readonly white: string;
}

// Type pour les niveaux de log
type LogLevel = 'INFO' | 'ERROR' | 'WARN' | 'SUCCESS' | 'REQUEST';

// ANSI color codes for console output
const colors: ColorCodes = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
} as const;

/**
 * Format timestamp for logging
 * @returns Formatted timestamp
 */
function getTimestamp(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

/**
 * Format log message with color and timestamp
 * @param level - Log level (INFO, ERROR, WARN)
 * @param message - Log message
 * @param color - ANSI color code
 * @returns Formatted log message
 */
function formatMessage(level: LogLevel, message: string, color: string): string {
  const timestamp = getTimestamp();
  return `${colors.dim}[${timestamp}]${colors.reset} ${color}${level}${colors.reset} ${message}`;
}

/**
 * Interface pour l'objet logger
 */
interface Logger {
  info: (message: string) => void;
  error: (message: string, error?: Error | null) => void;
  warn: (message: string) => void;
  success: (message: string) => void;
  request: (method: string, url: string, statusCode: number, responseTime: number) => void;
}

/**
 * Logger object with different log levels
 */
const logger: Logger = {
  /**
   * Log info message in blue
   * @param message - Message to log
   */
  info: (message: string): void => {
    console.log(formatMessage('INFO', message, colors.blue));
  },

  /**
   * Log error message in red
   * @param message - Message to log
   * @param error - Optional error object
   */
  error: (message: string, error: Error | null = null): void => {
    const fullMessage = error ? `${message}: ${error.message}` : message;
    console.error(formatMessage('ERROR', fullMessage, colors.red));
  },

  /**
   * Log warning message in yellow
   * @param message - Message to log
   */
  warn: (message: string): void => {
    console.warn(formatMessage('WARN', message, colors.yellow));
  },

  /**
   * Log success message in green
   * @param message - Message to log
   */
  success: (message: string): void => {
    console.log(formatMessage('SUCCESS', message, colors.green));
  },

  /**
   * Log request information
   * @param method - HTTP method
   * @param url - Request URL
   * @param statusCode - Response status code
   * @param responseTime - Response time in ms
   */
  request: (method: string, url: string, statusCode: number, responseTime: number): void => {
    const statusColor = statusCode >= 400 ? colors.red : statusCode >= 300 ? colors.yellow : colors.green;
    const message = `${method} ${url} ${statusColor}${statusCode}${colors.reset} - ${responseTime}ms`;
    console.log(formatMessage('REQUEST', message, colors.cyan));
  }
};

export default logger;
export type { Logger, LogLevel, ColorCodes }; 