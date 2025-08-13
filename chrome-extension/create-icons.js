const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
function createSVGIcon(size) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background circle -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 4}" fill="url(#grad1)" stroke="#fff" stroke-width="4"/>
  
  <!-- Magnifying glass -->
  <circle cx="${size/2 - 8}" cy="${size/2 - 8}" r="${size/6}" fill="none" stroke="#fff" stroke-width="${Math.max(2, size/20)}" stroke-linecap="round"/>
  <line x1="${size/2 + 8}" y1="${size/2 + 8}" x2="${size/2 + 16}" y2="${size/2 + 16}" stroke="#fff" stroke-width="${Math.max(2, size/20)}" stroke-linecap="round"/>
  
  <!-- Data elements -->
  <rect x="${size/4}" y="${size*0.7}" width="${size/12}" height="${size/5}" fill="#fff" rx="2"/>
  <rect x="${size/2.5}" y="${size*0.65}" width="${size/12}" height="${size/4}" fill="#fff" rx="2"/>
  <rect x="${size/1.8}" y="${size*0.6}" width="${size/12}" height="${size/3.5}" fill="#fff" rx="2"/>
  <rect x="${size/1.4}" y="${size*0.7}" width="${size/12}" height="${size/5}" fill="#fff" rx="2"/>
  <rect x="${size/1.2}" y="${size*0.75}" width="${size/12}" height="${size/6}" fill="#fff" rx="2"/>
</svg>`;
}

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir);
}

// Create different sized icons
const sizes = [16, 48, 128];

sizes.forEach(size => {
    const svgContent = createSVGIcon(size);
    const iconPath = path.join(iconsDir, `icon${size}.svg`);
    fs.writeFileSync(iconPath, svgContent);
    console.log(`Created ${iconPath}`);
});

// Create a simple HTML file to display the icons
const iconPreviewHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Extension Icons Preview</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background: #f5f5f5;
        }
        .icon-container {
            display: flex;
            gap: 20px;
            align-items: center;
            margin: 20px 0;
        }
        .icon-info {
            text-align: center;
        }
        .icon-info h3 {
            margin: 0 0 10px 0;
            color: #333;
        }
        .icon-display {
            border: 2px solid #ddd;
            border-radius: 8px;
            padding: 10px;
            background: white;
        }
    </style>
</head>
<body>
    <h1>Chrome Extension Icons Preview</h1>
    <p>These are the SVG icons that will be used for your Chrome extension. You can convert them to PNG format using online tools or image editing software.</p>
    
    <div class="icon-container">
        <div class="icon-info">
            <h3>16x16 (Toolbar)</h3>
            <div class="icon-display">
                <img src="icons/icon16.svg" alt="16x16 icon" width="16" height="16">
            </div>
        </div>
        
        <div class="icon-info">
            <h3>48x48 (Extensions Page)</h3>
            <div class="icon-display">
                <img src="icons/icon48.svg" alt="48x48 icon" width="48" height="48">
            </div>
        </div>
        
        <div class="icon-info">
            <h3>128x128 (Chrome Web Store)</h3>
            <div class="icon-display">
                <img src="icons/icon128.svg" alt="128x128 icon" width="128" height="128">
            </div>
        </div>
    </div>
    
    <h2>Converting to PNG</h2>
    <p>To convert these SVG icons to PNG format (required by Chrome):</p>
    <ol>
        <li>Use online SVG to PNG converters like:
            <ul>
                <li><a href="https://convertio.co/svg-png/" target="_blank">Convertio</a></li>
                <li><a href="https://cloudconvert.com/svg-to-png" target="_blank">CloudConvert</a></li>
                <li><a href="https://www.svgviewer.dev/" target="_blank">SVG Viewer</a></li>
            </ul>
        </li>
        <li>Or use image editing software like GIMP, Photoshop, or Figma</li>
        <li>Ensure the output PNG files have the exact dimensions (16x16, 48x48, 128x128)</li>
        <li>Replace the SVG files with PNG files in the icons directory</li>
    </ol>
    
    <h2>Alternative: Use Online Icon Generators</h2>
    <p>You can also create icons using online tools:</p>
    <ul>
        <li><a href="https://www.favicon-generator.org/" target="_blank">Favicon Generator</a></li>
        <li><a href="https://favicon.io/" target="_blank">Favicon.io</a></li>
        <li><a href="https://realfavicongenerator.net/" target="_blank">RealFaviconGenerator</a></li>
    </ul>
</body>
</html>`;

fs.writeFileSync(path.join(iconsDir, 'preview.html'), iconPreviewHTML);
console.log('Created icons/preview.html - open this file to preview your icons');

console.log('\nIcon creation complete!');
console.log('Note: Chrome requires PNG format icons. Convert the SVG files to PNG or use online icon generators.');