/**
 * Reverse proxy module for NinjaX
 * Includes load balancing functionality
 */

const httpProxy = require('http-proxy');
const url = require('url');

/**
 * Load balancing algorithms
 */
const LoadBalancingAlgorithm = {
  ROUND_ROBIN: 'round_robin',
  LEAST_CONNECTIONS: 'least_connections',
  IP_HASH: 'ip_hash',
  RANDOM: 'random'
};

// Track connections and server states for load balancing
const serverState = {
  currentIndex: 0,
  connections: {},
  serverHealth: {}
};

/**
 * Check health of target servers
 * @param {Array} targets - List of target servers
 * @param {Object} healthCheckConfig - Health check configuration
 */
function startHealthChecks(targets, healthCheckConfig) {
  if (!targets || !Array.isArray(targets) || targets.length === 0) {
    return;
  }
  
  if (!healthCheckConfig || !healthCheckConfig.enabled) {
    // Set all servers as healthy by default if health checks are disabled
    targets.forEach(target => {
      serverState.serverHealth[target] = true;
    });
    return;
  }
  
  const interval = healthCheckConfig.interval || 10000; // Default: check every 10 seconds
  const path = healthCheckConfig.path || '/';
  const timeout = healthCheckConfig.timeout || 2000; // Default: 2 second timeout
  
  // Initial health check
  targets.forEach(target => {
    checkServerHealth(target, path, timeout);
  });
  
  // Schedule periodic health checks
  setInterval(() => {
    targets.forEach(target => {
      checkServerHealth(target, path, timeout);
    });
  }, interval);
}

/**
 * Check health of a single server
 * @param {String} target - Target server URL
 * @param {String} path - Health check path
 * @param {Number} timeout - Request timeout in milliseconds
 */
function checkServerHealth(target, path, timeout) {
  const http = require('http');
  const https = require('https');
  
  try {
    const targetUrl = new URL(path, target);
    const client = targetUrl.protocol === 'https:' ? https : http;
    
    const req = client.get(targetUrl.href, {
      timeout: timeout,
      headers: {
        'User-Agent': 'NinjaX-HealthCheck'
      }
    }, (res) => {
      const healthy = res.statusCode >= 200 && res.statusCode < 400;
      serverState.serverHealth[target] = healthy;
      
      if (healthy) {
        console.info(`Health check passed for ${target}`);
      } else {
        console.warn(`Health check failed for ${target}: Status code ${res.statusCode}`);
      }
      
      // Consume response data to free up memory
      res.resume();
    });
    
    req.on('error', (err) => {
      console.error(`Health check failed for ${target}: ${err.message}`);
      serverState.serverHealth[target] = false;
    });
    
    req.on('timeout', () => {
      console.error(`Health check timed out for ${target}`);
      req.destroy();
      serverState.serverHealth[target] = false;
    });
  } catch (error) {
    console.error(`Invalid health check URL for ${target}: ${error.message}`);
    serverState.serverHealth[target] = false;
  }
}

/**
 * Get target server based on load balancing algorithm
 * @param {Array} targets - List of target servers
 * @param {String} algorithm - Load balancing algorithm to use
 * @param {Object} req - Express request object
 * @returns {String} - Target server URL
 */
function getTargetServer(targets, algorithm, req) {
  if (!targets || targets.length === 0) {
    throw new Error('No target servers configured for load balancing');
  }
  
  // Filter out unhealthy servers
  const healthyTargets = targets.filter(target => {
    // If health is unknown, assume healthy
    return serverState.serverHealth[target] !== false;
  });
  
  // If no healthy targets, try using all targets as fallback
  if (healthyTargets.length === 0) {
    console.warn('No healthy targets available, using all configured targets');
    // If only one target, return it
    if (targets.length === 1) {
      return targets[0];
    }
  } else {
    // If only one healthy target, return it
    if (healthyTargets.length === 1) {
      return healthyTargets[0];
    }
    
    // Use healthy targets for load balancing
    targets = healthyTargets;
  }

  switch (algorithm) {
    case LoadBalancingAlgorithm.ROUND_ROBIN:
      // Simple round-robin algorithm
      serverState.currentIndex = (serverState.currentIndex + 1) % targets.length;
      return targets[serverState.currentIndex];
      
    case LoadBalancingAlgorithm.LEAST_CONNECTIONS:
      // Find server with least active connections
      let minConnections = Infinity;
      let selectedServer = targets[0];
      
      targets.forEach(server => {
        const connections = serverState.connections[server] || 0;
        if (connections < minConnections) {
          minConnections = connections;
          selectedServer = server;
        }
      });
      
      return selectedServer;
      
    case LoadBalancingAlgorithm.IP_HASH:
      // Distribute based on client IP hash
      const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const ipSum = clientIp.split('.').reduce((sum, octet) => sum + parseInt(octet, 10), 0);
      return targets[ipSum % targets.length];
      
    case LoadBalancingAlgorithm.RANDOM:
      // Random selection
      return targets[Math.floor(Math.random() * targets.length)];
      
    default:
      // Default to round-robin
      serverState.currentIndex = (serverState.currentIndex + 1) % targets.length;
      return targets[serverState.currentIndex];
  }
}

