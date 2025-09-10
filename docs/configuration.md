# NinjaX Configuration Guide

This guide provides detailed information about configuring NinjaX to suit your specific needs.

## Configuration File

NinjaX uses a YAML configuration file located at `config/ninjax.yaml`. This file contains all the settings for the server, including port, static file serving, reverse proxy, and logging.

## Configuration Structure

The configuration file is structured into several sections:

```yaml
# Server settings
server:
  port: 8080
  host: 0.0.0.0
  workers: 1

# Logging configuration
logging:
  level: info
  access_log: logs/access.log
  error_log: logs/error.log

# HTTP server settings
http:
  static:
    enabled: true
    root: ./public
    options:
      index:
        - index.html
        - index.htm
      extensions:
        - html
        - htm
      fallthrough: true

# Reverse proxy settings
proxy:
  enabled: false
  ws: false
  locations:
    # Example proxy configuration
    # - path: /api
    #   target: http://localhost:3000
    #   options:
    #     changeOrigin: true
    #     pathRewrite:
    #       '^/api': ''
    #     ws: false
```

## Server Settings

The `server` section contains basic server configuration:

```yaml
server:
  port: 8080            # Port to listen on
  host: 0.0.0.0         # Host to bind to (0.0.0.0 for all interfaces)
  workers: 1            # Number of worker processes
```

### Options

- **port**: The port number the server will listen on (default: 8080)
- **host**: The host address to bind to (default: 0.0.0.0, which means all network interfaces)
- **workers**: Number of worker processes to spawn (default: 1)

## Logging Configuration

The `logging` section configures the logging behavior:

```yaml
logging:
  level: info           # Log level (debug, info, warn, error)
  access_log: logs/access.log  # Access log file path
  error_log: logs/error.log    # Error log file path
```

### Options

- **level**: The minimum log level to record (debug, info, warn, error)
- **access_log**: Path to the access log file
- **error_log**: Path to the error log file

## HTTP Server Settings

The `http` section configures the HTTP server behavior, including static file serving:

```yaml
http:
  static:
    enabled: true       # Enable static file serving
    root: ./public      # Root directory for static files
    options:
      index:            # Default index files
        - index.html
        - index.htm
      extensions:       # File extensions to serve
        - html
        - htm
      fallthrough: true # Continue to next middleware if file not found
```

### Static File Serving Options

- **enabled**: Enable or disable static file serving
- **root**: Root directory for static files
- **options.index**: List of files to serve as index files
- **options.extensions**: List of file extensions to serve
- **options.fallthrough**: Whether to continue to the next middleware if a file is not found

## Reverse Proxy Settings

The `proxy` section configures the reverse proxy behavior:

```yaml
proxy:
  enabled: true         # Enable reverse proxy
  ws: false             # Enable WebSocket support globally
  locations:            # Proxy locations
    - path: /api        # Path to match
      target: http://localhost:3000  # Target server
      options:
        changeOrigin: true  # Change the origin of the host header
        pathRewrite:        # URL rewriting rules
          '^/api': ''      # Remove /api prefix
        ws: false          # Enable WebSocket for this location
```

### Proxy Options

- **enabled**: Enable or disable reverse proxy
- **ws**: Enable or disable WebSocket support globally
- **locations**: List of proxy locations

### Location Options

- **path**: Path to match for proxying
- **target**: Target server URL
- **options.changeOrigin**: Change the origin of the host header to the target URL
- **options.pathRewrite**: URL rewriting rules (regex pattern -> replacement)
- **options.ws**: Enable or disable WebSocket support for this location
- **options.secure**: Verify SSL certificates (default: true)
- **options.xfwd**: Add x-forwarded headers (default: false)
- **options.toProxy**: Pass the absolute URL as the path (default: false)
- **options.prependPath**: Prepend target's path to request path (default: true)
- **options.ignorePath**: Ignore the proxy path of the incoming request (default: false)
- **options.autoRewrite**: Rewrite the location headers (default: false)
- **options.followRedirects**: Follow redirects (default: false)

## Environment Variables

NinjaX also supports configuration through environment variables, which take precedence over the configuration file:

- **PORT**: Server port
- **HOST**: Server host
- **LOG_LEVEL**: Logging level

Example:

```bash
PORT=3000 npm start
```

## Configuration Examples

### Basic Web Server

```yaml
server:
  port: 8080
  host: 0.0.0.0

http:
  static:
    enabled: true
    root: ./public

proxy:
  enabled: false
```

### Reverse Proxy for API

```yaml
server:
  port: 80
  host: 0.0.0.0

http:
  static:
    enabled: true
    root: ./public

proxy:
  enabled: true
  locations:
    - path: /api
      target: http://localhost:3000
      options:
        changeOrigin: true
        pathRewrite:
          '^/api': ''
```

### Multiple Backend Services

```yaml
server:
  port: 80
  host: 0.0.0.0

http:
  static:
    enabled: true
    root: ./public

proxy:
  enabled: true
  locations:
    - path: /api
      target: http://localhost:3000
      options:
        changeOrigin: true
        pathRewrite:
          '^/api': ''
    - path: /auth
      target: http://localhost:4000
      options:
        changeOrigin: true
    - path: /socket
      target: http://localhost:5000
      options:
        ws: true
```

## Reloading Configuration

NinjaX includes an auto-restart feature that automatically detects changes to the configuration file and restarts the server to apply the changes:

1. **Built-in File Watcher**: The server includes a built-in file watcher that monitors the `config/ninjax.yaml` file for changes. When changes are detected, the server automatically restarts to apply the new configuration.

2. **Development Mode**: When running with `npm run dev`, nodemon watches both JavaScript source files and YAML configuration files, restarting the server when any changes are detected.

This means you can edit your configuration file and the changes will be applied automatically without manual intervention. You'll see log messages indicating that the server is restarting due to configuration changes.

If you need to manually restart the server:

```bash
npm restart
```

## Validating Configuration

To validate your configuration without starting the server, you can use the validate command (coming soon):

```bash
npm run validate-config
```

## Best Practices

1. **Security**: Be careful when configuring proxy settings, especially when exposing services to the internet.
2. **Performance**: Use multiple workers on multi-core systems for better performance.
3. **Logging**: Use appropriate log levels to avoid excessive log files.
4. **Paths**: Use absolute paths for file locations to avoid confusion.
5. **Backup**: Keep a backup of your working configuration before making changes.