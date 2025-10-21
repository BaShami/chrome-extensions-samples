// Content script for Freshdesk AI Assistant
// This script runs on Freshdesk pages to help with ticket ID extraction

class FreshdeskContentScript {
    constructor() {
        this.currentTicketId = null;
        this.init();
    }

    init() {
        this.extractTicketId();
        this.setupUrlChangeListener();
        this.setupMessageListener();
    }

    extractTicketId() {
        const url = window.location.href;
        const ticketIdMatch = url.match(/\/tickets\/(\d+)/);
        
        if (ticketIdMatch && ticketIdMatch[1]) {
            this.currentTicketId = ticketIdMatch[1];
            console.log('Freshdesk AI Assistant: Ticket ID detected:', this.currentTicketId);
        } else {
            this.currentTicketId = null;
        }
    }

    setupUrlChangeListener() {
        // Listen for URL changes (for single-page app navigation)
        let lastUrl = location.href;
        
        new MutationObserver(() => {
            const currentUrl = location.href;
            if (currentUrl !== lastUrl) {
                lastUrl = currentUrl;
                this.extractTicketId();
            }
        }).observe(document, { subtree: true, childList: true });

        // Also listen for popstate events
        window.addEventListener('popstate', () => {
            setTimeout(() => this.extractTicketId(), 100);
        });
    }

    setupMessageListener() {
        // Listen for messages from the popup
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'getTicketId') {
                this.extractTicketId(); // Refresh ticket ID
                sendResponse({ ticketId: this.currentTicketId });
            }
            return true;
        });
    }
}

// Initialize the content script
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new FreshdeskContentScript();
    });
} else {
    new FreshdeskContentScript();
}