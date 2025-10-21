# Freshdesk AI Assistant Chrome Extension

A beautiful Chrome extension that extracts ticket IDs from Freshdesk URLs and allows users to send AI questions via webhook integration.

## Features

- 🎫 **Automatic Ticket ID Extraction**: Automatically detects and extracts ticket IDs from Freshdesk URLs
- 💬 **AI Question Interface**: Clean, modern interface for asking AI questions
- 🚀 **Webhook Integration**: Sends questions to your Make.com webhook and receives responses
- 🎨 **3D Modern UI**: Beautiful 3D card design with smooth animations
- 📱 **Responsive Design**: Works perfectly on different screen sizes
- ⚡ **Real-time Status**: Visual status indicators for different states

## Installation

1. **Download the Extension Files**
   - Download all the files in this directory to a folder on your computer

2. **Enable Developer Mode in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Toggle "Developer mode" in the top right corner

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the folder containing the extension files
   - The extension should now appear in your extensions list

4. **Pin the Extension**
   - Click the puzzle piece icon in Chrome's toolbar
   - Find "Freshdesk AI Assistant" and click the pin icon

## Usage

1. **Navigate to a Freshdesk Ticket**
   - Go to any Freshdesk ticket page (e.g., `https://make-hq.freshdesk.com/a/tickets/1832652`)
   - The extension will automatically extract the ticket ID

2. **Open the Extension**
   - Click the extension icon in your Chrome toolbar
   - A beautiful 3D popup will appear with the ticket ID pre-filled

3. **Ask Your Question**
   - Type your question in the "Question to AI" field
   - Click "Send to AI" or press Ctrl+Enter

4. **View the Response**
   - The extension will send your data to the webhook
   - Once the response is received, it will display the AI response and response ID

## Webhook Integration

The extension sends data to your Make.com webhook in the following JSON format:

```json
{
    "ticket #": "1832652",
    "question to AI": "Your question here"
}
```

Expected response format:

```json
{
    "ticket #": "1832652",
    "question to AI": "Your question here",
    "response ID ": "resp_6886499ab6c881a3a78ae4268a7b988c0d3b71c1fceea478",
    "reply": "AI response content"
}
```

## Configuration

To change the webhook URL, edit the `WEBHOOK_URL` constant in `popup.js`:

```javascript
const WEBHOOK_URL = 'https://your-webhook-url-here';
```

## File Structure

```
freshdesk-ai-assistant/
├── manifest.json          # Extension manifest
├── popup.html            # Popup HTML structure
├── popup.css             # 3D styling and animations
├── popup.js              # Main functionality
├── content.js            # Content script for URL detection
└── README.md             # This file
```

## Permissions

- `activeTab`: To access the current tab's URL
- `storage`: For potential future data storage
- `https://make-hq.freshdesk.com/*`: To work on Freshdesk pages
- `https://hook.eu1.make.com/*`: To send data to your webhook

## Troubleshooting

- **Ticket ID not detected**: Make sure you're on a Freshdesk ticket page with the correct URL format
- **Webhook not responding**: Check your webhook URL and ensure it's accessible
- **Extension not loading**: Make sure Developer mode is enabled in Chrome

## Browser Compatibility

- Chrome (Manifest V3)
- Edge (Chromium-based)
- Other Chromium-based browsers

## Support

If you encounter any issues or have suggestions for improvements, please check the browser console for error messages and ensure your webhook is properly configured.