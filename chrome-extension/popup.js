document.addEventListener('DOMContentLoaded', function() {
    // Load saved configuration
    loadConfiguration();
    
    // Event listeners
    document.getElementById('saveConfig').addEventListener('click', saveConfiguration);
    document.getElementById('scrapeData').addEventListener('click', scrapeCurrentPage);
    document.getElementById('viewHistory').addEventListener('click', viewHistory);
    document.getElementById('clearHistory').addEventListener('click', clearHistory);
});

// Load saved configuration from storage
function loadConfiguration() {
    chrome.storage.sync.get(['webhookUrl', 'scrapingRules'], function(result) {
        if (result.webhookUrl) {
            document.getElementById('webhookUrl').value = result.webhookUrl;
        }
        if (result.scrapingRules) {
            document.getElementById('scrapingRules').value = result.scrapingRules;
        }
    });
}

// Save configuration to storage
function saveConfiguration() {
    const webhookUrl = document.getElementById('webhookUrl').value.trim();
    const scrapingRules = document.getElementById('scrapingRules').value.trim();
    
    if (!webhookUrl) {
        showStatus('Please enter a webhook URL', 'error');
        return;
    }
    
    if (!scrapingRules) {
        showStatus('Please enter scraping rules', 'error');
        return;
    }
    
    try {
        JSON.parse(scrapingRules);
    } catch (e) {
        showStatus('Invalid JSON format for scraping rules', 'error');
        return;
    }
    
    chrome.storage.sync.set({
        webhookUrl: webhookUrl,
        scrapingRules: scrapingRules
    }, function() {
        showStatus('Configuration saved successfully!', 'success');
    });
}

// Scrape data from current page
function scrapeCurrentPage() {
    const webhookUrl = document.getElementById('webhookUrl').value.trim();
    const scrapingRules = document.getElementById('scrapingRules').value.trim();
    
    if (!webhookUrl) {
        showStatus('Please save configuration first', 'error');
        return;
    }
    
    if (!scrapingRules) {
        showStatus('Please save configuration first', 'error');
        return;
    }
    
    showStatus('Scraping data...', 'info');
    
    // Get the active tab and inject content script
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const activeTab = tabs[0];
        
        chrome.scripting.executeScript({
            target: {tabId: activeTab.id},
            function: scrapeDataFromPage,
            args: [JSON.parse(scrapingRules)]
        }, function(results) {
            if (chrome.runtime.lastError) {
                showStatus('Error: ' + chrome.runtime.lastError.message, 'error');
                return;
            }
            
            if (results && results[0] && results[0].result) {
                const scrapedData = results[0].result;
                displayScrapedData(scrapedData);
                sendToWebhook(webhookUrl, scrapedData, activeTab.url);
            }
        });
    });
}

// Function to scrape data from the page (runs in content script context)
function scrapeDataFromPage(rules) {
    const scrapedData = {};
    
    try {
        for (const [key, selector] of Object.entries(rules)) {
            const elements = document.querySelectorAll(selector);
            if (elements.length === 1) {
                // Single element
                scrapedData[key] = elements[0].textContent.trim() || elements[0].getAttribute('src') || elements[0].getAttribute('href') || '';
            } else if (elements.length > 1) {
                // Multiple elements
                scrapedData[key] = Array.from(elements).map(el => 
                    el.textContent.trim() || el.getAttribute('src') || el.getAttribute('href') || ''
                ).filter(item => item !== '');
            } else {
                scrapedData[key] = null;
            }
        }
        
        // Add metadata
        scrapedData.metadata = {
            url: window.location.href,
            title: document.title,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
        
        return scrapedData;
    } catch (error) {
        return { error: error.message };
    }
}

// Display scraped data in the popup
function displayScrapedData(data) {
    const dataContainer = document.getElementById('scrapedData');
    dataContainer.textContent = JSON.stringify(data, null, 2);
    dataContainer.style.display = 'block';
}

// Send data to webhook
function sendToWebhook(webhookUrl, data, pageUrl) {
    const payload = {
        ...data,
        pageUrl: pageUrl,
        extensionVersion: '1.0'
    };
    
    fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (response.ok) {
            showStatus('Data sent to webhook successfully!', 'success');
            saveToHistory(data, pageUrl, true);
        } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
    })
    .catch(error => {
        showStatus('Error sending to webhook: ' + error.message, 'error');
        saveToHistory(data, pageUrl, false);
    });
}

// Save scraping history
function saveToHistory(data, pageUrl, success) {
    const historyItem = {
        timestamp: new Date().toISOString(),
        pageUrl: pageUrl,
        data: data,
        success: success
    };
    
    chrome.storage.local.get(['scrapingHistory'], function(result) {
        const history = result.scrapingHistory || [];
        history.unshift(historyItem);
        
        // Keep only last 50 items
        if (history.length > 50) {
            history = history.slice(0, 50);
        }
        
        chrome.storage.local.set({ scrapingHistory: history });
    });
}

// View scraping history
function viewHistory() {
    chrome.storage.local.get(['scrapingHistory'], function(result) {
        const history = result.scrapingHistory || [];
        
        if (history.length === 0) {
            showStatus('No scraping history found', 'info');
            return;
        }
        
        const historyText = history.map((item, index) => 
            `${index + 1}. ${new Date(item.timestamp).toLocaleString()}\n` +
            `   URL: ${item.pageUrl}\n` +
            `   Status: ${item.success ? 'Success' : 'Failed'}\n` +
            `   Data: ${JSON.stringify(item.data).substring(0, 100)}...\n`
        ).join('\n');
        
        const dataContainer = document.getElementById('scrapedData');
        dataContainer.textContent = historyText;
        dataContainer.style.display = 'block';
    });
}

// Clear scraping history
function clearHistory() {
    if (confirm('Are you sure you want to clear all scraping history?')) {
        chrome.storage.local.remove(['scrapingHistory'], function() {
            showStatus('History cleared successfully', 'success');
            document.getElementById('scrapedData').style.display = 'none';
        });
    }
}

// Show status message
function showStatus(message, type) {
    const statusElement = document.getElementById('status');
    statusElement.textContent = message;
    statusElement.className = `status-message ${type}`;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        statusElement.className = 'status-message';
        statusElement.textContent = '';
    }, 5000);
}