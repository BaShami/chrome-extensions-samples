# 🔍 Data Scraper & Webhook Sender Chrome Extension

A powerful Chrome extension that allows you to scrape data from web pages and automatically send it to webhook endpoints. Perfect for data collection, monitoring, and automation tasks.

## ✨ Features

- **Flexible Data Scraping**: Extract text, links, images, and more using CSS selectors
- **Webhook Integration**: Automatically send scraped data to your webhook endpoints
- **Custom Scraping Rules**: Define your own scraping patterns using JSON configuration
- **Beautiful UI**: Modern, responsive interface with real-time feedback
- **History Tracking**: Keep track of all scraping activities and results
- **Context Menu Integration**: Right-click to access quick scraping options
- **Keyboard Shortcuts**: Quick access with customizable shortcuts
- **Error Handling**: Comprehensive error reporting and retry mechanisms

## 🚀 Installation

### Method 1: Load Unpacked Extension (Development)

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the `chrome-extension` folder
5. The extension should now appear in your extensions list

### Method 2: Packaged Extension (Production)

1. In `chrome://extensions/`, click "Pack extension"
2. Select the `chrome-extension` folder
3. Chrome will generate a `.crx` file and `.pem` key file
4. Share the `.crx` file with users (they'll need to drag it to `chrome://extensions/`)

## 📖 Usage

### Basic Setup

1. **Configure Webhook**: Click the extension icon and enter your webhook URL
2. **Set Scraping Rules**: Define what data to extract using CSS selectors
3. **Start Scraping**: Navigate to any webpage and click "Scrape Current Page"

### Scraping Rules Example

```json
{
  "title": "h1, .title, [class*='title']",
  "content": ".content, .main, .body, .text",
  "links": "a[href]",
  "images": "img[src]",
  "price": ".price, [data-price], .cost",
  "rating": ".rating, [data-rating], .stars",
  "author": ".author, [rel='author'], .byline",
  "date": ".date, .time, time, [datetime]"
}
```

### Advanced Selectors

- **Multiple selectors**: Use commas for fallback options (`h1, .title, [class*='title']`)
- **Attribute selectors**: Target specific attributes (`[data-price]`, `[href*='example.com']`)
- **Pseudo-classes**: Use `:first-child`, `:last-child`, etc.
- **Complex selectors**: Combine multiple conditions (`.product:not(.out-of-stock)`)

## 🔧 Configuration

### Webhook URL
Enter the endpoint where you want to receive scraped data. The extension will send a POST request with the scraped data in JSON format.

### Scraping Rules
Define key-value pairs where:
- **Key**: The name for the extracted data
- **Value**: CSS selector(s) to find the elements

### Data Format
The webhook receives data in this format:
```json
{
  "title": "Page Title",
  "content": "Main content text",
  "links": ["https://example.com", "https://example.org"],
  "metadata": {
    "url": "https://example.com/page",
    "title": "Page Title",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "userAgent": "Mozilla/5.0...",
    "domain": "example.com"
  }
}
```

## 🎯 Use Cases

- **E-commerce Monitoring**: Track prices, availability, and product information
- **Content Aggregation**: Collect articles, news, and blog posts
- **Social Media Monitoring**: Track posts, engagement metrics, and trends
- **Competitive Analysis**: Monitor competitor websites and pricing
- **Data Backup**: Archive important web content
- **Automated Testing**: Verify website content and functionality

## 🛠️ Development

### Project Structure
```
chrome-extension/
├── manifest.json          # Extension configuration
├── popup.html            # Main popup interface
├── popup.css             # Popup styling
├── popup.js              # Popup functionality
├── content.js            # Content script for page interaction
├── background.js         # Background service worker
├── welcome.html          # Welcome page for new users
├── icons/                # Extension icons
└── README.md             # This file
```

### Key Components

- **Popup**: User interface for configuration and scraping
- **Content Script**: Injected into web pages to extract data
- **Background Script**: Handles extension lifecycle and communication
- **Storage API**: Saves configuration and scraping history

### Adding New Features

1. **New Scraping Types**: Modify `content.js` to handle new element types
2. **UI Enhancements**: Update `popup.html` and `popup.css`
3. **Background Tasks**: Add new message handlers in `background.js`
4. **Permissions**: Update `manifest.json` for new capabilities

## 🔒 Security & Privacy

- **Permissions**: Only requests necessary permissions for functionality
- **Data Handling**: All data is processed locally before sending to webhook
- **No Tracking**: Extension doesn't collect or store personal information
- **Secure Communication**: Uses HTTPS for webhook communication

## 🐛 Troubleshooting

### Common Issues

**Extension not working on certain sites**
- Check if the site uses Content Security Policy (CSP) that blocks scripts
- Verify the site allows content script injection
- Try refreshing the page and reloading the extension

**Webhook not receiving data**
- Verify the webhook URL is correct and accessible
- Check if the webhook endpoint accepts POST requests
- Ensure the endpoint can handle JSON payloads
- Check browser console for error messages

**Scraping rules not working**
- Use browser developer tools to verify CSS selectors
- Test selectors in the browser console
- Ensure elements are loaded before scraping
- Try simpler selectors first

**Extension crashes or freezes**
- Reload the extension in `chrome://extensions/`
- Clear browser cache and cookies
- Check for conflicting extensions
- Restart Chrome browser

### Debug Mode

Enable debug logging by opening the browser console and looking for messages starting with "Data Scraper Extension:".

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Search existing issues in the repository
3. Create a new issue with detailed information
4. Include browser version, extension version, and error messages

## 🔄 Updates

The extension automatically checks for updates and will notify you when a new version is available. You can also manually check by visiting `chrome://extensions/`.

---

**Happy Scraping! 🎉**
