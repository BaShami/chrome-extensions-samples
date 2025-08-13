// Background service worker for Data Scraper Extension

console.log('Data Scraper Extension: Background service worker started');

// Handle extension installation
chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === 'install') {
        console.log('Data Scraper Extension installed');
        
        // Set default configuration
        chrome.storage.sync.set({
            webhookUrl: '',
            scrapingRules: JSON.stringify({
                title: 'h1',
                content: '.content, .main, .body',
                links: 'a[href]',
                images: 'img[src]'
            }, null, 2)
        });
        
        // Open welcome page
        chrome.tabs.create({
            url: chrome.runtime.getURL('welcome.html')
        });
    } else if (details.reason === 'update') {
        console.log('Data Scraper Extension updated to version', chrome.runtime.getManifest().version);
    }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(function() {
    console.log('Data Scraper Extension started');
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('Background received message:', request);
    
    if (request.action === 'getTabInfo') {
        // Get information about the current tab
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                sendResponse({
                    success: true,
                    tab: {
                        id: tabs[0].id,
                        url: tabs[0].url,
                        title: tabs[0].title
                    }
                });
            } else {
                sendResponse({ success: false, error: 'No active tab found' });
            }
        });
        return true; // Keep message channel open for async response
    }
    
    if (request.action === 'executeScraping') {
        // Execute scraping on the current tab
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                chrome.scripting.executeScript({
                    target: {tabId: tabs[0].id},
                    function: scrapeDataFromPage,
                    args: [request.rules]
                }, function(results) {
                    if (chrome.runtime.lastError) {
                        sendResponse({ success: false, error: chrome.runtime.lastError.message });
                    } else if (results && results[0]) {
                        sendResponse({ success: true, data: results[0].result });
                    } else {
                        sendResponse({ success: false, error: 'No results from scraping' });
                    }
                });
            } else {
                sendResponse({ success: false, error: 'No active tab found' });
            }
        });
        return true; // Keep message channel open for async response
    }
    
    if (request.action === 'sendToWebhook') {
        // Send data to webhook
        sendDataToWebhook(request.webhookUrl, request.data)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Keep message channel open for async response
    }
});

// Function to scrape data from a page (runs in content script context)
function scrapeDataFromPage(rules) {
    const scrapedData = {};
    
    try {
        for (const [key, selector] of Object.entries(rules)) {
            const elements = document.querySelectorAll(selector);
            
            if (elements.length === 1) {
                scrapedData[key] = elements[0].textContent.trim();
            } else if (elements.length > 1) {
                scrapedData[key] = Array.from(elements).map(el => el.textContent.trim());
            } else {
                scrapedData[key] = null;
            }
        }
        
        // Add metadata
        scrapedData.metadata = {
            url: window.location.href,
            title: document.title,
            timestamp: new Date().toISOString()
        };
        
        return scrapedData;
    } catch (error) {
        return { error: error.message };
    }
}

// Function to send data to webhook
async function sendDataToWebhook(webhookUrl, data) {
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Data-Scraper-Extension/1.0'
            },
            body: JSON.stringify({
                ...data,
                extensionVersion: '1.0',
                timestamp: new Date().toISOString()
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const responseText = await response.text();
        
        return {
            success: true,
            status: response.status,
            response: responseText
        };
    } catch (error) {
        console.error('Error sending to webhook:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Handle context menu (right-click menu)
chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create({
        id: 'scrapePageData',
        title: 'Scrape Page Data',
        contexts: ['page', 'selection']
    });
    
    chrome.contextMenus.create({
        id: 'scrapeSelection',
        title: 'Scrape Selected Text',
        contexts: ['selection']
    });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === 'scrapePageData') {
        // Open popup or trigger scraping
        chrome.action.openPopup();
    } else if (info.menuItemId === 'scrapeSelection') {
        // Scrape selected text
        const selectedText = info.selectionText;
        chrome.storage.local.set({
            lastScrapedSelection: {
                text: selectedText,
                url: tab.url,
                timestamp: new Date().toISOString()
            }
        });
        
        // Show notification
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'Data Scraper',
            message: 'Selected text saved for processing'
        });
    }
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener(function(command) {
    if (command === 'scrape-current-page') {
        // Trigger scraping of current page
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                chrome.action.openPopup();
            }
        });
    }
});

// Periodic cleanup of old data
chrome.alarms.create('cleanup', { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name === 'cleanup') {
        cleanupOldData();
    }
});

// Clean up old scraping history
function cleanupOldData() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    chrome.storage.local.get(['scrapingHistory'], function(result) {
        if (result.scrapingHistory) {
            const filteredHistory = result.scrapingHistory.filter(item => 
                new Date(item.timestamp) > oneWeekAgo
            );
            
            chrome.storage.local.set({ scrapingHistory: filteredHistory });
        }
    });
}