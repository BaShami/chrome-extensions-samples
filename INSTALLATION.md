# 🚀 Installation Guide for Data Scraper Chrome Extension

## Prerequisites

- Google Chrome browser (version 88 or later)
- Basic knowledge of CSS selectors (for customizing scraping rules)

## 📦 Installation Steps

### Step 1: Download the Extension

1. **Clone or download** this repository to your local machine
2. **Navigate** to the `chrome-extension` folder

### Step 2: Load the Extension in Chrome

1. **Open Chrome** and go to `chrome://extensions/`
2. **Enable Developer mode** by toggling the switch in the top-right corner
3. **Click "Load unpacked"** button
4. **Select the `chrome-extension` folder** from your downloaded files
5. **Verify** the extension appears in your extensions list

### Step 3: Configure the Extension

1. **Click the extension icon** in your Chrome toolbar
2. **Enter your webhook URL** where you want to receive scraped data
3. **Set up scraping rules** using CSS selectors (see examples below)
4. **Click "Save Configuration"**

### Step 4: Test the Extension

1. **Navigate** to any webpage you want to scrape
2. **Click the extension icon** and then "Scrape Current Page"
3. **Check your webhook endpoint** to see the received data

## 🔧 Basic Configuration

### Webhook URL
Enter the endpoint where you want to receive data:
```
https://your-domain.com/webhook
http://localhost:3000/webhook (for local testing)
```

### Scraping Rules
Define what data to extract using CSS selectors:

```json
{
  "title": "h1, .title",
  "content": ".content, .main, .body",
  "links": "a[href]",
  "images": "img[src]",
  "price": ".price, [data-price]",
  "author": ".author, [rel='author']"
}
```

## 🧪 Testing with Local Webhook Server

If you want to test locally before setting up a production webhook:

1. **Install Node.js** (version 14 or later)
2. **Navigate** to the project root directory
3. **Install dependencies**: `npm install`
4. **Start the test server**: `npm start`
5. **Use the webhook URL**: `http://localhost:3000/webhook`
6. **Open the dashboard**: `http://localhost:3000`

## 🎯 Quick Start Examples

### Example 1: Scraping a News Article
```json
{
  "headline": "h1, .headline, .title",
  "content": ".article-content, .story-body, .content",
  "author": ".byline, .author, [rel='author']",
  "date": ".publish-date, .timestamp, time",
  "tags": ".tags a, .categories a"
}
```

### Example 2: Scraping an E-commerce Product
```json
{
  "product_name": "h1, .product-title, .item-name",
  "price": ".price, .cost, [data-price]",
  "description": ".description, .product-details, .summary",
  "images": ".product-image img, .gallery img",
  "availability": ".stock, .availability, .in-stock"
}
```

### Example 3: Scraping Social Media
```json
{
  "username": ".username, .handle, .author-name",
  "post_content": ".post-text, .tweet-text, .content",
  "engagement": ".likes, .retweets, .shares",
  "timestamp": ".timestamp, .time, time"
}
```

## 🔍 Finding CSS Selectors

1. **Right-click** on the element you want to scrape
2. **Select "Inspect"** to open Developer Tools
3. **Look at the HTML structure** and find unique identifiers
4. **Use classes, IDs, or attributes** to create selectors
5. **Test selectors** in the Console tab

### Common Selector Patterns
- **Class**: `.class-name`
- **ID**: `#element-id`
- **Attribute**: `[data-price]`, `[href*="example.com"]`
- **Multiple**: `h1, .title, [class*="title"]`
- **Hierarchy**: `.parent .child`, `.container > .item`

## 🚨 Troubleshooting

### Extension Not Working
- **Reload the extension** in `chrome://extensions/`
- **Check permissions** - ensure the extension has access to the site
- **Refresh the webpage** and try again
- **Check browser console** for error messages

### Webhook Not Receiving Data
- **Verify the webhook URL** is correct and accessible
- **Check if the endpoint** accepts POST requests
- **Ensure the endpoint** can handle JSON payloads
- **Test with a simple endpoint** like the local test server

### Scraping Rules Not Working
- **Use browser developer tools** to verify selectors
- **Test selectors** in the browser console
- **Ensure elements are loaded** before scraping
- **Try simpler selectors** first

## 📱 Using the Extension

### Basic Workflow
1. **Configure** your webhook and scraping rules
2. **Navigate** to a webpage you want to scrape
3. **Click the extension icon** in your toolbar
4. **Click "Scrape Current Page"**
5. **Check your webhook** for the received data

### Advanced Features
- **Right-click context menu** for quick access
- **Keyboard shortcuts** (if configured)
- **History tracking** for past scraping results
- **Custom scraping rules** for different types of content

## 🔒 Security Considerations

- **Only scrape public data** from websites
- **Respect robots.txt** and website terms of service
- **Use appropriate delays** between requests
- **Don't overload** websites with excessive requests
- **Test on your own websites** first

## 📞 Getting Help

If you encounter issues:
1. **Check the troubleshooting section** above
2. **Review the README.md** for detailed documentation
3. **Check browser console** for error messages
4. **Verify your configuration** is correct
5. **Test with the local webhook server** first

---

**Happy Scraping! 🎉**