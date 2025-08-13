// Popup script for the Data Scraper extension
document.addEventListener('DOMContentLoaded', async () => {
    // Tab functionality
    setupTabs();
    
    // Load settings and update UI
    await loadSettings();
    
    // Setup event listeners
    setupEventListeners();
    
    // Update status
    updateConnectionStatus();
    
    // Load logs
    loadLogs();
});

// Tab management
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            button.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

// Setup event listeners
function setupEventListeners() {
    // Scrape button
    document.getElementById('scrape-button').addEventListener('click', scrapeCurrentPage);
    
    // Settings buttons
    document.getElementById('save-settings').addEventListener('click', saveSettings);
    document.getElementById('reset-settings').addEventListener('click', resetSettings);
    
    // Clear logs button
    document.getElementById('clear-logs').addEventListener('click', clearLogs);
    
    // Real-time webhook URL validation
    document.getElementById('webhook-url').addEventListener('input', updateConnectionStatus);
}

// Load settings from storage
async function loadSettings() {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: 'getSettings' }, (settings) => {
            if (settings) {
                document.getElementById('webhook-url').value = settings.webhookUrl || '';
                document.getElementById('webhook-method').value = settings.method || 'POST';
                document.getElementById('webhook-headers').value = JSON.stringify(settings.headers || {}, null, 2);
                document.getElementById('custom-selectors').value = JSON.stringify(settings.customSelectors || {}, null, 2);
                document.getElementById('auto-scrape').checked = settings.autoScrape || false;
                document.getElementById('scrape-interval').value = (settings.scrapeInterval || 30000) / 1000;
            }
            resolve();
        });
    });
}

// Save settings
async function saveSettings() {
    try {
        const settings = {
            webhookUrl: document.getElementById('webhook-url').value.trim(),
            method: document.getElementById('webhook-method').value,
            headers: JSON.parse(document.getElementById('webhook-headers').value || '{}'),
            customSelectors: JSON.parse(document.getElementById('custom-selectors').value || '{}'),
            autoScrape: document.getElementById('auto-scrape').checked,
            scrapeInterval: parseInt(document.getElementById('scrape-interval').value) * 1000
        };

        chrome.runtime.sendMessage({ 
            action: 'saveSettings', 
            settings: settings 
        }, (response) => {
            if (response.success) {
                showStatus('Settings saved successfully!', 'success');
                updateConnectionStatus();
                logActivity('Settings updated', 'info');
            } else {
                showStatus('Failed to save settings', 'error');
            }
        });
    } catch (error) {
        showStatus('Invalid JSON in settings: ' + error.message, 'error');
    }
}

// Reset settings to defaults
function resetSettings() {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
        document.getElementById('webhook-url').value = '';
        document.getElementById('webhook-method').value = 'POST';
        document.getElementById('webhook-headers').value = JSON.stringify({ 'Content-Type': 'application/json' }, null, 2);
        document.getElementById('custom-selectors').value = '{}';
        document.getElementById('auto-scrape').checked = false;
        document.getElementById('scrape-interval').value = '30';
        
        saveSettings();
    }
}

// Scrape current page
async function scrapeCurrentPage() {
    const button = document.getElementById('scrape-button');
    const statusDiv = document.getElementById('scrape-status');
    
    button.disabled = true;
    button.textContent = '🔄 Scraping...';
    statusDiv.textContent = '';
    
    try {
        chrome.runtime.sendMessage({ action: 'scrapeAndSend' }, (response) => {
            button.disabled = false;
            button.textContent = '🚀 Scrape Current Page';
            
            if (response.scrapeSuccess) {
                showDataPreview(response.data);
                
                if (response.webhookResult.success) {
                    showStatus('✅ Data scraped and sent to webhook successfully!', 'success');
                    logActivity('Data scraped and sent to webhook', 'success', response.data);
                    updateLastScrapeTime();
                } else {
                    showStatus('⚠️ Data scraped but webhook failed: ' + response.webhookResult.error, 'warning');
                    logActivity('Webhook failed: ' + response.webhookResult.error, 'error');
                }
            } else {
                showStatus('❌ Failed to scrape data: ' + response.error, 'error');
                logActivity('Scraping failed: ' + response.error, 'error');
            }
        });
    } catch (error) {
        button.disabled = false;
        button.textContent = '🚀 Scrape Current Page';
        showStatus('❌ Error: ' + error.message, 'error');
        logActivity('Error: ' + error.message, 'error');
    }
}

