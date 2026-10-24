import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, drawFn) {
  // RGBA buffer: (width * 4 + 1) * height bytes (1 filter byte per row)
  const rowLength = width * 4 + 1;
  const rawData = Buffer.alloc(rowLength * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // Filter type 0: None

    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawFn(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);

    const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(typeAndData), 0);

    return Buffer.concat([len, typeAndData, crc]);
  }

  // Standard CRC32 implementation
  function crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      let byte = buf[i];
      for (let j = 0; j < 8; j++) {
        if ((crc ^ byte) & 1) {
          crc = (crc >>> 1) ^ 0xedb88320;
        } else {
          crc = crc >>> 1;
        }
        byte = byte >>> 1;
      }
    }
    return (crc ^ -1) >>> 0;
  }

  // IHDR chunk: 13 bytes
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA (6)
  ihdr[10] = 0; // compression method
  ihdr[11] = 0; // filter method
  ihdr[12] = 0; // interlace method

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Icon drawer: Brand Dark background + NutriPulse Zap symbol
function drawNutriPulseIcon(isMaskable) {
  return (x, y, w, h) => {
    const nx = x / w; // 0 to 1
    const ny = y / h; // 0 to 1

    // Background: Dark gradient with slight radial glow
    const distFromCenter = Math.hypot(nx - 0.5, ny - 0.5);
    let r = Math.floor(9 + (1 - Math.min(1, distFromCenter * 1.5)) * 15);
    let g = Math.floor(13 + (1 - Math.min(1, distFromCenter * 1.5)) * 20);
    let b = Math.floor(22 + (1 - Math.min(1, distFromCenter * 1.5)) * 30);
    let a = 255;

    // Outer rounded square for non-maskable icons
    if (!isMaskable) {
      const cornerR = 0.22;
      const dx = Math.max(Math.abs(nx - 0.5) - (0.48 - cornerR), 0);
      const dy = Math.max(Math.abs(ny - 0.5) - (0.48 - cornerR), 0);
      if (Math.hypot(dx, dy) > cornerR) {
        return [0, 0, 0, 0]; // Transparent outside rounded corner
      }
    }

    // Centered Badge Circle
    // For maskable, keep within 0.70 safe zone; for standard, 0.76
    const badgeScale = isMaskable ? 0.65 : 0.72;
    const badgeDist = distFromCenter / (badgeScale / 2);

    if (badgeDist <= 1.0) {
      // Orange radial gradient for the badge circle
      const t = Math.max(0, Math.min(1, (ny - (0.5 - badgeScale / 2)) / badgeScale));
      // Gradient from #ff8c42 (top) to #ff5708 (bottom)
      const br = Math.floor(255 - t * 15);
      const bg = Math.floor(140 - t * 53);
      const bb = Math.floor(66 - t * 58);
      r = br;
      g = bg;
      b = bb;

      // Glow border on badge
      if (badgeDist > 0.94) {
        r = 255;
        g = 210;
        b = 180;
      }
    }

    // Inside the badge: Draw Lightning Bolt / Zap shape
    // Normalize coordinates inside the central badge: cx, cy in [-1, 1]
    const cx = (nx - 0.5) / (badgeScale * 0.45);
    const cy = (ny - 0.5) / (badgeScale * 0.45);

    // Zap polygon check
    // Top segment: from (0.1, -0.9) to (-0.6, 0.05) to (-0.05, 0.05)
    // Bottom segment: from (-0.1, 0.9) to (0.6, -0.05) to (0.05, -0.05)
    // Simpler lightning representation:
    // Segment 1 (top): x in [-0.5, 0.3], y in [-0.85, 0.05]
    // Line: x between (-0.3 - 0.2*cy) and (0.2 - 0.3*cy)
    const inTopHalf = cy >= -0.75 && cy <= 0.05 && cx >= (-0.35 - 0.25 * cy) && cx <= (0.25 - 0.4 * cy);
    const inBotHalf = cy >= -0.05 && cy <= 0.75 && cx >= (-0.25 - 0.4 * cy) && cx <= (0.35 - 0.25 * cy);

    if (inTopHalf || inBotHalf) {
      // White lightning core
      r = 255;
      g = 255;
      b = 255;
    }

    return [r, g, b, a];
  };
}

// Generate files
const sizes = [
  { name: 'pwa-192x192.png', size: 192, maskable: false },
  { name: 'pwa-512x512.png', size: 512, maskable: false },
  { name: 'pwa-maskable-512x512.png', size: 512, maskable: true },
  { name: 'apple-touch-icon.png', size: 180, maskable: false },
  { name: 'favicon.png', size: 64, maskable: false },
];

if (!fs.existsSync('./public')) {
  fs.mkdirSync('./public', { recursive: true });
}

for (const { name, size, maskable } of sizes) {
  console.log(`Generating public/${name}...`);
  const buf = createPNG(size, size, drawNutriPulseIcon(maskable));
  fs.writeFileSync(`./public/${name}`, buf);
}

// Also create icon.svg
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#181f2f"/>
      <stop offset="100%" stop-color="#090d16"/>
    </linearGradient>
    <linearGradient id="flameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff8c42"/>
      <stop offset="100%" stop-color="#ff5708"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)"/>
  <circle cx="256" cy="256" r="170" fill="url(#flameGrad)" filter="url(#glow)"/>
  <path d="M280 130 L180 270 L250 270 L232 382 L332 242 L262 242 Z" fill="#ffffff" stroke="#ffffff" stroke-width="8" stroke-linejoin="round"/>
</svg>`;
fs.writeFileSync('./public/icon.svg', svg);
fs.writeFileSync('./public/favicon.svg', svg);

console.log('All icons generated successfully!');
