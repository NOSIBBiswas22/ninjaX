# NinjaX Documentation

Welcome to the official documentation for NinjaX, a powerful web server and reverse proxy inspired by Nginx. This documentation provides comprehensive information on installing, configuring, and using NinjaX.

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Getting Started](#getting-started)
4. [Configuration](#configuration)
5. [Static File Serving](#static-file-serving)
6. [Reverse Proxy](#reverse-proxy)
7. [Logging](#logging)
8. [API Reference](#api-reference)
9. [Troubleshooting](#troubleshooting)

## Introduction

NinjaX is a modern, JavaScript-based web server and reverse proxy designed to be a lightweight alternative to Nginx. It provides high-performance static file serving, flexible reverse proxy capabilities, and easy configuration through YAML files.

### Key Features

- **Web Server**: Serve static files with high performance and low latency
- **Reverse Proxy**: Route requests to multiple backend services seamlessly
- **Configuration**: Simple YAML-based configuration
- **Logging**: Comprehensive logging system
- **API**: Built-in API for server status and management

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation Steps

```bash
# Clone the repository
git clone https://github.com/yourusername/ninjax.git

# Navigate to the project directory
cd ninjax

# Install dependencies
npm install
```

## Getting Started

### Starting the Server

```bash
# Start the server
npm start

# Start with development mode (auto-restart on file changes)
npm run dev
```

By default, the server runs on port 8080. You can access the welcome page at http://localhost:8080.

### Directory Structure

```
.
├── config/             # Configuration files
│   └── ninjax.yaml     # Main configuration file
├── logs/               # Log files
├── public/             # Static files
│   ├── css/            # Stylesheets
│   ├── img/            # Images
│   ├── js/             # JavaScript files
│   └── index.html      # Default landing page
├── src/                # Source code
│   ├── config/         # Configuration handling
│   ├── server/         # Server implementation
│   ├── utils/          # Utility functions
│   └── index.js        # Entry point
└── package.json        # Project metadata and dependencies
```

## Configuration

NinjaX uses a YAML configuration file located at `config/ninjax.yaml`. This section describes the available configuration options.

### Server Settings

```yaml
server:
  port: 8080            # Port to listen on
  host: 0.0.0.0         # Host to bind to
  workers: 1            # Number of worker processes
```

### Logging Configuration

```yaml
logging:
  level: info           # Log level (debug, info, warn, error)
  access_log: logs/access.log  # Access log file path
  error_log: logs/error.log    # Error log file path
```

### HTTP Server Settings

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

### Reverse Proxy Settings

```yaml
proxy:
  enabled: true         # Enable reverse proxy
  ws: false             # Enable WebSocket support
  locations:            # Proxy locations
    - path: /api        # Path to match
      target: http://localhost:3000  # Target server
      options:
        changeOrigin: true  # Change the origin of the host header
        pathRewrite:        # URL rewriting rules
          '^/api': ''      # Remove /api prefix
        ws: false          # Enable WebSocket for this location
```

## Static File Serving

NinjaX can serve static files from a specified directory. By default, it serves files from the `public` directory.

### Configuration

To configure static file serving, modify the `http.static` section in the configuration file:

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

### Adding Static Files

Place your static files in the directory specified by the `root` option. NinjaX will serve these files when requests match the corresponding paths.

## Reverse Proxy

NinjaX can proxy requests to other servers, making it ideal for creating a unified frontend for multiple backend services.

### Configuration

To configure reverse proxy, modify the `proxy` section in the configuration file:

```yaml
proxy:
  enabled: true         # Enable reverse proxy
  ws: false             # Enable WebSocket support
  locations:            # Proxy locations
    - path: /api        # Path to match
      target: http://localhost:3000  # Target server
      options:
        changeOrigin: true  # Change the origin of the host header
        pathRewrite:        # URL rewriting rules
          '^/api': ''      # Remove /api prefix
        ws: false          # Enable WebSocket for this location
```

### Path Rewriting

You can rewrite the URL path before forwarding the request to the target server using the `pathRewrite` option. This is useful for removing prefixes or changing the path structure.

### WebSocket Support

To enable WebSocket support for a specific location, set the `ws` option to `true` in the location's options.

## Logging

NinjaX provides comprehensive logging through Winston. Logs are stored in the `logs` directory by default.

### Log Levels

- **debug**: Detailed debugging information
- **info**: General information about server operation
- **warn**: Warning messages
- **error**: Error messages

### Log Files

- **access.log**: Records all HTTP requests
- **error.log**: Records error messages
- **ninjax.log**: Records all log messages

## API Reference

NinjaX provides a simple API for server status and management.

### Server Status

```
GET /api/status
```

Returns the current server status, including:

- **status**: Server status (running)
- **version**: Server version
- **uptime**: Server uptime in seconds

Example response:

```json
{
  "status": "running",
  "version": "1.0.0",
  "uptime": 3600
}
```

## Troubleshooting

### Common Issues

#### Server Won't Start

- Check if the port is already in use
- Ensure you have the correct permissions
- Verify that all dependencies are installed

#### 404 Errors

- Check if the requested file exists in the static directory
- Verify the path in the URL
- Check the configuration for static file serving

#### Proxy Errors

- Ensure the target server is running
- Check the proxy configuration
- Verify network connectivity to the target server

### Checking Logs

Check the log files in the `logs` directory for more information about errors:

```bash
# View the error log
cat logs/error.log

# View the access log
cat logs/access.log
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT