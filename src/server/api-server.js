/**
 * API server module for NinjaX
 * Provides real-time data API endpoints
 */

const express = require('express');
const dataService = require('../services/data-service');

/**
 * Setup API server
 * @param {Object} app - Express application instance
 * @param {Object} config - Server configuration
 * @param {Object} serverState - Server state from reverse proxy
 */
function setupApiServer(app, config, serverState) {
  // Create API router
  const apiRouter = express.Router();

  // Add CORS headers for API requests
  apiRouter.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  // Server stats endpoint
  apiRouter.get('/stats/server', (req, res) => {
    try {
      const stats = dataService.getServerStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Proxy stats endpoint
  apiRouter.get('/stats/proxy', (req, res) => {
    try {
      const stats = dataService.getProxyStats(serverState);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Config data endpoint
  apiRouter.get('/config', (req, res) => {
    try {
      const configData = dataService.getConfigData(config);
      res.json(configData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Sample data endpoint
  apiRouter.get('/sample', (req, res) => {
    try {
      const sampleData = dataService.getSampleData();
      res.json(sampleData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Logs data endpoint
  apiRouter.get('/logs', (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const logs = dataService.getLogsData(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Mount the API router
  app.use('/api/v1', apiRouter);
  console.info('API server endpoints mounted at /api/v1');
}

module.exports = {
  setupApiServer
};