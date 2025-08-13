# 🚀 Quick Start Guide - Data Scraper Chrome Extension

## 📁 What's in this folder?

This folder contains your complete Chrome extension for data scraping and webhook sending:

- `manifest.json` - Extension configuration
- `popup.html/css/js` - Main user interface
- `content.js` - Script that runs on web pages
- `background.js` - Background service worker
- `welcome.html` - Welcome page for new users
- `icons/` - Extension icons (SVG format)
- `create-icons.js` - Script to generate icons

## ⚡ Quick Installation

1. **Open Chrome** and go to `chrome://extensions/`
2. **Enable Developer mode** (toggle in top-right)
3. **Click "Load unpacked"** and select this folder
4. **Extension is ready!** 🎉

## 🔧 First Time Setup

1. **Click the extension icon** in your toolbar
2. **Enter your webhook URL** (e.g., `https://your-domain.com/webhook`)
3. **Set scraping rules** (see examples below)
4. **Click "Save Configuration"**

## 📝 Example Scraping Rules

```json
{
  "title": "h1, .title, [class*='title']",
  "content": ".content, .main, .body, .text",
  "links": "a[href]",
  "images": "img[src]",
  "price": ".price, [data-price]",
  "author": ".author, [rel='author']"
}
```

## 🧪 Testing

1. **Open the demo page**: `demo-page.html` (in parent directory)
2. **Use the extension** to scrape data
3. **Check your webhook** for received data

## 🆘 Need Help?

- **README.md** - Full documentation
- **INSTALLATION.md** - Detailed installation guide
- **demo-page.html** - Test page for scraping
- **test-webhook-server.js** - Local webhook server for testing

## 🔄 Updates

To update the extension:
1. **Modify the files** as needed
2. **Go to `chrome://extensions/`**
3. **Click the refresh icon** on your extension
4. **Changes are applied immediately**

---

**Happy Scraping! 🎉**