/**
 * Logger utility for NinjaX
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');

/**
 * Setup the application logger
 */
function setupLogger() {
  // Create logs directory if it doesn't exist
  const logsDir = path.join(__dirname, '../../logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  // Define log format
  const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(function(info) {
      return '[' + info.timestamp + '] [' + info.level.toUpperCase() + '] ' + info.message;
    })
  );

  // Create logger instance
  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    transports: [
      // Console transport
      new winston.transports.Console(),
      // File transport for all logs
      new winston.transports.File({ 
        filename: path.join(logsDir, 'ninjax.log'),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
      // File transport for error logs
      new winston.transports.File({ 
        filename: path.join(logsDir, 'error.log'),
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      })
    ]
  });

  return logger;
}

module.exports = {
  setupLogger
};