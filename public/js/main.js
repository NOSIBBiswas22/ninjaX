document.addEventListener('DOMContentLoaded', function() {
    // Update server information
    updateServerInfo();
    
    // Update uptime every second
    setInterval(updateUptime, 1000);
    
    // Update real-time data periodically
    updateRealTimeData();
    setInterval(updateRealTimeData, 5000); // Update every 5 seconds

/**
 * Fetches and updates all real-time data from the API
 */
function updateRealTimeData() {
    // Update proxy stats
    fetch('/api/v1/stats/proxy')
        .then(response => response.json())
        .then(data => {
            if (document.getElementById('active-connections')) {
                document.getElementById('active-connections').textContent = data.activeConnections || 0;
            }
            if (document.getElementById('total-requests')) {
                document.getElementById('total-requests').textContent = data.totalRequests || 0;
            }
            if (document.getElementById('healthy-targets')) {
                document.getElementById('healthy-targets').textContent = 
                    `${data.healthyTargets || 0}/${data.totalTargets || 0}`;
            }
            if (document.getElementById('current-algorithm')) {
                document.getElementById('current-algorithm').textContent = data.algorithm || 'round_robin';
            }
        })
        .catch(error => {
            console.error('Error fetching proxy stats:', error);
        });

    // Update config display
    fetch('/api/v1/config')
        .then(response => response.json())
        .then(data => {
            if (document.getElementById('config-display')) {
                document.getElementById('config-display').innerHTML = 
                    `<pre>${JSON.stringify(data, null, 2)}</pre>`;
            }
        })
        .catch(error => {
            console.error('Error fetching config:', error);
        });

    // Update sample data
    fetch('/api/v1/sample')
        .then(response => response.json())
        .then(data => {
            if (document.getElementById('sample-display')) {
                document.getElementById('sample-display').innerHTML = 
                    `<pre>${JSON.stringify(data, null, 2)}</pre>`;
            }
        })
        .catch(error => {
            console.error('Error fetching sample data:', error);
        });
}
});

/**
 * Updates the server information by fetching data from the API
 */
function updateServerInfo() {
    fetch('/api/v1/stats/server')
        .then(response => response.json())
        .then(data => {
            if (document.getElementById('server-version')) {
                document.getElementById('server-version').textContent = data.version || 'v3.0.0';
            }
            if (document.getElementById('server-status')) {
                document.getElementById('server-status').textContent = data.status || 'Running';
            }
            if (document.getElementById('server-uptime')) {
                document.getElementById('server-uptime').setAttribute('data-uptime', data.uptime || Date.now());
                updateUptime();
            }
            
            // Update dashboard stats
            if (document.getElementById('cpu-usage')) {
                document.getElementById('cpu-usage').textContent = data.cpu + '%';
            }
            if (document.getElementById('memory-usage')) {
                document.getElementById('memory-usage').textContent = data.memory + '%';
            }
            if (document.getElementById('platform')) {
                document.getElementById('platform').textContent = data.platform;
            }
            
            // Set initial uptime
            updateUptimeDisplay(data.uptime);
            
            // Store server start time
            window.serverStartTime = Date.now() - (data.uptime * 1000);
        })
        .catch(error => {
            console.error('Error fetching server status:', error);
            if (document.getElementById('server-status')) {
                document.getElementById('server-status').textContent = 'Error';
            }
        });
}

/**
 * Update uptime display
 */
function updateUptime() {
  if (window.serverStartTime) {
    const uptime = (Date.now() - window.serverStartTime) / 1000;
    updateUptimeDisplay(uptime);
  }
  
  // Also update the server-uptime element if it exists
  const uptimeElement = document.getElementById('server-uptime');
  if (uptimeElement) {
    const uptime = parseInt(uptimeElement.getAttribute('data-uptime'), 10);
    const now = Math.floor(Date.now() / 1000);
    const diff = now - uptime;
    
    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    
    uptimeElement.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }
}

/**
 * Format and display uptime
 * @param {number} uptime - Uptime in seconds
 */
function updateUptimeDisplay(uptime) {
  if (uptime) {
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    
    const formattedUptime = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    const uptimeElement = document.getElementById('uptime-value');
    if (uptimeElement) {
      uptimeElement.textContent = formattedUptime;
    }
    
    // Also update the dashboard uptime
    const dashboardUptimeElement = document.getElementById('uptime');
    if (dashboardUptimeElement) {
      dashboardUptimeElement.textContent = formattedUptime;
    }
  }
}

/**
 * Update real-time data from API
 */
async function updateRealTimeData() {
  try {
    const response = await fetch('/api/v1/config');
    const data = await response.json();
    
    // Update configuration display
    updateConfigDisplay(data);
    
    // Fetch and update proxy stats
    const proxyResponse = await fetch('/api/v1/stats/proxy');
    const proxyData = await proxyResponse.json();
    updateProxyStatsDisplay(proxyData);
    
    // Fetch and update sample data
    const sampleResponse = await fetch('/api/v1/sample');
    const sampleData = await sampleResponse.json();
    updateSampleDataDisplay(sampleData);
  } catch (error) {
    console.error('Failed to fetch real-time data:', error);
  }
}

