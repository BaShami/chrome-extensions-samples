// Background script for webhook communication
console.log('Data Scraper background script loaded');

// Default settings
const DEFAULT_SETTINGS = {
  webhookUrl: '',
  headers: {
    'Content-Type': 'application/json'
  },
  method: 'POST',
  customSelectors: {},
  autoScrape: false,
  scrapeInterval: 30000 // 30 seconds
};

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Data Scraper extension installed');
  
  // Initialize default settings
  chrome.storage.sync.get(['settings'], (result) => {
    if (!result.settings) {
      chrome.storage.sync.set({
        settings: DEFAULT_SETTINGS
      });
    }
  });
});

// Function to send data to webhook
async function sendToWebhook(data, settings) {
  try {
    if (!settings.webhookUrl) {
      throw new Error('Webhook URL not configured');
    }

    const requestOptions = {
      method: settings.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...settings.headers
      },
      body: JSON.stringify(data)
    };

    console.log('Sending data to webhook:', settings.webhookUrl);
    
    const response = await fetch(settings.webhookUrl, requestOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.text();
    console.log('Webhook response:', responseData);
    
    return {
      success: true,
      status: response.status,
      response: responseData
    };
  } catch (error) {
    console.error('Error sending to webhook:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Listen for messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'sendToWebhook') {
    chrome.storage.sync.get(['settings'], async (result) => {
      const settings = result.settings || DEFAULT_SETTINGS;
      const webhookResult = await sendToWebhook(request.data, settings);
      sendResponse(webhookResult);
    });
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'scrapeAndSend') {
    // Get current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0]) {
        try {
          // Get settings
          const result = await chrome.storage.sync.get(['settings']);
          const settings = result.settings || DEFAULT_SETTINGS;
          
          // Send message to content script to scrape data
          const response = await chrome.tabs.sendMessage(tabs[0].id, {
            action: 'scrapeData',
            customSelectors: settings.customSelectors
          });
          
          if (response.success) {
            // Send scraped data to webhook
            const webhookResult = await sendToWebhook(response.data, settings);
            sendResponse({
              scrapeSuccess: true,
              webhookResult: webhookResult,
              data: response.data
            });
          } else {
            sendResponse({
              scrapeSuccess: false,
              error: response.error
            });
          }
        } catch (error) {
          sendResponse({
            scrapeSuccess: false,
            error: error.message
          });
        }
      } else {
        sendResponse({
          scrapeSuccess: false,
          error: 'No active tab found'
        });
      }
    });
    return true;
  }
  
  if (request.action === 'getSettings') {
    chrome.storage.sync.get(['settings'], (result) => {
      sendResponse(result.settings || DEFAULT_SETTINGS);
    });
    return true;
  }
  
  if (request.action === 'saveSettings') {
    chrome.storage.sync.set({
      settings: request.settings
    }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Auto-scraping functionality
let autoScrapeInterval = null;

function startAutoScrape() {
  chrome.storage.sync.get(['settings'], (result) => {
    const settings = result.settings || DEFAULT_SETTINGS;
    
    if (settings.autoScrape && settings.scrapeInterval > 0) {
      if (autoScrapeInterval) {
        clearInterval(autoScrapeInterval);
      }
      
      autoScrapeInterval = setInterval(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
          if (tabs[0]) {
            try {
              const response = await chrome.tabs.sendMessage(tabs[0].id, {
                action: 'scrapeData',
                customSelectors: settings.customSelectors
              });
              
              if (response.success) {
                await sendToWebhook(response.data, settings);
              }
            } catch (error) {
              console.error('Auto-scrape error:', error);
            }
          }
        });
      }, settings.scrapeInterval);
    }
  });
}

function stopAutoScrape() {
  if (autoScrapeInterval) {
    clearInterval(autoScrapeInterval);
    autoScrapeInterval = null;
  }
}

// Listen for settings changes to update auto-scrape
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.settings) {
    const newSettings = changes.settings.newValue;
    if (newSettings.autoScrape) {
      startAutoScrape();
    } else {
      stopAutoScrape();
    }
  }
});

// Handle tab updates for auto-scraping
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    chrome.storage.sync.get(['settings'], (result) => {
      const settings = result.settings || DEFAULT_SETTINGS;
      if (settings.autoScrape) {
        // Small delay to ensure page is fully loaded
        setTimeout(() => {
          chrome.tabs.sendMessage(tabId, {
            action: 'scrapeData',
            customSelectors: settings.customSelectors
          }, (response) => {
            if (response && response.success) {
              sendToWebhook(response.data, settings);
            }
          });
        }, 2000);
      }
    });
  }
});