/**
 * File watcher utility for NinjaX
 * Monitors configuration files for changes and triggers server restart
 */

const fs = require('fs');
const path = require('path');
const winston = require('winston');

/**
 * Setup file watcher for configuration files
 * @param {string} configPath - Path to the configuration file to watch
 * @param {Function} onChangeCallback - Callback function to execute when changes are detected
 * @param {winston.Logger} logger - Logger instance
 * @returns {fs.FSWatcher} - File watcher instance
 */
function setupConfigWatcher(configPath, onChangeCallback, logger) {
  // Ensure the file exists before watching
  if (!fs.existsSync(configPath)) {
    logger.warn('Cannot watch config file: ' + configPath + ' (file does not exist)');
    return null;
  }

  logger.info('Setting up file watcher for: ' + configPath);

  // Create file watcher
  const watcher = fs.watch(configPath, (eventType, filename) => {
    if (eventType === 'change') {
      logger.info('Configuration file changed: ' + filename);
      
      // Add a small delay to ensure the file is completely written
      setTimeout(() => {
        try {
          // Execute the callback function
          onChangeCallback();
        } catch (error) {
          logger.error('Error handling config file change: ' + error.message);
        }
      }, 100);
    }
  });

  // Handle watcher errors
  watcher.on('error', (error) => {
    logger.error('File watcher error: ' + error.message);
  });

  return watcher;
}

module.exports = {
  setupConfigWatcher
};