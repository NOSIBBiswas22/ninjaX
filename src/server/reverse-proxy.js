/**
 * Reverse proxy module for NinjaX
 */

const httpProxy = require('http-proxy');
const url = require('url');

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

        // Forward the request to the target
        proxy.web(req, res, {
          target: location.target,
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
  setupReverseProxy
};