# NinjaX Troubleshooting Guide

This guide provides solutions for common issues you might encounter when using NinjaX.

## Server Won't Start

### Issue: Port Already in Use

**Symptoms:**
- Error message: `Error: listen EADDRINUSE: address already in use :::8080`
- Server fails to start

**Solutions:**
1. Change the port in `config/ninjax.yaml`:
   ```yaml
   server:
     port: 3000  # Use a different port
   ```

2. Find and stop the process using the port:
   ```bash
   # Windows
   netstat -ano | findstr :8080
   taskkill /PID <PID> /F

   # macOS/Linux
   lsof -i :8080
   kill -9 <PID>
   ```

### Issue: Permission Denied

**Symptoms:**
- Error message: `Error: listen EACCES: permission denied 0.0.0.0:80`
- Server fails to start

**Solutions:**
1. Use a port number above 1024 (ports below 1024 require admin/root privileges):
   ```yaml
   server:
     port: 8080  # Use a port above 1024
   ```

2. Run the server with elevated privileges (not recommended for production):
   ```bash
   # Windows
   # Run Command Prompt as Administrator

   # macOS/Linux
   sudo npm start
   ```

### Issue: Missing Dependencies

**Symptoms:**
- Error message: `Cannot find module 'express'`
- Server fails to start

**Solutions:**
1. Install dependencies:
   ```bash
   npm install
   ```

2. If specific dependencies are missing, install them manually:
   ```bash
   npm install express http-proxy-middleware winston js-yaml
   ```

## Configuration Issues

### Issue: Invalid YAML Configuration

**Symptoms:**
- Error message: `YAMLException: ...`
- Server fails to start

**Solutions:**
1. Check the YAML syntax in `config/ninjax.yaml`
2. Use a YAML validator to identify syntax errors
3. Ensure proper indentation (YAML is sensitive to indentation)

### Issue: Configuration File Not Found

**Symptoms:**
- Error message: `Error: ENOENT: no such file or directory, open 'config/ninjax.yaml'`
- Server fails to start

**Solutions:**
1. Create the configuration file if it doesn't exist:
   ```bash
   mkdir -p config
   touch config/ninjax.yaml
   ```

