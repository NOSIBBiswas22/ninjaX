# NinjaX Documentation

Welcome to the NinjaX documentation. This guide provides comprehensive information about installing, configuring, and using NinjaX.

## Table of Contents

### Getting Started
- [Installation Guide](installation.md) - How to install NinjaX on different platforms
- [Configuration Guide](configuration.md) - How to configure NinjaX to suit your needs

### Features
- [Static File Serving](static-files.md) - How to serve static files with NinjaX
- [Reverse Proxy](reverse-proxy.md) - How to configure and use the reverse proxy functionality

### Reference
- [API Reference](api-reference.md) - Comprehensive reference for NinjaX's API endpoints and programmatic interfaces

### Support
- [Troubleshooting Guide](troubleshooting.md) - Solutions for common issues

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/NOSIBBiswas22/ninjax.git

# Navigate to the project directory
cd ninjax

# Install dependencies
npm install

# Start the server
npm start
```

### Basic Configuration

Edit the `config/ninjax.yaml` file to configure the server:

```yaml
server:
  port: 8080
  host: 0.0.0.0

logging:
  level: info
  access_log: logs/access.log
  error_log: logs/error.log

http:
  static:
    enabled: true
    root: ./public

proxy:
  enabled: false
```

### Serving Static Files

Place your static files in the `public` directory, and they will be automatically served at the root URL.

### Setting Up Reverse Proxy

Enable the reverse proxy in the configuration file:

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
```

## Project Structure

```
ninjax/
├── config/
│   └── ninjax.yaml       # Configuration file
├── docs/                 # Documentation
├── logs/                 # Log files
├── public/               # Static files
├── src/                  # Source code
│   ├── config/           # Configuration handling
│   ├── server/           # Server implementation
│   │   ├── static-server.js  # Static file server
│   │   └── reverse-proxy.js  # Reverse proxy
│   ├── utils/            # Utility functions
│   └── index.js          # Entry point
├── package.json          # Dependencies and scripts
└── README.md             # Project overview
```

## Contributing

Contributions to NinjaX are welcome! Please see the [Contributing Guide](https://github.com/yourusername/ninjax/blob/main/CONTRIBUTING.md) for more information.

## License

NinjaX is licensed under the MIT License. See the [LICENSE](https://github.com/yourusername/ninjax/blob/main/LICENSE) file for more information.