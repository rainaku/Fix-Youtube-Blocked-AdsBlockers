const fs = require('fs');
const { createCanvas } = require('canvas');

const sizes = [16, 48, 128];

function drawIcon(ctx, size) {
    const scale = size / 128;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Background - YouTube red rounded square
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.roundRect(8 * scale, 8 * scale, 100 * scale, 100 * scale, 16 * scale);
    ctx.fill();

    // Play triangle
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(45 * scale, 35 * scale);
    ctx.lineTo(45 * scale, 85 * scale);
    ctx.lineTo(85 * scale, 60 * scale);
    ctx.closePath();
    ctx.fill();

    // Green checkmark circle background
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(100 * scale, 100 * scale, 28 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Green circle
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(100 * scale, 100 * scale, 24 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Checkmark
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 5 * scale;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(88 * scale, 100 * scale);
    ctx.lineTo(96 * scale, 108 * scale);
    ctx.lineTo(112 * scale, 92 * scale);
    ctx.stroke();
}

sizes.forEach(size => {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    drawIcon(ctx, size);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`icons/icon${size}.png`, buffer);
    console.log(`Generated icon${size}.png`);
});

console.log('All icons generated!');
