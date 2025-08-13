// Content script for data scraping
// This script runs in the context of web pages

console.log('Data Scraper Extension: Content script loaded');

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'scrapeData') {
        const scrapedData = scrapeDataFromPage(request.rules);
        sendResponse({ success: true, data: scrapedData });
    }
});

// Function to scrape data from the current page
function scrapeDataFromPage(rules) {
    const scrapedData = {};
    
    try {
        for (const [key, selector] of Object.entries(rules)) {
            const elements = document.querySelectorAll(selector);
            
            if (elements.length === 1) {
                // Single element
                const element = elements[0];
                scrapedData[key] = extractElementValue(element);
            } else if (elements.length > 1) {
                // Multiple elements
                scrapedData[key] = Array.from(elements).map(element => 
                    extractElementValue(element)
                ).filter(item => item !== null && item !== '');
            } else {
                // No elements found
                scrapedData[key] = null;
            }
        }
        
        // Add metadata
        scrapedData.metadata = {
            url: window.location.href,
            title: document.title,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            domain: window.location.hostname
        };
        
        return scrapedData;
    } catch (error) {
        console.error('Error scraping data:', error);
        return { 
            error: error.message,
            metadata: {
                url: window.location.href,
                timestamp: new Date().toISOString()
            }
        };
    }
}

// Extract value from an element based on its type
function extractElementValue(element) {
    if (!element) return null;
    
    // Check if it's an image
    if (element.tagName === 'IMG') {
        return {
            src: element.src,
            alt: element.alt,
            width: element.width,
            height: element.height
        };
    }
    
    // Check if it's a link
    if (element.tagName === 'A') {
        return {
            text: element.textContent.trim(),
            href: element.href,
            title: element.title
        };
    }
    
    // Check if it's a form input
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
        return {
            type: element.type,
            value: element.value,
            placeholder: element.placeholder,
            name: element.name
        };
    }
    
    // For other elements, return text content
    return element.textContent.trim();
}

// Enhanced scraping with common selectors
function scrapeCommonElements() {
    const commonData = {};
    
    // Common selectors for various types of content
    const commonSelectors = {
        title: 'h1, .title, [class*="title"], [id*="title"]',
        subtitle: 'h2, h3, .subtitle, [class*="subtitle"]',
        content: '.content, .main, .body, .text, [class*="content"], [class*="main"]',
        author: '.author, [class*="author"], [rel="author"]',
        date: '.date, .time, [class*="date"], [class*="time"], time',
        price: '.price, [class*="price"], [data-price]',
        rating: '.rating, [class*="rating"], [data-rating]',
        images: 'img[src]:not([src=""])',
        links: 'a[href]:not([href=""])',
        buttons: 'button, .btn, [class*="btn"], input[type="submit"]'
    };
    
    for (const [key, selector] of Object.entries(commonSelectors)) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            commonData[key] = Array.from(elements).map(element => extractElementValue(element));
        }
    }
    
    return commonData;
}

// Listen for page load completion
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Data Scraper Extension: Page loaded');
    });
} else {
    console.log('Data Scraper Extension: Page already loaded');
}

// Add a visual indicator that the extension is active
function addExtensionIndicator() {
    if (document.getElementById('data-scraper-indicator')) return;
    
    const indicator = document.createElement('div');
    indicator.id = 'data-scraper-indicator';
    indicator.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(102, 126, 234, 0.9);
        color: white;
        padding: 8px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-family: Arial, sans-serif;
        z-index: 10000;
        pointer-events: none;
        opacity: 0.8;
        transition: opacity 0.3s ease;
    `;
    indicator.textContent = '🔍 Data Scraper Active';
    
    document.body.appendChild(indicator);
    
    // Hide after 3 seconds
    setTimeout(() => {
        indicator.style.opacity = '0';
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
        }, 300);
    }, 3000);
}

// Add indicator when page is fully loaded
window.addEventListener('load', addExtensionIndicator);