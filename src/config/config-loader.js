/**
 * Configuration loader for NinjaX
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('yaml');

// Default configuration path
const DEFAULT_CONFIG_PATH = path.join(__dirname, '../../config/ninjax.yaml');

/**
 * Load configuration from file
 * @param {string} configPath - Path to configuration file (optional)
 * @returns {Object} - Configuration object
 */
async function loadConfig(configPath = DEFAULT_CONFIG_PATH) {
  try {
    // Check if config file exists
    await fs.access(configPath);
    
    // Read and parse config file
    const configContent = await fs.readFile(configPath, 'utf8');
    const config = yaml.parse(configContent);
    
    return config;
  } catch (error) {
    // If file doesn't exist or can't be parsed, create default config
    console.warn('Configuration file not found or invalid: ' + error.message);
    console.info('Creating default configuration...');
    
    const defaultConfig = createDefaultConfig();
    await saveDefaultConfig(configPath, defaultConfig);
    
    return defaultConfig;
  }
}

/**
 * Create default configuration
 * @returns {Object} - Default configuration object
 */
function createDefaultConfig() {
  return {
    server: {
      port: 8080,
      host: '0.0.0.0',
      workers: 1
    },
    logging: {
      level: 'info',
      access_log: 'logs/access.log',
      error_log: 'logs/error.log'
    },
    http: {
      static: {
        enabled: true,
        root: './public',
        options: {
          index: ['index.html', 'index.htm'],
          extensions: ['html', 'htm'],
          fallthrough: true
        }
      }
    },
    proxy: {
      enabled: false,
      locations: [
        // Example proxy configuration
        // {
        //   path: '/api',
        //   target: 'http://localhost:3000',
        //   options: {
        //     changeOrigin: true,
        //     pathRewrite: { '^/api': '' }
        //   }
        // }
      ]
    }
  };
}

/**
 * Save default configuration to file
 * @param {string} configPath - Path to save configuration
 * @param {Object} config - Configuration object
 */
async function saveDefaultConfig(configPath, config) {
  try {
    // Create directory if it doesn't exist
    const configDir = path.dirname(configPath);
    await fs.mkdir(configDir, { recursive: true });
    
    // Write config to file
    const yamlContent = yaml.stringify(config);
    await fs.writeFile(configPath, yamlContent, 'utf8');
    
    console.info('Default configuration saved to ' + configPath);
  } catch (error) {
    console.error('Failed to save default configuration: ' + error.message);
  }
}

module.exports = {
  loadConfig
};