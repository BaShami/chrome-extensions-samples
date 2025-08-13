// Content script for data scraping
console.log('Data Scraper extension loaded');

// Function to scrape data from the current page
function scrapePageData() {
  const data = {
    url: window.location.href,
    title: document.title,
    timestamp: new Date().toISOString(),
    metadata: {
      domain: window.location.hostname,
      pathname: window.location.pathname,
      description: getMetaDescription(),
      keywords: getMetaKeywords(),
      headings: getHeadings(),
      links: getLinks(),
      images: getImages(),
      forms: getForms(),
      tables: getTables()
    }
  };

  return data;
}

// Get meta description
function getMetaDescription() {
  const metaDesc = document.querySelector('meta[name="description"]');
  return metaDesc ? metaDesc.getAttribute('content') : '';
}

// Get meta keywords
function getMetaKeywords() {
  const metaKeywords = document.querySelector('meta[name="keywords"]');
  return metaKeywords ? metaKeywords.getAttribute('content') : '';
}

// Get all headings
function getHeadings() {
  const headings = [];
  for (let i = 1; i <= 6; i++) {
    const elements = document.querySelectorAll(`h${i}`);
    elements.forEach(el => {
      headings.push({
        level: i,
        text: el.textContent.trim(),
        id: el.id || ''
      });
    });
  }
  return headings;
}

// Get all links
function getLinks() {
  const links = [];
  document.querySelectorAll('a[href]').forEach(link => {
    links.push({
      text: link.textContent.trim(),
      href: link.href,
      title: link.title || ''
    });
  });
  return links.slice(0, 50); // Limit to first 50 links
}

// Get all images
function getImages() {
  const images = [];
  document.querySelectorAll('img[src]').forEach(img => {
    images.push({
      src: img.src,
      alt: img.alt || '',
      title: img.title || '',
      width: img.naturalWidth,
      height: img.naturalHeight
    });
  });
  return images.slice(0, 20); // Limit to first 20 images
}

// Get all forms
function getForms() {
  const forms = [];
  document.querySelectorAll('form').forEach(form => {
    const inputs = [];
    form.querySelectorAll('input, select, textarea').forEach(input => {
      inputs.push({
        type: input.type || input.tagName.toLowerCase(),
        name: input.name || '',
        id: input.id || '',
        placeholder: input.placeholder || ''
      });
    });
    
    forms.push({
      action: form.action || '',
      method: form.method || 'get',
      inputs: inputs
    });
  });
  return forms;
}

// Get table data
function getTables() {
  const tables = [];
  document.querySelectorAll('table').forEach(table => {
    const rows = [];
    table.querySelectorAll('tr').forEach(row => {
      const cells = [];
      row.querySelectorAll('td, th').forEach(cell => {
        cells.push(cell.textContent.trim());
      });
      if (cells.length > 0) {
        rows.push(cells);
      }
    });
    
    if (rows.length > 0) {
      tables.push({
        rows: rows.slice(0, 10), // Limit to first 10 rows
        caption: table.caption ? table.caption.textContent.trim() : ''
      });
    }
  });
  return tables.slice(0, 5); // Limit to first 5 tables
}

// Custom scraping function that can be configured
function scrapeCustomData(selectors) {
  const customData = {};
  
  if (selectors && typeof selectors === 'object') {
    Object.keys(selectors).forEach(key => {
      const selector = selectors[key];
      const elements = document.querySelectorAll(selector);
      
      if (elements.length === 1) {
        customData[key] = elements[0].textContent.trim();
      } else if (elements.length > 1) {
        customData[key] = Array.from(elements).map(el => el.textContent.trim());
      } else {
        customData[key] = null;
      }
    });
  }
  
  return customData;
}

// Listen for messages from popup/background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrapeData') {
    try {
      const scrapedData = scrapePageData();
      
      // Add custom scraped data if selectors provided
      if (request.customSelectors) {
        scrapedData.customData = scrapeCustomData(request.customSelectors);
      }
      
      sendResponse({
        success: true,
        data: scrapedData
      });
    } catch (error) {
      sendResponse({
        success: false,
        error: error.message
      });
    }
  }
  
  return true; // Keep message channel open for async response
});