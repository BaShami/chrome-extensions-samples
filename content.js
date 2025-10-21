// Content script for Freshdesk pages
// This script runs on Freshdesk pages to help with URL detection

// Listen for URL changes (for SPA navigation)
let currentUrl = window.location.href;

// Function to notify popup about URL changes
function notifyUrlChange() {
    const newUrl = window.location.href;
    if (newUrl !== currentUrl) {
        currentUrl = newUrl;
        
        // Send message to popup if it's open
        chrome.runtime.sendMessage({
            type: 'URL_CHANGED',
            url: newUrl
        }).catch(() => {
            // Ignore errors if popup is not open
        });
    }
}

// Monitor URL changes
const observer = new MutationObserver(notifyUrlChange);
observer.observe(document.body, { childList: true, subtree: true });

// Also listen for popstate events
window.addEventListener('popstate', notifyUrlChange);

// Initial check
notifyUrlChange();