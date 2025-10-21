class FreshdeskAIAssistant {
    constructor() {
        this.webhookUrl = 'https://hook.eu1.make.com/wvdq398xwh5eg1zvosyusshlg52u22p5';
        this.ticketId = null;
        this.init();
    }

    init() {
        this.bindElements();
        this.extractTicketId();
        this.bindEvents();
        this.updateStatus('Ready', 'ready');
    }

    bindElements() {
        this.elements = {
            ticketIdInput: document.getElementById('ticketId'),
            questionTextarea: document.getElementById('question'),
            sendBtn: document.getElementById('sendBtn'),
            btnText: document.querySelector('.btn-text'),
            btnLoader: document.querySelector('.btn-loader'),
            responseContainer: document.getElementById('responseContainer'),
            responseId: document.getElementById('responseId'),
            responseContent: document.getElementById('responseContent'),
            statusIndicator: document.getElementById('statusIndicator'),
            statusText: document.getElementById('statusText')
        };
    }

    bindEvents() {
        this.elements.sendBtn.addEventListener('click', () => this.handleSendQuestion());
        this.elements.questionTextarea.addEventListener('input', () => this.validateForm());
        
        // Handle Enter key in textarea (Ctrl+Enter to send)
        this.elements.questionTextarea.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                if (!this.elements.sendBtn.disabled) {
                    this.handleSendQuestion();
                }
            }
        });
    }

    async extractTicketId() {
        try {
            this.updateStatus('Extracting ticket ID...', 'loading');
            
            // Get the current active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab || !tab.url) {
                throw new Error('Could not access current tab');
            }

            // Check if we're on a Freshdesk page
            if (!tab.url.includes('freshdesk.com')) {
                throw new Error('Please navigate to a Freshdesk ticket page');
            }

            // Try to get ticket ID from content script first
            try {
                const response = await chrome.tabs.sendMessage(tab.id, { action: 'getTicketId' });
                if (response && response.ticketId) {
                    this.ticketId = response.ticketId;
                    this.elements.ticketIdInput.value = this.ticketId;
                    this.updateStatus('Ticket ID extracted successfully', 'ready');
                    this.validateForm();
                    return;
                }
            } catch (contentScriptError) {
                console.log('Content script not available, falling back to URL parsing');
            }

            // Fallback: Extract ticket ID from URL directly
            const ticketIdMatch = tab.url.match(/\/tickets\/(\d+)/);
            
            if (ticketIdMatch && ticketIdMatch[1]) {
                this.ticketId = ticketIdMatch[1];
                this.elements.ticketIdInput.value = this.ticketId;
                this.updateStatus('Ticket ID extracted successfully', 'ready');
                this.validateForm();
            } else {
                throw new Error('No ticket ID found in URL. Please navigate to a Freshdesk ticket.');
            }
        } catch (error) {
            console.error('Error extracting ticket ID:', error);
            this.elements.ticketIdInput.value = '';
            this.elements.ticketIdInput.placeholder = 'No ticket ID found';
            this.updateStatus('Error: ' + error.message, 'error');
        }
    }

    validateForm() {
        const hasTicketId = this.ticketId && this.ticketId.trim() !== '';
        const hasQuestion = this.elements.questionTextarea.value.trim() !== '';
        
        this.elements.sendBtn.disabled = !(hasTicketId && hasQuestion);
    }

    async handleSendQuestion() {
        if (!this.ticketId || !this.elements.questionTextarea.value.trim()) {
            return;
        }

        try {
            this.setLoadingState(true);
            this.updateStatus('Sending question to AI...', 'loading');

            const payload = {
                "ticket #": this.ticketId,
                "question to AI": this.elements.questionTextarea.value.trim(),
                "response ID": ""
            };

            const response = await this.sendToWebhook(payload);
            
            if (response) {
                this.displayResponse(response);
                this.updateStatus('Response received successfully', 'ready');
            } else {
                throw new Error('No response received from webhook');
            }

        } catch (error) {
            console.error('Error sending question:', error);
            this.updateStatus('Error: ' + error.message, 'error');
            this.showErrorMessage(error.message);
        } finally {
            this.setLoadingState(false);
        }
    }

    async sendToWebhook(payload) {
        try {
            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();
            return responseData;

        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error: Could not connect to webhook');
            }
            throw error;
        }
    }

    displayResponse(responseData) {
        // Extract response ID and content from the webhook response
        let responseId = '';
        let responseContent = '';

        if (responseData && typeof responseData === 'object') {
            // Look for response ID in various possible fields
            responseId = responseData['response ID'] || 
                        responseData['responseId'] || 
                        responseData['response_id'] || 
                        responseData['id'] || 
                        'N/A';

            // Look for response content
            responseContent = responseData['response'] || 
                            responseData['content'] || 
                            responseData['message'] || 
                            responseData['reply'] || 
                            JSON.stringify(responseData, null, 2);
        } else if (typeof responseData === 'string') {
            responseContent = responseData;
            responseId = 'N/A';
        } else {
            responseContent = 'Received response but could not parse content';
            responseId = 'N/A';
        }

        // Update the UI
        this.elements.responseId.textContent = responseId;
        this.elements.responseContent.textContent = responseContent;
        this.elements.responseContainer.classList.remove('hidden');

        // Scroll to response
        this.elements.responseContainer.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
        });
    }

    showErrorMessage(message) {
        this.elements.responseId.textContent = 'Error';
        this.elements.responseContent.textContent = message;
        this.elements.responseContainer.classList.remove('hidden');
        this.elements.responseContainer.style.borderLeftColor = '#dc3545';
    }

    setLoadingState(isLoading) {
        this.elements.sendBtn.disabled = isLoading;
        
        if (isLoading) {
            this.elements.btnText.classList.add('hidden');
            this.elements.btnLoader.classList.remove('hidden');
        } else {
            this.elements.btnText.classList.remove('hidden');
            this.elements.btnLoader.classList.add('hidden');
        }
    }

    updateStatus(message, type = 'ready') {
        this.elements.statusText.textContent = message;
        
        const statusDot = this.elements.statusIndicator.querySelector('.status-dot');
        statusDot.className = `status-dot ${type}`;
        
        // Auto-clear status after 5 seconds for non-error messages
        if (type !== 'error') {
            setTimeout(() => {
                if (this.elements.statusText.textContent === message) {
                    this.elements.statusText.textContent = 'Ready';
                    statusDot.className = 'status-dot ready';
                }
            }, 5000);
        }
    }
}

// Initialize the extension when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FreshdeskAIAssistant();
});

// Handle any unhandled errors
window.addEventListener('error', (event) => {
    console.error('Unhandled error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});