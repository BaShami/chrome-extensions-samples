# Installation Guide

## Quick Setup (5 minutes)

### Step 1: Download Files
1. Save all the extension files to a folder on your computer
2. Name the folder something like `freshdesk-ai-extension`

### Step 2: Enable Developer Mode
1. Open Chrome
2. Go to `chrome://extensions/`
3. Turn ON "Developer mode" (toggle in top-right corner)

### Step 3: Load Extension
1. Click "Load unpacked" button
2. Select the folder containing the extension files
3. Click "Select Folder"

### Step 4: Pin Extension
1. Click the puzzle piece icon (🧩) in Chrome toolbar
2. Find "Freshdesk AI Assistant"
3. Click the pin icon (📌) to pin it to toolbar

### Step 5: Test It
1. Go to any Freshdesk ticket page
2. Click the extension icon
3. You should see the ticket ID automatically filled
4. Type a question and click "Send to AI"

## Troubleshooting

**Extension not showing up?**
- Make sure Developer mode is ON
- Check that all files are in the same folder
- Try refreshing the extensions page

**Ticket ID not detected?**
- Make sure you're on a ticket page with URL like: `https://make-hq.freshdesk.com/a/tickets/123456`
- Refresh the page and try again

**Webhook not working?**
- Check your internet connection
- Verify the webhook URL is correct in popup.js
- Check browser console for error messages

## Files You Need
- manifest.json
- popup.html
- popup.css
- popup.js
- content.js
- README.md (this file)

That's it! Your extension should now be working. 🎉