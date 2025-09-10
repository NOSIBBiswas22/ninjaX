# NinjaX API Reference

This document provides a comprehensive reference for NinjaX's API endpoints and programmatic interfaces.

## Status Endpoints

### GET /status

Returns the current status of the NinjaX server.

**Request:**

```
GET /status
```

**Response:**

```json
{
  "status": "running",
  "uptime": "0 days, 0 hours, 5 minutes, 30 seconds",
  "version": "1.0.0",
  "memory": {
    "rss": "35MB",
    "heapTotal": "20MB",
    "heapUsed": "15MB",
    "external": "2MB"
  },
  "cpu": "2.5%"
}
```

**Status Codes:**

- `200 OK`: Server is running normally

## Programmatic API

NinjaX can also be used programmatically in your Node.js applications.

### Basic Usage

```javascript
const NinjaX = require('ninjax');

// Create a new NinjaX server instance
const server = new NinjaX({
  port: 3000,
  static: {
    enabled: true,
    root: './public'
  },
  proxy: {
    enabled: true,
    locations: [
      {
        path: '/api',
        target: 'http://localhost:8000',
        options: {
          changeOrigin: true
        }
      }
    ]
  }
});

// Start the server
server.start()
  .then(() => {
    console.log('NinjaX server started on port 3000');
  })
  .catch(err => {
    console.error('Failed to start NinjaX server:', err);
  });

// Stop the server
process.on('SIGINT', () => {
  server.stop()
    .then(() => {
      console.log('NinjaX server stopped');
      process.exit(0);
    })
    .catch(err => {
      console.error('Failed to stop NinjaX server:', err);
      process.exit(1);
    });
});
```

### NinjaX Class

#### Constructor

```javascript
const server = new NinjaX(options);
```

**Options:**

- `port` (number): Port to listen on (default: 8080)
- `host` (string): Host to bind to (default: '0.0.0.0')
- `workers` (number): Number of worker processes (default: 1)
- `logging` (object): Logging configuration
  - `level` (string): Log level (default: 'info')
  - `access_log` (string): Access log file path (default: 'logs/access.log')
  - `error_log` (string): Error log file path (default: 'logs/error.log')
- `static` (object): Static file serving configuration
  - `enabled` (boolean): Enable static file serving (default: true)
  - `root` (string): Root directory for static files (default: './public')
  - `options` (object): Static file serving options
    - `index` (array): Default index files (default: ['index.html', 'index.htm'])
    - `extensions` (array): File extensions to serve (default: ['html', 'htm'])
    - `fallthrough` (boolean): Continue to next middleware if file not found (default: true)
- `proxy` (object): Reverse proxy configuration
  - `enabled` (boolean): Enable reverse proxy (default: false)
  - `ws` (boolean): Enable WebSocket support globally (default: false)
  - `locations` (array): Proxy locations
    - `path` (string): Path to match for proxying
    - `target` (string): Target server URL
    - `options` (object): Proxy options
      - `changeOrigin` (boolean): Change the origin of the host header (default: true)
      - `pathRewrite` (object): URL rewriting rules
      - `ws` (boolean): Enable WebSocket for this location (default: false)

#### Methods

##### start()

Starts the NinjaX server.

```javascript
server.start()
  .then(() => {
    console.log('Server started');
  })
  .catch(err => {
    console.error('Failed to start server:', err);
  });
```

**Returns:** Promise that resolves when the server has started.

##### stop()

Stops the NinjaX server.

```javascript
server.stop()
  .then(() => {
    console.log('Server stopped');
  })
  .catch(err => {
    console.error('Failed to stop server:', err);
  });
```

**Returns:** Promise that resolves when the server has stopped.

##### reload()

Reloads the NinjaX server configuration.

```javascript
server.reload()
  .then(() => {
    console.log('Configuration reloaded');
  })
  .catch(err => {
    console.error('Failed to reload configuration:', err);
  });
```

**Returns:** Promise that resolves when the configuration has been reloaded.

##### getStatus()

Returns the current status of the NinjaX server.

```javascript
const status = server.getStatus();
console.log(status);
```

**Returns:** Object containing server status information.

### Events

NinjaX instances emit the following events:

#### 'start'

Emitted when the server starts.

```javascript
server.on('start', () => {
  console.log('Server started');
});
```

#### 'stop'

Emitted when the server stops.

```javascript
server.on('stop', () => {
  console.log('Server stopped');
});
```

#### 'error'

Emitted when an error occurs.

```javascript
server.on('error', (err) => {
  console.error('Server error:', err);
});
```

#### 'request'

Emitted for each incoming request.

```javascript
server.on('request', (req, res) => {
  console.log('Request received:', req.method, req.url);
});
```

## Middleware API

NinjaX supports custom middleware for extending functionality.

### Adding Middleware

```javascript
const NinjaX = require('ninjax');
const server = new NinjaX();

// Add custom middleware
server.use((req, res, next) => {
  console.log('Request received:', req.method, req.url);
  next();
});

// Add middleware for specific path
server.use('/api', (req, res, next) => {
  console.log('API request received:', req.method, req.url);
  next();
});

server.start();
```

### Middleware Order

Middleware is executed in the order it is added. The default middleware order in NinjaX is:

1. Logging middleware
2. Static file middleware (if enabled)
3. Custom middleware (added via `use()`)
4. Proxy middleware (if enabled)
5. Default 404 handler

## Error Handling

NinjaX provides several ways to handle errors:

### Global Error Handler

```javascript
const NinjaX = require('ninjax');
const server = new NinjaX();

// Set global error handler
server.setErrorHandler((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send('Something went wrong!');
});

server.start();
```

### Error Middleware

```javascript
server.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send('Something went wrong!');
});
```

## Extending NinjaX

NinjaX can be extended with plugins to add new functionality.

### Creating a Plugin

```javascript
function myPlugin(options) {
  return function(server) {
    // Add middleware
    server.use((req, res, next) => {
      // Plugin logic
      next();
    });
    
    // Add methods
    server.myMethod = function() {
      // Method implementation
    };
    
    // Return plugin API
    return {
      name: 'my-plugin',
      version: '1.0.0'
    };
  };
}

module.exports = myPlugin;
```

### Using a Plugin

```javascript
const NinjaX = require('ninjax');
const myPlugin = require('./my-plugin');

const server = new NinjaX();

// Use plugin
server.use(myPlugin({
  // Plugin options
}));

server.start();
```

## WebSocket Support

NinjaX supports WebSocket connections through the proxy configuration:

```javascript
const NinjaX = require('ninjax');

const server = new NinjaX({
  proxy: {
    enabled: true,
    ws: true, // Enable WebSocket support globally
    locations: [
      {
        path: '/socket',
        target: 'http://localhost:5000',
        options: {
          ws: true // Enable WebSocket for this location
        }
      }
    ]
  }
});

server.start();
```

## Command Line Interface

NinjaX provides a command-line interface for starting and managing the server:

```bash
# Start the server
npm start

# Start the server with a specific configuration file
NINJAX_CONFIG=./config/custom.yaml npm start

# Start the server on a specific port
PORT=3000 npm start
```