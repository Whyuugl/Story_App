const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#2196f3';
  ctx.fillRect(0, 0, size, size);

  // Book icon
  ctx.fillStyle = '#ffffff';
  const bookWidth = size * 0.6;
  const bookHeight = size * 0.8;
  const bookX = (size - bookWidth) / 2;
  const bookY = (size - bookHeight) / 2;
  
  // Book cover
  ctx.fillRect(bookX, bookY, bookWidth, bookHeight);
  
  // Book spine
  ctx.fillStyle = '#1976d2';
  ctx.fillRect(bookX + bookWidth * 0.1, bookY, bookWidth * 0.1, bookHeight);

  // Save the icon
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, `icon-${size}x${size}.png`), buffer);
}

sizes.forEach(size => {
  generateIcon(size);
  console.log(`Generated icon-${size}x${size}.png`);
}); 