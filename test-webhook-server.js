const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Store received webhook data
let webhookHistory = [];
const maxHistorySize = 100;

// Routes
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Test Webhook Server</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                    background: #f5f5f5;
                }
                .container {
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #667eea;
                }
                .webhook-url {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                    font-family: monospace;
                    font-size: 16px;
                    border: 2px solid #667eea;
                    color: #667eea;
                    text-align: center;
                    margin: 20px 0;
                }
                .stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin: 30px 0;
                }
                .stat-card {
                    background: #667eea;
                    color: white;
                    padding: 20px;
                    border-radius: 8px;
                    text-align: center;
                }
                .stat-number {
                    font-size: 2em;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                .webhook-data {
                    background: #f8f9fa;
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 20px 0;
                    max-height: 400px;
                    overflow-y: auto;
                }
                .webhook-item {
                    background: white;
                    border: 1px solid #dee2e6;
                    border-radius: 6px;
                    padding: 15px;
                    margin-bottom: 15px;
                }
                .webhook-item h3 {
                    margin: 0 0 10px 0;
                    color: #667eea;
                    font-size: 16px;
                }
                .webhook-item .timestamp {
                    color: #6c757d;
                    font-size: 12px;
                    margin-bottom: 10px;
                }
                .webhook-item .data {
                    background: #f8f9fa;
                    padding: 10px;
                    border-radius: 4px;
                    font-family: monospace;
                    font-size: 12px;
                    white-space: pre-wrap;
                    max-height: 200px;
                    overflow-y: auto;
                }
                .clear-btn {
                    background: #dc3545;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                }
                .clear-btn:hover {
                    background: #c82333;
                }
                .instructions {
                    background: #e7f3ff;
                    border: 1px solid #b3d9ff;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 20px 0;
                }
                .instructions h3 {
                    color: #0056b3;
                    margin-top: 0;
                }
                .instructions ol {
                    margin: 10px 0;
                    padding-left: 20px;
                }
                .instructions li {
                    margin: 8px 0;
                    line-height: 1.5;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔗 Test Webhook Server</h1>
                    <p>Use this server to test your Chrome extension's webhook functionality</p>
                </div>
                
                <div class="webhook-url">
                    <strong>Webhook URL:</strong><br>
                    http://localhost:${PORT}/webhook
                </div>
                
                <div class="stats">
                    <div class="stat-card">
                        <div class="stat-number">${webhookHistory.length}</div>
                        <div>Total Requests</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${webhookHistory.filter(item => item.success).length}</div>
                        <div>Successful</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${webhookHistory.filter(item => !item.success).length}</div>
                        <div>Failed</div>
                    </div>
                </div>
                
                <div class="instructions">
                    <h3>How to Use:</h3>
                    <ol>
                        <li>Copy the webhook URL above</li>
                        <li>Paste it into your Chrome extension's webhook configuration</li>
                        <li>Navigate to any webpage and use the extension to scrape data</li>
                        <li>Watch the webhook data appear below in real-time</li>
                    </ol>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h2>Received Webhook Data</h2>
                    <button class="clear-btn" onclick="clearHistory()">Clear History</button>
                </div>
                
                <div class="webhook-data" id="webhookData">
                    ${webhookHistory.length === 0 ? 
                        '<p style="text-align: center; color: #6c757d; font-style: italic;">No webhook data received yet. Start using your extension to see data here!</p>' : 
                        webhookHistory.map(item => `
                            <div class="webhook-item">
                                <h3>${item.success ? '✅ Success' : '❌ Failed'}</h3>
                                <div class="timestamp">${new Date(item.timestamp).toLocaleString()}</div>
                                <div class="data">${JSON.stringify(item.data, null, 2)}</div>
                            </div>
                        `).join('')
                    }
                </div>
            </div>
            
            <script>
                // Auto-refresh every 5 seconds
                setInterval(() => {
                    location.reload();
                }, 5000);
                
                function clearHistory() {
                    if (confirm('Are you sure you want to clear all webhook history?')) {
                        fetch('/clear-history', { method: 'POST' })
                            .then(() => location.reload())
                            .catch(err => console.error('Error clearing history:', err));
                    }
                }
            </script>
        </body>
        </html>
    `);
});

// Webhook endpoint
app.post('/webhook', (req, res) => {
    const timestamp = new Date();
    const data = req.body;
    
    console.log('📥 Webhook received at:', timestamp.toISOString());
    console.log('📊 Data:', JSON.stringify(data, null, 2));
    
    // Add to history
    const webhookItem = {
        timestamp: timestamp.toISOString(),
        data: data,
        success: true
    };
    
    webhookHistory.unshift(webhookItem);
    
    // Keep history size manageable
    if (webhookHistory.length > maxHistorySize) {
        webhookHistory = webhookHistory.slice(0, maxHistorySize);
    }
    
    // Save to file
    const logFile = path.join(logsDir, `webhook-${timestamp.toISOString().split('T')[0]}.json`);
    try {
        const logData = {
            timestamp: timestamp.toISOString(),
            data: data,
            headers: req.headers
        };
        
        if (fs.existsSync(logFile)) {
            const existingLogs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
            existingLogs.push(logData);
            fs.writeFileSync(logFile, JSON.stringify(existingLogs, null, 2));
        } else {
            fs.writeFileSync(logFile, JSON.stringify([logData], null, 2));
        }
    } catch (error) {
        console.error('Error saving log file:', error);
    }
    
    res.status(200).json({
        success: true,
        message: 'Webhook received successfully',
        timestamp: timestamp.toISOString(),
        dataSize: JSON.stringify(data).length
    });
});

// Clear history endpoint
app.post('/clear-history', (req, res) => {
    webhookHistory = [];
    res.json({ success: true, message: 'History cleared' });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        webhookCount: webhookHistory.length
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
🚀 Test Webhook Server is running!
📍 URL: http://localhost:${PORT}
🔗 Webhook endpoint: http://localhost:${PORT}/webhook
📊 Dashboard: http://localhost:${PORT}
💚 Health check: http://localhost:${PORT}/health

📝 To use with your Chrome extension:
1. Copy the webhook URL above
2. Paste it into your extension's webhook configuration
3. Start scraping data from web pages
4. Watch the webhook data appear in real-time

Press Ctrl+C to stop the server
    `);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down webhook server...');
    process.exit(0);
});