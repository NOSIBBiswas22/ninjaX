# Static File Serving in NinjaX

This guide explains how to serve static files with NinjaX, including configuration options and best practices.

## Overview

NinjaX includes a built-in static file server that can serve HTML, CSS, JavaScript, images, and other static assets. This feature is enabled by default and configured to serve files from the `./public` directory.

## Basic Configuration

Static file serving is configured in the `http.static` section of the `config/ninjax.yaml` file:

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

### Configuration Options

- **enabled**: Enable or disable static file serving
- **root**: Root directory for static files
- **options.index**: List of files to serve as index files
- **options.extensions**: List of file extensions to serve
- **options.fallthrough**: Whether to continue to the next middleware if a file is not found

## Directory Structure

By default, NinjaX serves static files from the `./public` directory. The recommended structure for this directory is:

```
public/
├── index.html         # Default landing page
├── css/               # CSS files
│   └── styles.css
├── js/                # JavaScript files
│   └── main.js
├── images/            # Image files
│   └── logo.png
└── favicon.ico        # Favicon
```

## Serving Different File Types

NinjaX automatically sets the appropriate Content-Type header based on the file extension. Common file types include:

- HTML (.html, .htm)
- CSS (.css)
- JavaScript (.js)
- Images (.png, .jpg, .jpeg, .gif, .svg)
- Fonts (.woff, .woff2, .ttf, .eot)
- JSON (.json)
- XML (.xml)
- Text (.txt)

## Custom Index Files

You can specify custom index files to be served when a directory is requested:

```yaml
http:
  static:
    options:
      index:
        - home.html
        - index.html
```

With this configuration, if a user requests a directory, NinjaX will first look for `home.html` and then `index.html`.

## URL Path Mapping

By default, the URL path directly maps to the file path relative to the root directory. For example:

- URL: `/index.html` → File: `./public/index.html`
- URL: `/css/styles.css` → File: `./public/css/styles.css`
- URL: `/images/logo.png` → File: `./public/images/logo.png`

## Caching

NinjaX sets appropriate cache headers for static files to improve performance. The default cache settings are:

- HTML files: no caching
- CSS, JavaScript, and image files: cache for 1 day
- Font files: cache for 7 days

You can customize these settings in the configuration (feature coming soon):

```yaml
http:
  static:
    options:
      cache:
        maxAge: 86400000  # 1 day in milliseconds
        immutable: false
```

## MIME Types

NinjaX automatically sets the appropriate MIME type for common file extensions. You can add custom MIME types in the configuration (feature coming soon):

```yaml
http:
  static:
    options:
      mimeTypes:
        'application/x-custom': ['custom']
```

## Serving Single-Page Applications (SPAs)

For single-page applications, you may want to serve the `index.html` file for all routes that don't match a static file. This can be achieved with the following configuration:

```yaml
http:
  static:
    options:
      fallthrough: false
      rewrites:
        - from: '^(?!.*\.(js|css|png|jpg|jpeg|gif|svg|ico)$).*$'
          to: '/index.html'
```

This configuration will serve `index.html` for all requests that don't match a static file with one of the specified extensions.

## Security Considerations

### Directory Traversal Protection

NinjaX includes protection against directory traversal attacks. Requests containing `../` will be rejected.

### Hidden Files

By default, NinjaX does not serve files whose names begin with a dot (`.`), such as `.htaccess` or `.git`. This behavior can be customized in the configuration (feature coming soon):

```yaml
http:
  static:
    options:
      dotfiles: 'ignore'  # 'allow', 'deny', or 'ignore'
```

### Content Security Policy

It's recommended to set a Content Security Policy (CSP) for your static files. This can be done by adding a middleware that sets the appropriate headers (feature coming soon).

## Performance Optimization

### Compression

NinjaX automatically compresses static files using gzip or brotli compression when supported by the client's browser.

### ETags

NinjaX generates ETags for static files to enable efficient caching.

### Conditional Requests

NinjaX supports conditional requests using `If-Modified-Since` and `If-None-Match` headers, returning a 304 Not Modified response when appropriate.

## Advanced Configuration

### Multiple Static Directories

You can serve files from multiple directories by configuring multiple static middleware instances (feature coming soon):

```yaml
http:
  static:
    - root: ./public
      path: /
    - root: ./assets
      path: /assets
    - root: ./uploads
      path: /uploads
```

### Custom Error Pages

You can configure custom error pages for 404 (Not Found) and other errors (feature coming soon):

```yaml
http:
  static:
    options:
      errorPages:
        404: ./public/404.html
        500: ./public/500.html
```

## Troubleshooting

### Files Not Being Served

If your static files are not being served correctly, check the following:

1. Ensure the `http.static.enabled` setting is set to `true`.
2. Verify that the `http.static.root` path is correct and points to an existing directory.
3. Check that the file permissions allow the server to read the files.
4. Look for errors in the server logs.

### 404 Errors

If you're getting 404 errors for files that should exist:

1. Check the file path and ensure it matches the URL path.
2. Verify that the file exists in the static directory.
3. Check if the file is being blocked by a security setting (e.g., dotfiles).

### Performance Issues

If you're experiencing performance issues with static file serving:

1. Enable compression for text-based files.
2. Set appropriate cache headers.
3. Consider using a CDN for frequently accessed files.
4. Optimize your images and other assets.

## Best Practices

1. **Organize your files**: Keep a clean directory structure with separate folders for different types of assets.
2. **Optimize assets**: Minify CSS and JavaScript files, and compress images.
3. **Use appropriate caching**: Set cache headers based on how frequently files change.
4. **Implement a CDN**: For production environments, consider using a CDN to serve static files.
5. **Set security headers**: Implement Content Security Policy and other security headers.
6. **Use versioning**: Add version numbers or hashes to file names to ensure cache invalidation when files change.