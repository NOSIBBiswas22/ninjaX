/**
 * NinjaX - A powerful web server and reverse proxy (Nginx clone)
 * Main entry point for the application
 */

const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const httpProxy = require('http-proxy');
const yaml = require('yaml');
const winston = require('winston');

// Import modules
const { setupLogger } = require('./utils/logger');
const { loadConfig } = require('./config/config-loader');
const { setupStaticServer } = require('./server/static-server');
const { setupReverseProxy } = require('./server/reverse-proxy');

// Initialize logger
const logger = setupLogger();

// Default port
const DEFAULT_PORT = 8080;

/**
 * Main application class
 */
class NinjaX {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.proxy = httpProxy.createProxyServer({});
    this.config = null;
    this.port = process.env.PORT || DEFAULT_PORT;
  }

  /**
   * Initialize the server
   */
  async init() {
    try {
      // Load configuration
      this.config = await loadConfig();
      if (this.config && this.config.server && this.config.server.port) {
        this.port = this.config.server.port;
      }

      // Setup middleware
      this.setupMiddleware();

      // Setup routes
      this.setupRoutes();

      // Setup error handling
      this.setupErrorHandling();

      return true;
    } catch (error) {
      logger.error(`Failed to initialize NinjaX: ${error.message}`);
      return false;
    }
  }

  /**
   * Setup middleware
   */
  setupMiddleware() {
    // Basic middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging middleware
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.url}`);
      next();
    });
  }

  /**
   * Setup routes and server configurations
   */
  setupRoutes() {
    // Setup static file serving
    setupStaticServer(this.app, this.config);

    // Setup reverse proxy if configured
    setupReverseProxy(this.app, this.proxy, this.config);

    // Default route - serve the NinjaX welcome page
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    });

    // API endpoint for server status
    this.app.get('/api/status', (req, res) => {
      res.json({
        status: 'running',
        version: require('../package.json').version,
        uptime: process.uptime()
      });
    });
  }

  /**
   * Setup error handling
   */
  setupErrorHandling() {
    // 404 handler
    this.app.use((req, res, next) => {
      res.status(404).sendFile(path.join(__dirname, '../public/404.html'));
    });

    // Error handler
    this.app.use((err, req, res, next) => {
      logger.error(`Error: ${err.message}`);
      res.status(500).sendFile(path.join(__dirname, '../public/500.html'));
    });

    // Handle proxy errors
    this.proxy.on('error', (err, req, res) => {
      logger.error(`Proxy error: ${err.message}`);
      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end('Proxy error: Unable to reach the target server');
      }
    });
  }

  /**
   * Start the server
   */
  start() {
    this.server.listen(this.port, () => {
      logger.info(`NinjaX server running on port ${this.port}`);
      logger.info(`Visit http://localhost:${this.port} to see the welcome page`);
    });
  }
}

// Create and start the server
const ninjax = new NinjaX();
ninjax.init().then(success => {
  if (success) {
    ninjax.start();
  } else {
    logger.error('Failed to start NinjaX server due to initialization errors');
    process.exit(1);
  }
});