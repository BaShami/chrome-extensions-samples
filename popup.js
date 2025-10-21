// DOM elements
const ticketIdInput = document.getElementById('ticketId');
const aiQuestionInput = document.getElementById('aiQuestion');
const sendButton = document.getElementById('sendButton');
const responseSection = document.getElementById('responseSection');
const responseIdValue = document.getElementById('responseIdValue');
const responseContent = document.getElementById('responseContent');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = statusIndicator.querySelector('.status-text');
const statusDot = statusIndicator.querySelector('.status-dot');
const loadingOverlay = document.getElementById('loadingOverlay');

// Webhook URL
const WEBHOOK_URL = 'https://hook.eu1.make.com/wvdq398xwh5eg1zvosyusshlg52u22p5';

// Initialize the popup
document.addEventListener('DOMContentLoaded', async () => {
    await extractTicketId();
    setupEventListeners();
});

// Extract ticket ID from current tab URL
async function extractTicketId() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab || !tab.url) {
            updateStatus('error', 'No active tab found');
            return;
        }

        const url = tab.url;
        const ticketIdMatch = url.match(/\/tickets\/(\d+)/);
        
        if (ticketIdMatch) {
            const ticketId = ticketIdMatch[1];
            ticketIdInput.value = ticketId;
            updateStatus('success', 'Ticket ID extracted');
        } else {
            ticketIdInput.value = '';
            ticketIdInput.placeholder = 'No ticket ID found in URL';
            updateStatus('warning', 'Not on a ticket page');
        }
    } catch (error) {
        console.error('Error extracting ticket ID:', error);
        updateStatus('error', 'Error extracting ticket ID');
    }
}

// Setup event listeners
function setupEventListeners() {
    sendButton.addEventListener('click', handleSendRequest);
    
    // Enable send button when question is entered
    aiQuestionInput.addEventListener('input', () => {
        const hasQuestion = aiQuestionInput.value.trim().length > 0;
        const hasTicketId = ticketIdInput.value.trim().length > 0;
        sendButton.disabled = !(hasQuestion && hasTicketId);
    });
    
    // Handle Enter key in textarea
    aiQuestionInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            handleSendRequest();
        }
    });
}

// Handle send request
async function handleSendRequest() {
    const ticketId = ticketIdInput.value.trim();
    const question = aiQuestionInput.value.trim();
    
    if (!ticketId || !question) {
        updateStatus('error', 'Please fill in all fields');
        return;
    }
    
    // Show loading state
    showLoading(true);
    updateStatus('loading', 'Sending request...');
    
    try {
        const response = await sendToWebhook(ticketId, question);
        
        if (response && response['response ID ']) {
            displayResponse(response);
            updateStatus('success', 'Response received');
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error('Error sending request:', error);
        updateStatus('error', 'Failed to send request');
        showError('Failed to send request. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Send data to webhook
async function sendToWebhook(ticketId, question) {
    const payload = {
        "ticket #": ticketId,
        "question to AI": question
    };
    
    const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
}

// Display response
function displayResponse(response) {
    responseIdValue.textContent = response['response ID '] || 'N/A';
    responseContent.textContent = response.reply || response.response || 'No response content received';
    responseSection.style.display = 'block';
    
    // Scroll to response section
    responseSection.scrollIntoView({ behavior: 'smooth' });
}

// Show error message
function showError(message) {
    // Create a temporary error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #fee2e2;
        color: #dc2626;
        padding: 12px 20px;
        border-radius: 8px;
        border: 1px solid #fecaca;
        font-size: 14px;
        font-weight: 500;
        z-index: 1001;
        box-shadow: 0 4px 12px rgba(220, 38, 38, 0.15);
        animation: slideDown 0.3s ease-out;
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    // Remove after 3 seconds
    setTimeout(() => {
        errorDiv.style.animation = 'slideUp 0.3s ease-out';
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 300);
    }, 3000);
}

// Show/hide loading overlay
function showLoading(show) {
    loadingOverlay.style.display = show ? 'flex' : 'none';
    sendButton.disabled = show;
}

// Update status indicator
function updateStatus(type, message) {
    statusText.textContent = message;
    
    // Remove existing status classes
    statusDot.className = 'status-dot';
    
    switch (type) {
        case 'success':
            statusDot.style.background = '#4ade80';
            break;
        case 'error':
            statusDot.style.background = '#ef4444';
            break;
        case 'warning':
            statusDot.style.background = '#f59e0b';
            break;
        case 'loading':
            statusDot.style.background = '#3b82f6';
            statusDot.style.animation = 'spin 1s linear infinite';
            break;
        default:
            statusDot.style.background = '#6b7280';
            statusDot.style.animation = 'pulse 2s ease-in-out infinite';
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
    }
`;
document.head.appendChild(style);