/**
 * Update configuration display
 * @param {Object} configData - Configuration data
 */
function updateConfigDisplay(configData) {
  if (!configData) return;
  
  // Update proxy status
  const proxyStatusElement = document.getElementById('proxy-status');
  if (proxyStatusElement) {
    proxyStatusElement.textContent = configData.proxy.enabled ? 'Enabled' : 'Disabled';
    proxyStatusElement.className = configData.proxy.enabled ? 'status-enabled' : 'status-disabled';
  }
  
  // Update static server status
  const staticStatusElement = document.getElementById('static-status');
  if (staticStatusElement) {
    staticStatusElement.textContent = configData.static.enabled ? 'Enabled' : 'Disabled';
    staticStatusElement.className = configData.static.enabled ? 'status-enabled' : 'status-disabled';
  }
}

/**
 * Update proxy statistics display
 * @param {Object} proxyData - Proxy statistics data
 */
function updateProxyStatsDisplay(proxyData) {
  if (!proxyData || proxyData.error) return;
  
  // Update connections display
  const connectionsElement = document.getElementById('proxy-connections');
  if (connectionsElement && proxyData.connections) {
    connectionsElement.innerHTML = '';
    
    Object.entries(proxyData.connections).forEach(([server, count]) => {
      const connectionItem = document.createElement('div');
      connectionItem.className = 'connection-item';
      connectionItem.textContent = `${server}: ${count} connections`;
      connectionsElement.appendChild(connectionItem);
    });
  }
  
  // Update server health display
  const healthElement = document.getElementById('server-health');
  if (healthElement && proxyData.serverHealth) {
    healthElement.innerHTML = '';
    
    Object.entries(proxyData.serverHealth).forEach(([server, isHealthy]) => {
      const healthItem = document.createElement('div');
      healthItem.className = 'health-item';
      healthItem.textContent = `${server}: ${isHealthy ? 'Healthy' : 'Unhealthy'}`;
      healthItem.classList.add(isHealthy ? 'healthy' : 'unhealthy');
      healthElement.appendChild(healthItem);
    });
  }
}

/**
 * Update sample data display
 * @param {Object} sampleData - Sample data
 */
function updateSampleDataDisplay(sampleData) {
  if (!sampleData) return;
  
  // Update users table
  const usersTableBody = document.getElementById('users-table-body');
  if (usersTableBody && sampleData.users) {
    usersTableBody.innerHTML = '';
    
    sampleData.users.forEach(user => {
      const row = document.createElement('tr');
      
      const idCell = document.createElement('td');
      idCell.textContent = user.id;
      
      const nameCell = document.createElement('td');
      nameCell.textContent = user.name;
      
      const emailCell = document.createElement('td');
      emailCell.textContent = user.email;
      
      const roleCell = document.createElement('td');
      roleCell.textContent = user.role;
      
      row.appendChild(idCell);
      row.appendChild(nameCell);
      row.appendChild(emailCell);
      row.appendChild(roleCell);
      
      usersTableBody.appendChild(row);
    });
  }
  
  // Update stats display
  if (sampleData.stats) {
    const stats = sampleData.stats;
    
    // Update active users
    const activeUsersElement = document.getElementById('active-users');
    if (activeUsersElement) {
      activeUsersElement.textContent = stats.activeUsers;
    }
    
    // Update requests per minute
    const requestsElement = document.getElementById('requests-per-minute');
    if (requestsElement) {
      requestsElement.textContent = stats.requestsPerMinute;
    }
    
    // Update average response time
    const responseTimeElement = document.getElementById('avg-response-time');
    if (responseTimeElement) {
      responseTimeElement.textContent = `${stats.averageResponseTime} ms`;
    }
    
    // Update error rate
    const errorRateElement = document.getElementById('error-rate');
    if (errorRateElement) {
      errorRateElement.textContent = `${stats.errorRate}%`;
    }
  }
  
  // Update features list
  const featuresListElement = document.getElementById('features-list');
  if (featuresListElement && sampleData.features) {
    featuresListElement.innerHTML = '';
    
    sampleData.features.forEach(feature => {
      const featureItem = document.createElement('div');
      featureItem.className = 'feature-item';
      
      const featureName = document.createElement('strong');
      featureName.textContent = feature.name + ': ';
      
      const featureStatus = document.createElement('span');
      featureStatus.className = feature.status;
      featureStatus.textContent = feature.status;
      
      const featureDesc = document.createElement('p');
      featureDesc.textContent = feature.description;
      
      featureItem.appendChild(featureName);
      featureItem.appendChild(featureStatus);
      featureItem.appendChild(featureDesc);
      
      featuresListElement.appendChild(featureItem);
    });
  }
}