// Show data preview
function showDataPreview(data) {
    const previewDiv = document.getElementById('data-preview');
    
    // Create a simplified preview
    const preview = {
        url: data.url,
        title: data.title,
        timestamp: data.timestamp,
        metadata: {
            headings: data.metadata.headings?.length || 0,
            links: data.metadata.links?.length || 0,
            images: data.metadata.images?.length || 0,
            forms: data.metadata.forms?.length || 0,
            tables: data.metadata.tables?.length || 0
        }
    };
    
    if (data.customData && Object.keys(data.customData).length > 0) {
        preview.customData = data.customData;
    }
    
    previewDiv.innerHTML = `<pre>${JSON.stringify(preview, null, 2)}</pre>`;
}

// Show status message
function showStatus(message, type = 'info') {
    const statusDiv = document.getElementById('scrape-status');
    statusDiv.textContent = message;
    statusDiv.className = `status-message ${type}`;
    
    // Clear status after 5 seconds
    setTimeout(() => {
        statusDiv.textContent = '';
        statusDiv.className = 'status-message';
    }, 5000);
}

// Update connection status
function updateConnectionStatus() {
    const webhookUrl = document.getElementById('webhook-url').value.trim();
    const statusSpan = document.getElementById('connection-status');
    
    if (webhookUrl) {
        try {
            new URL(webhookUrl);
            statusSpan.textContent = '🟢 Webhook configured';
            statusSpan.className = 'status-connected';
        } catch {
            statusSpan.textContent = '🟡 Invalid webhook URL';
            statusSpan.className = 'status-warning';
        }
    } else {
        statusSpan.textContent = '🔴 Webhook not configured';
        statusSpan.className = 'status-disconnected';
    }
}

// Update last scrape time
function updateLastScrapeTime() {
    const lastScrapeSpan = document.getElementById('last-scrape');
    lastScrapeSpan.textContent = new Date().toLocaleTimeString();
}

// Logging functionality
function logActivity(message, type = 'info', data = null) {
    const logs = getStoredLogs();
    const logEntry = {
        timestamp: new Date().toISOString(),
        message: message,
        type: type,
        data: data
    };
    
    logs.unshift(logEntry);
    
    // Keep only last 50 logs
    if (logs.length > 50) {
        logs.splice(50);
    }
    
    localStorage.setItem('scraperLogs', JSON.stringify(logs));
    displayLogs();
}

// Get stored logs
function getStoredLogs() {
    try {
        return JSON.parse(localStorage.getItem('scraperLogs') || '[]');
    } catch {
        return [];
    }
}

// Display logs
function displayLogs() {
    const logsContainer = document.getElementById('logs-container');
    const logs = getStoredLogs();
    
    if (logs.length === 0) {
        logsContainer.innerHTML = '<p class="placeholder">No logs yet. Start scraping to see activity.</p>';
        return;
    }
    
    const logsHtml = logs.map(log => {
        const time = new Date(log.timestamp).toLocaleString();
        const typeClass = `log-${log.type}`;
        return `
            <div class="log-entry ${typeClass}">
                <div class="log-header">
                    <span class="log-time">${time}</span>
                    <span class="log-type">${log.type.toUpperCase()}</span>
                </div>
                <div class="log-message">${log.message}</div>
                ${log.data ? `<details class="log-data"><summary>View Data</summary><pre>${JSON.stringify(log.data, null, 2)}</pre></details>` : ''}
            </div>
        `;
    }).join('');
    
    logsContainer.innerHTML = logsHtml;
}

// Load logs on startup
function loadLogs() {
    displayLogs();
}

// Clear logs
function clearLogs() {
    if (confirm('Are you sure you want to clear all logs?')) {
        localStorage.removeItem('scraperLogs');
        displayLogs();
        showStatus('Logs cleared', 'info');
    }
}