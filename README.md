# Freshdesk AI Assistant Chrome Extension

A beautiful Chrome extension that extracts ticket IDs from Freshdesk URLs and allows users to send questions to an AI webhook, capturing and displaying responses with their IDs.

## Features

- 🎫 **Automatic Ticket ID Extraction**: Automatically detects and extracts ticket IDs from Freshdesk URLs
- 🤖 **AI Integration**: Send questions to your AI webhook and receive responses
- 🎨 **Modern 3D UI**: Beautiful, responsive interface with smooth animations
- 📱 **Real-time Status**: Live status updates and loading indicators
- 🔄 **Response Tracking**: Captures and displays response IDs for tracking
- ⚡ **Fast & Efficient**: Lightweight extension with optimized performance

## Installation

### Method 1: Developer Mode (Recommended for testing)

1. **Download the Extension**
   - Clone or download this repository to your local machine
   - Extract the files if downloaded as a ZIP

2. **Open Chrome Extensions**
   - Open Google Chrome
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right corner

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the folder containing the extension files
   - The extension should now appear in your extensions list

4. **Pin the Extension**
   - Click the puzzle piece icon (🧩) in the Chrome toolbar
   - Find "Freshdesk AI Assistant" and click the pin icon to keep it visible

### Method 2: Chrome Web Store (When published)

1. Visit the Chrome Web Store
2. Search for "Freshdesk AI Assistant"
3. Click "Add to Chrome"
4. Confirm the installation

## Usage

### Getting Started

1. **Navigate to a Freshdesk Ticket**
   - Go to your Freshdesk instance (e.g., `https://make-hq.freshdesk.com`)
   - Open any ticket (the URL should contain `/tickets/[ID]`)

2. **Open the Extension**
   - Click the Freshdesk AI Assistant icon in your Chrome toolbar
   - The extension will automatically extract the ticket ID from the URL

3. **Ask Your Question**
   - The ticket ID field will be automatically populated
   - Enter your question in the "Question for AI" textarea
   - Click "Send Question" or press `Ctrl+Enter`

4. **View the Response**
   - The extension will send your question to the configured webhook
   - Once a response is received, it will be displayed below the form
   - The response ID will be shown for tracking purposes

### Webhook Integration

The extension sends data to your webhook in the following JSON format:

```json
{
    "ticket #": "1832652",
    "question to AI": "Your question here",
    "response ID": ""
}
```

**Expected Response Format:**

Your webhook should return a JSON response containing:
- `response ID` or `responseId`: The unique identifier for the response
- `response`, `content`, `message`, or `reply`: The AI's response text

Example response:
```json
{
    "response ID": "resp_6886499ab6c881a3a78ae4268a7b988c0d3b71c1fceea478",
    "response": "This appears to be a client misconfiguration. Here's how to resolve it..."
}
```

## Configuration

### Webhook URL

The webhook URL is currently hardcoded in `popup.js`. To change it:

1. Open `popup.js`
2. Find the line: `this.webhookUrl = 'https://hook.eu1.make.com/wvdq398xwh5eg1zvosyusshlg52u22p5';`
3. Replace the URL with your webhook endpoint
4. Reload the extension in Chrome

### Supported Freshdesk Domains

The extension currently works with:
- `https://make-hq.freshdesk.com/*`

To add support for other Freshdesk domains:

1. Open `manifest.json`
2. Add your domain to the `host_permissions` array
3. Update the `matches` array in `content_scripts`
4. Reload the extension

## File Structure

```
freshdesk-ai-assistant/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup interface
├── popup.css             # Styling and 3D animations
├── popup.js              # Main extension logic
├── content.js            # Content script for URL monitoring
├── icon16.png            # 16x16 extension icon
├── icon48.png            # 48x48 extension icon
├── icon128.png           # 128x128 extension icon
├── create_icons.py       # Icon generation script
└── README.md             # This file
```

## Features in Detail

### 🎨 Modern UI/UX
- **3D Design**: Beautiful depth effects with CSS transforms
- **Smooth Animations**: Fluid transitions and hover effects
- **Responsive Layout**: Adapts to different content sizes
- **Status Indicators**: Real-time feedback on extension state

### 🔧 Technical Features
- **URL Monitoring**: Automatically detects ticket ID changes
- **Error Handling**: Comprehensive error management and user feedback
- **Loading States**: Visual feedback during API calls
- **Keyboard Shortcuts**: Ctrl+Enter to send questions quickly

### 🛡️ Security & Privacy
- **Minimal Permissions**: Only requests necessary permissions
- **Secure Communication**: HTTPS-only webhook communication
- **No Data Storage**: Doesn't store sensitive information locally

## Troubleshooting

### Common Issues

**Extension doesn't detect ticket ID:**
- Ensure you're on a Freshdesk ticket page with URL format `/tickets/[ID]`
- Try refreshing the page and reopening the extension
- Check that the domain is supported in the manifest

**Webhook requests fail:**
- Verify the webhook URL is correct and accessible
- Check your network connection
- Ensure the webhook accepts POST requests with JSON content

**Extension popup doesn't open:**
- Check if the extension is enabled in `chrome://extensions/`
- Try disabling and re-enabling the extension
- Reload the extension after making changes

### Debug Mode

To enable debug logging:
1. Open Chrome DevTools (F12)
2. Go to the Console tab
3. Look for messages prefixed with "Freshdesk AI Assistant"

## Development

### Prerequisites
- Google Chrome (latest version)
- Basic knowledge of HTML, CSS, and JavaScript
- Text editor or IDE

### Making Changes

1. Edit the relevant files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes

### Building Icons

If you have Python and PIL installed:
```bash
python3 create_icons.py
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or feature requests:
1. Check the troubleshooting section above
2. Create an issue in the repository
3. Provide detailed information about your setup and the problem

## Changelog

### Version 1.0.0
- Initial release
- Automatic ticket ID extraction
- AI webhook integration
- Modern 3D UI design
- Response tracking and display