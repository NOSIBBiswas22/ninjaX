document.addEventListener('DOMContentLoaded', () => {
  // Update server information
  updateServerInfo();
  
  // Update uptime every second
  setInterval(updateUptime, 1000);
});

/**
 * Update server information from API
 */
async function updateServerInfo() {
  try {
    const response = await fetch('/api/status');
    const data = await response.json();
    
    // Update port display
    const portElement = document.getElementById('port');
    if (portElement) {
      portElement.textContent = window.location.port || '80';
    }
    
    // Set initial uptime
    updateUptimeDisplay(data.uptime);
    
    // Store server start time
    window.serverStartTime = Date.now() - (data.uptime * 1000);
  } catch (error) {
    console.error('Failed to fetch server info:', error);
  }
}

/**
 * Update uptime display
 */
function updateUptime() {
  if (window.serverStartTime) {
    const uptime = (Date.now() - window.serverStartTime) / 1000;
    updateUptimeDisplay(uptime);
  }
}

/**
 * Format and display uptime
 * @param {number} uptime - Uptime in seconds
 */
function updateUptimeDisplay(uptime) {
  const uptimeElement = document.getElementById('uptime');
  if (!uptimeElement) return;
  
  // Format uptime
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  
  let uptimeText = '';
  if (days > 0) uptimeText += days + 'd ';
  if (hours > 0 || days > 0) uptimeText += hours + 'h ';
  if (minutes > 0 || hours > 0 || days > 0) uptimeText += minutes + 'm ';
  uptimeText += seconds + 's';
  
  uptimeElement.textContent = uptimeText;
}