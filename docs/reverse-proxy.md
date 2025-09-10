# Reverse Proxy in NinjaX

This guide explains how to configure and use the reverse proxy functionality in NinjaX to route requests to backend services.

## Overview

NinjaX includes a powerful reverse proxy feature that allows you to route requests to different backend services based on URL paths. This is particularly useful for:

- Creating a unified API gateway for microservices
- Implementing backend-for-frontend (BFF) patterns
- Avoiding cross-origin resource sharing (CORS) issues
- Load balancing between multiple backend instances

The reverse proxy functionality is built on top of the [http-proxy](https://github.com/http-party/node-http-proxy) library.

## Basic Configuration

Reverse proxy is configured in the `proxy` section of the `config/ninjax.yaml` file:

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

### Configuration Options

- **enabled**: Enable or disable reverse proxy
- **ws**: Enable or disable WebSocket support globally
- **locations**: List of proxy locations

### Location Options

- **path**: Path to match for proxying
- **target**: Target server URL
- **options.changeOrigin**: Change the origin of the host header to the target URL
- **options.pathRewrite**: URL rewriting rules (regex pattern -> replacement)
- **options.ws**: Enable or disable WebSocket support for this location

## Path Matching

The `path` property in each location is used to match the incoming request URL. If the URL starts with the specified path, the request will be proxied to the target server.

For example, with the following configuration:

```yaml
locations:
  - path: /api
    target: http://localhost:3000
```

Requests to the following URLs will be proxied to `http://localhost:3000`:

- `/api/users` -> `http://localhost:3000/api/users`
- `/api/products` -> `http://localhost:3000/api/products`
- `/api/orders/123` -> `http://localhost:3000/api/orders/123`

## Path Rewriting

The `pathRewrite` option allows you to rewrite the URL path before forwarding the request to the target server. This is useful for removing prefixes or changing the URL structure.

For example, with the following configuration:

```yaml
locations:
  - path: /api
    target: http://localhost:3000
    options:
      pathRewrite:
        '^/api': ''
```

Requests will be rewritten as follows:

- `/api/users` -> `http://localhost:3000/users`
- `/api/products` -> `http://localhost:3000/products`
- `/api/orders/123` -> `http://localhost:3000/orders/123`

You can define multiple rewrite rules:

```yaml
pathRewrite:
  '^/api/v1': '/v1'
  '^/api/v2': '/v2'
  '^/api': ''
```

The rules are applied in order, and only the first matching rule is applied.

## WebSocket Support

NinjaX supports proxying WebSocket connections. You can enable WebSocket support globally or for specific locations:

```yaml
proxy:
  enabled: true
  ws: true  # Enable WebSocket support globally
  locations:
    - path: /socket
      target: http://localhost:5000
      options:
        ws: true  # Enable WebSocket for this location
```

With this configuration, WebSocket connections to `/socket` will be proxied to `http://localhost:5000`.

## Multiple Backend Services

You can configure multiple proxy locations to route requests to different backend services:

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
    - path: /socket
      target: http://localhost:5000
      options:
        ws: true
```

With this configuration:

- Requests to `/api/*` will be proxied to `http://localhost:3000/*`
- Requests to `/auth/*` will be proxied to `http://localhost:4000/auth/*`
- Requests to `/socket/*` will be proxied to `http://localhost:5000/socket/*`

## Advanced Configuration

### SSL/TLS Support

You can configure the proxy to connect to HTTPS targets:

```yaml
locations:
  - path: /api
    target: https://api.example.com
    options:
      secure: true  # Verify SSL certificates
```

If the target server uses a self-signed certificate, you can disable certificate verification:

```yaml
secure: false
```

### Headers Manipulation

You can add, modify, or remove headers in the proxied requests and responses:

```yaml
locations:
  - path: /api
    target: http://localhost:3000
    options:
      headers:
        request:
          X-Forwarded-For: true
          X-Forwarded-Proto: true
          X-Forwarded-Host: true
          Authorization: 'Bearer token123'
        response:
          X-Powered-By: null  # Remove this header
```

### Proxy Timeouts

You can configure timeouts for proxy requests:

```yaml
locations:
  - path: /api
    target: http://localhost:3000
    options:
      timeout: 30000  # 30 seconds
      proxyTimeout: 31000  # 31 seconds
```

### Error Handling

You can configure how proxy errors are handled:

```yaml
locations:
  - path: /api
    target: http://localhost:3000
    options:
      errorHandler: true  # Use default error handler
```

## Load Balancing

You can configure load balancing between multiple backend instances (feature coming soon):

```yaml
locations:
  - path: /api
    targets:
      - http://localhost:3001
      - http://localhost:3002
      - http://localhost:3003
    options:
      loadBalancing: 'round-robin'  # 'round-robin', 'random', or 'least-connections'
```

## Caching

You can configure caching for proxied responses (feature coming soon):

```yaml
locations:
  - path: /api
    target: http://localhost:3000
    options:
      cache:
        enabled: true
        ttl: 3600  # 1 hour in seconds
        methods: ['GET', 'HEAD']
        maxSize: 100  # Maximum number of cached responses
```

## Security Considerations

### HTTPS

When proxying to HTTPS targets, it's recommended to enable SSL verification:

```yaml
secure: true
```

### Authentication

Be careful when proxying requests that require authentication. You may need to add authentication headers to the proxied requests:

```yaml
headers:
  request:
    Authorization: 'Bearer token123'
```

### CORS

When proxying API requests from a web application, you may need to handle CORS. The proxy can add CORS headers to the responses:

```yaml
locations:
  - path: /api
    target: http://localhost:3000
    options:
      cors:
        enabled: true
        origin: '*'
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
        allowedHeaders: ['Content-Type', 'Authorization']
        exposedHeaders: ['X-Custom-Header']
        credentials: true
        maxAge: 86400
```

## Troubleshooting

### Connection Refused

If you see "Connection refused" errors, check that the target server is running and accessible from the NinjaX server.

### Timeout Errors

If you see timeout errors, check the target server's response time and consider increasing the proxy timeout.

### WebSocket Connection Failed

If WebSocket connections fail, ensure that WebSocket support is enabled both globally and for the specific location.

### Path Rewriting Issues

If path rewriting doesn't work as expected, check the regular expressions in the `pathRewrite` configuration.

## Best Practices

1. **Use changeOrigin**: Always set `changeOrigin: true` when proxying to a different domain.
2. **Secure connections**: Use HTTPS for both the NinjaX server and the target servers in production.
3. **Error handling**: Implement proper error handling for proxy failures.
4. **Logging**: Enable detailed logging for troubleshooting proxy issues.
5. **Monitoring**: Monitor the performance and availability of both the NinjaX server and the target servers.
6. **Rate limiting**: Implement rate limiting to protect backend services from excessive requests.
7. **Circuit breaking**: Implement circuit breaking to prevent cascading failures when backend services are unavailable.