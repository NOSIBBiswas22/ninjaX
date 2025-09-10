/**
 * Data service module for NinjaX
 * Provides real-time data for the application
 */

const os = require('os');
const fs = require('fs');
const path = require('path');

/**
 * Class representing the data service
 */
class DataService {
  constructor() {
    this.cache = {};
    this.cacheTimeout = 60000; // 1 minute cache timeout
    this.serverStartTime = Date.now();
  }

  /**
   * Get server statistics
   * @returns {Object} Server statistics
   */
  getServerStats() {
    const stats = {
      uptime: Math.floor((Date.now() - this.serverStartTime) / 1000),
      cpuUsage: process.cpuUsage(),
      memoryUsage: process.memoryUsage(),
      systemMemory: {
        total: os.totalmem(),
        free: os.freemem()
      },
      hostname: os.hostname(),
      platform: os.platform(),
      cpus: os.cpus().length,
      loadAverage: os.loadavg(),
      timestamp: new Date().toISOString()
    };

    return stats;
  }

  /**
   * Get proxy statistics
   * @param {Object} serverState - Server state from reverse proxy
   * @returns {Object} Proxy statistics
   */
  getProxyStats(serverState) {
    if (!serverState) {
      return { error: 'Server state not available' };
    }

    return {
      connections: serverState.connections || {},
      serverHealth: serverState.serverHealth || {},
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get configuration data
   * @param {Object} config - Server configuration
   * @returns {Object} Configuration data
   */
  getConfigData(config) {
    if (!config) {
      return { error: 'Configuration not available' };
    }

    // Return a sanitized version of the config (without sensitive data)
    return {
      server: {
        port: config.server?.port || 8080,
        host: config.server?.host || '0.0.0.0',
        workers: config.server?.workers || 1
      },
      proxy: {
        enabled: config.proxy?.enabled || false,
        locations: (config.proxy?.locations || []).map(loc => ({
          path: loc.path,
          target: loc.target,
          targetsCount: Array.isArray(loc.targets) ? loc.targets.length : 0,
          loadBalancing: loc.loadBalancing?.algorithm || 'none'
        }))
      },
      static: {
        enabled: config.http?.static?.enabled || false,
        root: config.http?.static?.root || './public'
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get sample data for demo purposes
   * @returns {Object} Sample data
   */
  getSampleData() {
    // Check cache first
    if (this.cache.sampleData && (Date.now() - this.cache.sampleData.timestamp) < this.cacheTimeout) {
      return this.cache.sampleData.data;
    }

    // Generate sample data
    const data = {
      users: [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User' },
        { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Manager' },
        { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'Developer' }
      ],
      stats: {
        activeUsers: Math.floor(Math.random() * 1000) + 500,
        requestsPerMinute: Math.floor(Math.random() * 500) + 100,
        averageResponseTime: Math.floor(Math.random() * 100) + 50,
        errorRate: (Math.random() * 2).toFixed(2)
      },
      features: [
        { name: 'Load Balancing', status: 'active', description: 'Distribute traffic across multiple servers' },
        { name: 'Static File Serving', status: 'active', description: 'Serve static files efficiently' },
        { name: 'Reverse Proxy', status: 'active', description: 'Forward requests to backend services' },
        { name: 'Health Checks', status: 'active', description: 'Monitor backend service health' },
        { name: 'Real-time Data', status: 'active', description: 'Provide real-time data to clients' }
      ],
      timestamp: new Date().toISOString()
    };

    // Cache the data
    this.cache.sampleData = {
      data,
      timestamp: Date.now()
    };

    return data;
  }

  /**
   * Get logs data
   * @param {Number} limit - Maximum number of log entries to return
   * @returns {Array} Log entries
   */
  getLogsData(limit = 10) {
    // Generate sample logs
    const logTypes = ['info', 'warn', 'error', 'debug'];
    const logSources = ['server', 'proxy', 'static', 'config'];
    const logMessages = [
      'Server started',
      'Request received',
      'Proxy forwarded request',
      'File not found',
      'Configuration loaded',
      'Health check passed',
      'Health check failed',
      'Connection closed',
      'Memory usage high',
      'CPU usage high'
    ];

    const logs = [];
    const now = Date.now();

    for (let i = 0; i < limit; i++) {
      const timestamp = new Date(now - (i * 60000)).toISOString();
      const type = logTypes[Math.floor(Math.random() * logTypes.length)];
      const source = logSources[Math.floor(Math.random() * logSources.length)];
      const message = logMessages[Math.floor(Math.random() * logMessages.length)];

      logs.push({
        timestamp,
        type,
        source,
        message
      });
    }

    return logs;
  }
}

module.exports = new DataService();