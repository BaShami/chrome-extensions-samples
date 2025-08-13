# 🕷️ Data Scraper & Webhook Sender Chrome Extension

A powerful Chrome extension that can scrape data from web pages and automatically send it to webhooks. Perfect for data collection, monitoring, and automation workflows.

## ✨ Features

- **Comprehensive Data Scraping**: Extracts page metadata, headings, links, images, forms, and tables
- **Custom CSS Selectors**: Define custom selectors to extract specific data points
- **Webhook Integration**: Send scraped data to any webhook endpoint with customizable headers
- **Auto-Scraping**: Automatically scrape pages on load or at set intervals
- **Real-time Preview**: See scraped data before sending to webhook
- **Activity Logging**: Track all scraping activities with detailed logs
- **Beautiful UI**: Modern, intuitive popup interface with tabs and status indicators

## 🚀 Installation

### Method 1: Load Unpacked Extension (Recommended for Development)

1. **Download the Extension Files**
   - Clone or download this repository to your local machine

2. **Open Chrome Extensions Page**
   - Open Google Chrome
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right corner

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the folder containing the extension files
   - The extension should now appear in your extensions list

4. **Pin the Extension**
   - Click the puzzle piece icon in the Chrome toolbar
   - Find "Data Scraper & Webhook Sender" and click the pin icon

### Method 2: Create Extension Package (for Distribution)

1. In Chrome extensions page (`chrome://extensions/`)
2. Click "Pack extension"
3. Select the extension directory
4. This will create a `.crx` file for distribution

## 🔧 Configuration

### 1. Webhook Setup

1. Click the extension icon in your Chrome toolbar
2. Go to the **Settings** tab
3. Configure your webhook:
   - **Webhook URL**: Your endpoint URL (e.g., `https://api.example.com/webhook`)
   - **HTTP Method**: POST, PUT, or PATCH
   - **Custom Headers**: JSON object with additional headers (optional)

Example webhook configuration:
```json
{
  "Authorization": "Bearer your-api-token",
  "Content-Type": "application/json",
  "X-Custom-Header": "your-value"
}
```

### 2. Custom Data Extraction

Define custom CSS selectors to extract specific data points:

```json
{
  "productName": ".product-title",
  "price": ".price-value",
  "description": ".product-description",
  "availability": ".stock-status"
}
```

### 3. Auto-Scraping

- Enable auto-scraping to automatically extract data when pages load
- Set intervals between 5-300 seconds for periodic scraping
- Auto-scraping works on the currently active tab

## 📊 Data Structure

The extension sends a comprehensive JSON object to your webhook:

```json
{
  "url": "https://example.com/page",
  "title": "Page Title",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "metadata": {
    "domain": "example.com",
    "pathname": "/page",
    "description": "Page meta description",
    "keywords": "page, keywords",
    "headings": [
      {
        "level": 1,
        "text": "Main Heading",
        "id": "heading-id"
      }
    ],
    "links": [
      {
        "text": "Link Text",
        "href": "https://example.com/link",
        "title": "Link Title"
      }
    ],
    "images": [
      {
        "src": "https://example.com/image.jpg",
        "alt": "Image Description",
        "title": "Image Title",
        "width": 800,
        "height": 600
      }
    ],
    "forms": [
      {
        "action": "/submit",
        "method": "post",
        "inputs": [
          {
            "type": "text",
            "name": "email",
            "id": "email-input",
            "placeholder": "Enter email"
          }
        ]
      }
    ],
    "tables": [
      {
        "rows": [["Header 1", "Header 2"], ["Data 1", "Data 2"]],
        "caption": "Table Caption"
      }
    ]
  },
  "customData": {
    "productName": "Extracted Product Name",
    "price": "$99.99"
  }
}
```

## 🎯 Usage

### Manual Scraping

1. Navigate to any webpage
2. Click the extension icon
3. Click **"Scrape Current Page"**
4. View the scraped data in the preview section
5. Data is automatically sent to your configured webhook

### Auto-Scraping

1. Configure your webhook in Settings
2. Enable "Auto-scraping" in Settings
3. Set your desired interval
4. Data will be automatically scraped and sent when pages load

### Activity Monitoring

- Use the **Logs** tab to monitor all scraping activities
- View success/error status for each operation
- Inspect detailed data for each scraping session
- Clear logs when needed

## 🛠️ Webhook Endpoint Requirements

Your webhook endpoint should:

1. **Accept HTTP requests** (POST, PUT, or PATCH)
2. **Handle JSON payloads** with Content-Type: application/json
3. **Return appropriate status codes**:
   - 200-299: Success
   - 400-499: Client error
   - 500-599: Server error

### Example Webhook Handler (Node.js/Express)

```javascript
app.post('/webhook', express.json(), (req, res) => {
  const scrapedData = req.body;
  
  console.log('Received scraped data:', {
    url: scrapedData.url,
    title: scrapedData.title,
    timestamp: scrapedData.timestamp
  });
  
  // Process the data
  // Save to database, trigger actions, etc.
  
  res.status(200).json({ 
    success: true, 
    message: 'Data received successfully' 
  });
});
```

## 🔒 Privacy & Security

- **Local Storage**: Settings are stored locally in Chrome's sync storage
- **No Data Collection**: The extension doesn't collect or store your personal data
- **Secure Communication**: All webhook communications use HTTPS when possible
- **Permissions**: Extension only accesses data from tabs you explicitly scrape

## 🐛 Troubleshooting

### Common Issues

**Extension not loading:**
- Ensure all files are in the same directory
- Check Chrome's developer console for errors
- Verify manifest.json syntax

**Webhook not receiving data:**
- Check the webhook URL is correct and accessible
- Verify your webhook accepts the configured HTTP method
- Check the Logs tab for error messages
- Ensure your webhook returns appropriate status codes

**Data not scraping:**
- Verify the page has fully loaded
- Check if the page blocks content scripts
- Try refreshing the page and scraping again

**Custom selectors not working:**
- Verify CSS selector syntax
- Check if elements exist on the page
- Use browser dev tools to test selectors

### Debug Mode

To debug the extension:

1. Open Chrome DevTools (F12)
2. Go to the Console tab
3. Look for extension-related messages
4. Check the Network tab for webhook requests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Look at existing issues in the repository
3. Create a new issue with detailed information about your problem

## 🔄 Updates

Check for updates regularly as new features and improvements are added frequently. The extension will automatically update if installed from the Chrome Web Store.

---

**Happy Scraping! 🎉**
