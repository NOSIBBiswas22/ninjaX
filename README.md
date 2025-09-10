# NinjaX

NinjaX is a powerful web server and reverse proxy, inspired by Nginx. It provides a modern, JavaScript-based alternative with similar functionality for serving static files and proxying requests to backend services.

## Features

- **Web Server**: Serve static files with high performance
- **Reverse Proxy**: Route requests to multiple backend services
- **Configuration**: Simple YAML-based configuration
- **Logging**: Comprehensive logging system
- **Default Landing Page**: Beautiful welcome page included

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ninjax.git

# Navigate to the project directory
cd ninjax

# Install dependencies
npm install
```

## Usage

### Starting the Server

```bash
# Start the server
npm start

# Start with development mode (auto-restart on file changes)
npm run dev
```

By default, the server runs on port 8080. You can access the welcome page at http://localhost:8080.

### Auto-Restart Feature

NinjaX includes an auto-restart feature that automatically detects changes to the configuration file and restarts the server to apply the changes. This works in two ways:

1. **Built-in File Watcher**: The server includes a built-in file watcher that monitors the `config/ninjax.yaml` file for changes. When changes are detected, the server automatically restarts to apply the new configuration.

2. **Development Mode**: When running with `npm run dev`, nodemon watches both JavaScript source files and YAML configuration files, restarting the server when any changes are detected.

This feature allows you to modify your server configuration without manually restarting the server.

### Configuration

NinjaX uses a YAML configuration file located at `config/ninjax.yaml`. You can modify this file to change server settings, configure static file serving, and set up reverse proxy rules.

```yaml
# Server settings
server:
  port: 8080
  host: 0.0.0.0
  workers: 1

# HTTP server settings
http:
  static:
    enabled: true
    root: ./public
    options:
      index:
        - index.html
        - index.htm

# Reverse proxy settings
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

## Serving Static Files

Place your static files in the `public` directory. NinjaX will serve these files when requests match the corresponding paths.

## Reverse Proxy

You can configure NinjaX to proxy requests to other servers. This is useful for creating a unified frontend for multiple backend services.

Example configuration:

```yaml
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
```

## Project Structure

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
├── package.json        # Project metadata and dependencies
└── README.md          # Project documentation
```

## License

MIT