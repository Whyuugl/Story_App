const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

function generateBadge() {
  const size = 72;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#f44336';
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
  ctx.fill();

  // Bell icon
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(size/2, size/4);
  ctx.lineTo(size/2 + size/4, size/2);
  ctx.lineTo(size/2 - size/4, size/2);
  ctx.closePath();
  ctx.fill();

  // Save the badge
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, 'badge-72x72.png'), buffer);
  console.log('Generated badge-72x72.png');
}

generateBadge(); 