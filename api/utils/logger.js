/**
 * Simple logging utility for AEO Auditor API
 * Provides formatted console output with timestamps and colors
 */

// ANSI color codes for console output
const colors = {
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
};

/**
 * Format timestamp for logging
 * @returns {string} Formatted timestamp
 */
function getTimestamp() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

/**
 * Format log message with color and timestamp
 * @param {string} level - Log level (INFO, ERROR, WARN)
 * @param {string} message - Log message
 * @param {string} color - ANSI color code
 * @returns {string} Formatted log message
 */
function formatMessage(level, message, color) {
  const timestamp = getTimestamp();
  return `${colors.dim}[${timestamp}]${colors.reset} ${color}${level}${colors.reset} ${message}`;
}

/**
 * Logger object with different log levels
 */
const logger = {
  /**
   * Log info message in blue
   * @param {string} message - Message to log
   */
  info: (message) => {
    console.log(formatMessage('INFO', message, colors.blue));
  },

  /**
   * Log error message in red
   * @param {string} message - Message to log
   * @param {Error} [error] - Optional error object
   */
  error: (message, error = null) => {
    const fullMessage = error ? `${message}: ${error.message}` : message;
    console.error(formatMessage('ERROR', fullMessage, colors.red));
  },

  /**
   * Log warning message in yellow
   * @param {string} message - Message to log
   */
  warn: (message) => {
    console.warn(formatMessage('WARN', message, colors.yellow));
  },

  /**
   * Log success message in green
   * @param {string} message - Message to log
   */
  success: (message) => {
    console.log(formatMessage('SUCCESS', message, colors.green));
  },

  /**
   * Log request information
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {number} statusCode - Response status code
   * @param {number} responseTime - Response time in ms
   */
  request: (method, url, statusCode, responseTime) => {
    const statusColor = statusCode >= 400 ? colors.red : statusCode >= 300 ? colors.yellow : colors.green;
    const message = `${method} ${url} ${statusColor}${statusCode}${colors.reset} - ${responseTime}ms`;
    console.log(formatMessage('REQUEST', message, colors.cyan));
  }
};

module.exports = logger; 