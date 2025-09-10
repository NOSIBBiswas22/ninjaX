/**
 * Static file server module for NinjaX
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

/**
 * Setup static file serving
 * @param {Object} app - Express application instance
 * @param {Object} config - Server configuration
 */
function setupStaticServer(app, config) {
  // Check if static file serving is enabled
  if (!config || !config.http || !config.http.static || !config.http.static.enabled) {
    console.info('Static file serving is disabled');
    return;
  }

  try {
    // Get static configuration
    const staticConfig = config.http.static;
    const rootDir = path.resolve(staticConfig.root || './public');
    const options = staticConfig.options || {};

    // Ensure the static directory exists
    if (!fs.existsSync(rootDir)) {
      fs.mkdirSync(rootDir, { recursive: true });
      console.info('Created static directory: ' + rootDir);
    }

    // Setup static file serving
    app.use(express.static(rootDir, options));
    console.info('Static file serving enabled from: ' + rootDir);

    // If no default index.html exists, create one
    const defaultIndexPath = path.join(rootDir, 'index.html');
    if (!fs.existsSync(defaultIndexPath)) {
      // Create default public directory and index.html if they don't exist
      createDefaultPublicFiles(rootDir);
    }
  } catch (error) {
    console.error(`Failed to setup static file serving: ${error.message}`);
  }
}

module.exports = {
  setupStaticServer
};