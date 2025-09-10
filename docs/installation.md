# NinjaX Installation Guide

This guide provides detailed instructions for installing and setting up NinjaX on different platforms.

## Prerequisites

Before installing NinjaX, ensure you have the following prerequisites installed on your system:

- **Node.js** (v14 or higher)
- **npm** (v6 or higher)

You can check your Node.js and npm versions with the following commands:

```bash
node --version
npm --version
```

## Installation Methods

### Method 1: Clone from GitHub

```bash
# Clone the repository
git clone https://github.com/yourusername/ninjax.git

# Navigate to the project directory
cd ninjax

# Install dependencies
npm install
```

### Method 2: Download Release Package

1. Download the latest release package from the [Releases](https://github.com/yourusername/ninjax/releases) page.
2. Extract the package to your desired location.
3. Navigate to the extracted directory.
4. Install dependencies:

```bash
npm install
```

### Method 3: Using npm (Coming Soon)

```bash
npm install -g ninjax
```

## Platform-Specific Instructions

### Windows

1. Install Node.js and npm from the [official website](https://nodejs.org/).
2. Open Command Prompt or PowerShell.
3. Follow the installation methods above.

### macOS

1. Install Node.js and npm using [Homebrew](https://brew.sh/):

```bash
brew install node
```

2. Follow the installation methods above.

### Linux

1. Install Node.js and npm using your distribution's package manager:

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install nodejs npm
```

**Fedora:**

```bash
sudo dnf install nodejs npm
```

2. Follow the installation methods above.

## Verifying Installation

To verify that NinjaX has been installed correctly, run the following command from the project directory:

```bash
npm start
```

You should see output indicating that the server is running, and you can access the welcome page at http://localhost:8080.

## Next Steps

After installing NinjaX, you can:

1. [Configure the server](configuration.md) to suit your needs.
2. [Serve static files](static-files.md) from your project.
3. [Set up reverse proxy](reverse-proxy.md) to route requests to backend services.

## Troubleshooting

### Common Installation Issues

#### Node.js Version Compatibility

If you encounter errors during installation or startup, ensure you're using a compatible Node.js version (v14 or higher).

#### Permission Issues

If you encounter permission errors during installation:

**Windows:**
Run Command Prompt or PowerShell as Administrator.

**macOS/Linux:**
Use `sudo` for commands that require elevated privileges, or fix npm permissions:

```bash
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

#### Port Already in Use

If port 8080 is already in use, you can change the port in the configuration file (`config/ninjax.yaml`):

```yaml
server:
  port: 3000  # Change to an available port
```

## Support

If you encounter any issues during installation, please:

1. Check the [Troubleshooting](troubleshooting.md) guide.
2. Search for similar issues in the [GitHub Issues](https://github.com/yourusername/ninjax/issues).
3. Create a new issue if your problem hasn't been reported.