/**
 * Track connection to target server
 * @param {String} target - Target server URL
 * @param {Boolean} increment - Whether to increment or decrement connection count
 */
function trackConnection(target, increment = true) {
  if (!serverState.connections[target]) {
    serverState.connections[target] = 0;
  }
  
  if (increment) {
    serverState.connections[target]++;
  } else if (serverState.connections[target] > 0) {
    serverState.connections[target]--;
  }
}

/**
 * Setup reverse proxy functionality
 * @param {Object} app - Express application instance
 * @param {Object} proxy - HTTP Proxy instance
 * @param {Object} config - Server configuration
 */
function setupReverseProxy(app, proxy, config) {
  // Check if proxy is enabled
  if (!config || !config.proxy || !config.proxy.enabled) {
    console.info('Reverse proxy is disabled');
    return;
  }

  try {
    // Get proxy locations
    const locations = config.proxy.locations || [];
    
    if (locations.length === 0) {
      console.warn('Reverse proxy is enabled but no locations are configured');
      return;
    }

    // Setup each proxy location
    locations.forEach(location => {
      if (!location.path || !location.target) {
        console.warn('Invalid proxy location configuration, missing path or target');
        return;
      }

      // Get proxy options
      const options = location.options || {};
      
      // Setup proxy middleware for this location
      app.use(location.path, (req, res, next) => {
        // Handle load balancing if multiple targets are configured
        let target = location.target;
        
        if (Array.isArray(location.targets) && location.targets.length > 0) {
          const algorithm = location.loadBalancing?.algorithm || LoadBalancingAlgorithm.ROUND_ROBIN;
          
          // Start health checks if configured
          if (location.loadBalancing?.healthCheck && !location._healthChecksStarted) {
            startHealthChecks(location.targets, location.loadBalancing.healthCheck);
            location._healthChecksStarted = true;
          }
          
          try {
            target = getTargetServer(location.targets, algorithm, req);
            console.info(`Load balancing: Selected target ${target} using ${algorithm} algorithm`);
          } catch (error) {
            console.error(`Load balancing error: ${error.message}`);
            target = location.target; // Fallback to default target
          }
        }
        // Apply path rewrite if configured
        if (options.pathRewrite && typeof options.pathRewrite === 'object') {
          const originalUrl = req.url;
          
          // Apply each rewrite rule
          Object.keys(options.pathRewrite).forEach(pattern => {
            const regex = new RegExp(pattern);
            const replacement = options.pathRewrite[pattern];
            req.url = req.url.replace(regex, replacement);
          });
          
          console.info('Rewriting URL: ' + originalUrl + ' -> ' + req.url);
        }

        // Track connection for load balancing metrics
        if (Array.isArray(location.targets)) {
          trackConnection(target, true);
          
          // Track response completion to update connection count
          res.on('finish', () => {
            trackConnection(target, false);
          });
        }
        
        // Forward the request to the target
        proxy.web(req, res, {
          target: target,
          changeOrigin: options.changeOrigin || false,
          ws: options.ws || false,
          secure: options.secure !== false, // Default to true
          xfwd: options.xfwd || false,
          toProxy: options.toProxy || false,
          prependPath: options.prependPath !== false, // Default to true
          ignorePath: options.ignorePath || false,
          autoRewrite: options.autoRewrite || false,
          followRedirects: options.followRedirects || false
        }, err => {
          if (err) {
            console.error(`Proxy error for ${location.path}: ${err.message}`);
            next(err);
          }
        });
      });

      console.info('Proxy configured: ' + location.path + ' -> ' + location.target);
    });

    // Setup WebSocket proxy if enabled
    if (config.proxy.ws) {
      const server = app.get('server');
      if (server) {
        server.on('upgrade', (req, socket, head) => {
          const parsedUrl = url.parse(req.url);
          const path = parsedUrl.pathname;

          // Find matching location for the WebSocket
          const wsLocation = locations.find(location => {
            return path.startsWith(location.path) && location.options && location.options.ws;
          });

          if (wsLocation) {
            proxy.ws(req, socket, head, {
              target: wsLocation.target,
              ws: true
            });
            console.info('WebSocket proxied: ' + path + ' -> ' + wsLocation.target);
          } else {
            socket.destroy();
          }
        });

        console.info('WebSocket proxy support enabled');
      } else {
        console.warn('WebSocket proxy support requested but server instance not available');
      }
    }
  } catch (error) {
    console.error('Failed to setup reverse proxy: ' + error.message);
  }
}

module.exports = {
  setupReverseProxy,
  serverState
};