2. Copy the default configuration:
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
       options:
         index:
           - index.html
           - index.htm

   proxy:
     enabled: false
   ```

## Static File Serving Issues

### Issue: Static Files Not Found

**Symptoms:**
- 404 errors when accessing static files
- Error message in logs: `GET /styles.css 404`

**Solutions:**
1. Check if static file serving is enabled:
   ```yaml
   http:
     static:
       enabled: true
   ```

2. Verify the root directory path:
   ```yaml
   http:
     static:
       root: ./public  # Path relative to the project root
   ```

3. Ensure the files exist in the specified directory

4. Check file permissions

### Issue: Wrong Content Type

**Symptoms:**
- Files are downloaded instead of displayed in the browser
- CSS or JavaScript files don't work correctly

**Solutions:**
1. Ensure files have the correct extensions (.html, .css, .js, etc.)
2. Check if the server is setting the correct Content-Type headers

## Reverse Proxy Issues

### Issue: Proxy Target Unreachable

**Symptoms:**
- Error message: `Error: connect ECONNREFUSED 127.0.0.1:3000`
- 502 Bad Gateway or 504 Gateway Timeout errors

**Solutions:**
1. Ensure the target server is running
2. Verify the target URL is correct:
   ```yaml
   proxy:
     locations:
       - path: /api
         target: http://localhost:3000  # Check this URL
   ```

3. Check network connectivity between NinjaX and the target server

### Issue: WebSocket Connection Failed

**Symptoms:**
- WebSocket connections fail to establish
- Error message: `WebSocket connection to 'ws://localhost:8080/socket' failed`

**Solutions:**
1. Enable WebSocket support in the proxy configuration:
   ```yaml
   proxy:
     ws: true  # Enable WebSocket support globally
     locations:
       - path: /socket
         target: http://localhost:5000
         options:
           ws: true  # Enable WebSocket for this location
   ```

2. Ensure the target server supports WebSockets

### Issue: Path Rewriting Not Working

**Symptoms:**
- Requests are proxied with the wrong path
- Target server returns 404 errors

**Solutions:**
1. Check the path rewriting configuration:
   ```yaml
   proxy:
     locations:
       - path: /api
         target: http://localhost:3000
         options:
           pathRewrite:
             '^/api': ''  # Remove /api prefix
   ```

2. Verify the regular expressions in the pathRewrite rules

## Logging Issues

### Issue: Logs Not Being Written

**Symptoms:**
- Log files are not created or updated
- No log output

**Solutions:**
1. Check if the logs directory exists and is writable:
   ```bash
   mkdir -p logs
   chmod 755 logs  # On macOS/Linux
   ```

2. Verify the logging configuration:
   ```yaml
   logging:
     level: info
     access_log: logs/access.log
     error_log: logs/error.log
   ```

3. Ensure the application has write permissions to the log files

### Issue: Too Much Log Output

**Symptoms:**
- Log files grow very large
- Disk space issues

**Solutions:**
1. Increase the log level to reduce verbosity:
   ```yaml
   logging:
     level: warn  # Use warn or error instead of info or debug
   ```

2. Implement log rotation (feature coming soon)

## Performance Issues

### Issue: High CPU Usage

**Symptoms:**
- Server uses excessive CPU resources
- Slow response times

**Solutions:**
1. Increase the number of worker processes:
   ```yaml
   server:
     workers: 4  # Use one per CPU core
   ```

2. Optimize static file serving:
   - Enable compression
   - Set appropriate cache headers
   - Use a CDN for static assets

3. Optimize proxy configuration:
   - Implement caching for proxied responses
   - Reduce the number of proxy targets

### Issue: Memory Leaks

**Symptoms:**
- Server memory usage grows over time
- Eventually crashes with out-of-memory errors

**Solutions:**
1. Update to the latest version of NinjaX
2. Monitor memory usage with tools like `node --inspect`
3. Restart the server periodically using a process manager like PM2

## Security Issues

### Issue: CORS Errors

**Symptoms:**
- Browser console errors: `Access to XMLHttpRequest at '...' from origin '...' has been blocked by CORS policy`
- API requests fail from frontend applications

**Solutions:**
1. Configure CORS in the proxy settings:
   ```yaml
   proxy:
     locations:
       - path: /api
         target: http://localhost:3000
         options:
           cors:
             enabled: true
             origin: '*'  # Or specific origins
             methods: ['GET', 'POST', 'PUT', 'DELETE']
   ```

2. Implement CORS middleware in your backend services

### Issue: SSL/TLS Certificate Errors

**Symptoms:**
- Browser warnings about insecure connections
- Error message: `Error: self signed certificate`

**Solutions:**
1. Use valid SSL/TLS certificates from a trusted certificate authority
2. For development, you can disable certificate verification (not recommended for production):
   ```yaml
   proxy:
     locations:
       - path: /api
         target: https://localhost:3000
         options:
           secure: false  # Disable certificate verification
   ```

## Deployment Issues

### Issue: Process Terminates Unexpectedly

**Symptoms:**
- Server stops running after some time
- No error messages in logs

**Solutions:**
1. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start npm -- start
   ```

2. Implement proper error handling in your application

### Issue: Cannot Access Server from Other Machines

**Symptoms:**
- Server works locally but cannot be accessed from other machines

**Solutions:**
1. Ensure the server is binding to all network interfaces:
   ```yaml
   server:
     host: 0.0.0.0  # Bind to all interfaces
   ```

2. Check firewall settings to allow incoming connections on the server port

3. Verify network configuration (NAT, port forwarding, etc.)

## Debugging Techniques

### Enable Debug Logging

Set the log level to `debug` for more detailed information:

```yaml
logging:
  level: debug
```

### Use Node.js Inspector

Start the server with the inspector enabled:

```bash
node --inspect src/index.js
```

Then open Chrome and navigate to `chrome://inspect` to connect to the debugger.

### Check Server Status

Access the status endpoint to check server health:

```
GET /status
```

This will return information about the server's uptime, memory usage, and configuration.

### Analyze Request/Response Cycle

Use tools like Postman or curl to test API endpoints and analyze the request/response cycle:

```bash
curl -v http://localhost:8080/api/endpoint
```

## Getting Help

If you've tried the solutions in this guide and are still experiencing issues, you can get help from the following resources:

1. **GitHub Issues**: Search for similar issues or create a new one on the [GitHub repository](https://github.com/yourusername/ninjax/issues).

2. **Community Forums**: Ask for help on community forums like Stack Overflow, using the `ninjax` tag.

3. **Documentation**: Review the documentation for more detailed information about specific features.

When reporting issues, please include:

- NinjaX version
- Node.js version
- Operating system
- Configuration file (with sensitive information removed)
- Error messages and stack traces
- Steps to reproduce the issue