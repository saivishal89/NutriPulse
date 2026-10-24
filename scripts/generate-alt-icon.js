import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, drawFn) {
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

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Alternative Icon Style:
// "Neon Pulse Shield" - High contrast deep carbon hexagon with an energetic neon pulse heartbeat cutting through an athletic flame
function drawAltIcon(x, y, w, h) {
  const nx = (x / w) * 2 - 1; // -1 to 1
  const ny = (y / h) * 2 - 1; // -1 to 1
  const dist = Math.hypot(nx, ny);

  // Rounded squircle canvas boundary (radius 0.88)
  const squircle = Math.pow(Math.abs(nx), 4) + Math.pow(Math.abs(ny), 4);
  if (squircle > 0.82) {
    return [0, 0, 0, 0];
  }

  // Base background: Deep Carbon Onyx with radial glow from center
  const glow = Math.max(0, 1 - dist * 1.1);
  let r = Math.floor(10 + glow * 25);
  let g = Math.floor(14 + glow * 15);
  let b = Math.floor(24 + glow * 40);
  let a = 255;

  // Thin outer rim highlight on the squircle edge
  if (squircle > 0.76 && squircle <= 0.82) {
    const rimT = (squircle - 0.76) / 0.06;
    r = Math.floor(r + rimT * (255 - r) * 0.4);
    g = Math.floor(g + rimT * (140 - g) * 0.4);
    b = Math.floor(b + rimT * (80 - b) * 0.4);
  }

  // Athletic Octagon / Diamond Core Shield (rotated 45deg: abs(nx)+abs(ny) < radius)
  const diamondDist = Math.abs(nx) + Math.abs(ny);
  const inDiamond = diamondDist <= 0.74;

  if (inDiamond) {
    // Rich gradient from fiery coral orange at top (#ff7a33) to electric crimson (#e02a00) at bottom
    const gradPos = (ny + 0.74) / 1.48; // 0 to 1
    const cr = Math.floor(255 - gradPos * 30);
    const cg = Math.floor(122 - gradPos * 80);
    const cb = Math.floor(51 - gradPos * 51);
    r = cr;
    g = cg;
    b = cb;

    // Diamond border glow
    if (diamondDist >= 0.70) {
      r = 255;
      g = 220;
      b = 180;
    }
  }

  // Subtle Cyan/Teal metabolic accent aura on the top-left shoulder
  const cyanAuraDist = Math.hypot(nx + 0.4, ny + 0.4);
  if (cyanAuraDist < 0.35 && inDiamond) {
    const intensity = (1 - cyanAuraDist / 0.35) * 0.35;
    r = Math.floor(r * (1 - intensity) + 76 * intensity);
    g = Math.floor(g * (1 - intensity) + 215 * intensity);
    b = Math.floor(b * (1 - intensity) + 246 * intensity);
  }

  // Central Pure White Athletic Pulse Heartbeat + Lightning Bolt
  // Heartbeat pulse wave line with thickness:
  // Points along X from -0.45 to 0.45:
  // Baseline at y = 0.05
  // Left flat: -0.45 to -0.25 (y = 0.05)
  // Dip down: -0.25 to -0.15 (y down to 0.18)
  // Spike up: -0.15 to 0.05 (y up to -0.42)
  // Lightning drop: 0.05 to 0.18 (y down to 0.38)
  // Recover to flat: 0.18 to 0.30 (y to 0.05)
  // Right flat: 0.30 to 0.45 (y = 0.05)

  let pulseY = 0.05;
  let activePulse = false;

  if (nx >= -0.45 && nx <= 0.45) {
    if (nx < -0.22) {
      pulseY = 0.05;
    } else if (nx < -0.14) {
      const t = (nx - (-0.22)) / 0.08;
      pulseY = 0.05 + t * 0.15; // dip
    } else if (nx < 0.04) {
      const t = (nx - (-0.14)) / 0.18;
      pulseY = 0.20 - t * 0.62; // sharp peak up to -0.42
    } else if (nx < 0.16) {
      const t = (nx - 0.04) / 0.12;
      pulseY = -0.42 + t * 0.76; // drop to 0.34
    } else if (nx < 0.26) {
      const t = (nx - 0.16) / 0.10;
      pulseY = 0.34 - t * 0.29; // recover
    } else {
      pulseY = 0.05;
    }

    // Distance to pulse curve
    const yDist = Math.abs(ny - pulseY);
    if (yDist <= 0.055) {
      activePulse = true;
      // Anti-aliased white pulse
      const alpha = Math.max(0, 1 - yDist / 0.055);
      r = Math.floor(r * (1 - alpha) + 255 * alpha);
      g = Math.floor(g * (1 - alpha) + 255 * alpha);
      b = Math.floor(b * (1 - alpha) + 255 * alpha);
    }
  }

  // Two athletic accent dots for calibration (one cyan top-right, one white bottom-left)
  const dot1Dist = Math.hypot(nx - 0.26, ny + 0.30);
  if (dot1Dist <= 0.045 && inDiamond) {
    r = 255;
    g = 255;
    b = 255;
  }

  return [r, g, b, a];
}

const size = 512;
console.log('Generating 512x512 alternative icon...');
const pngBuf = createPNG(size, size, drawAltIcon);
fs.writeFileSync('./public/app-icon-alt.png', pngBuf);

// Also generate high-fidelity vector SVG for instant crystal-clear rendering
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Outer Dark Gradient -->
    <radialGradient id="bgRadial" cx="50%" cy="50%" r="65%">
      <stop offset="0%" stop-color="#192033"/>
      <stop offset="60%" stop-color="#0e1320"/>
      <stop offset="100%" stop-color="#070a12"/>
    </radialGradient>

    <!-- Fiery Blaze Core Shield -->
    <linearGradient id="shieldGrad" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#ff8c42"/>
      <stop offset="45%" stop-color="#ff5708"/>
      <stop offset="100%" stop-color="#d93b00"/>
    </linearGradient>

    <!-- Metabolic Cyan Pulse Accents -->
    <linearGradient id="cyanAccent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4cd7f6"/>
      <stop offset="100%" stop-color="#00a8cc"/>
    </linearGradient>

    <!-- Shadow and Glow Filters -->
    <filter id="shieldShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#ff5708" flood-opacity="0.45"/>
    </filter>

    <filter id="boltGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Squircle Base Frame -->
  <rect x="16" y="16" width="480" height="480" rx="110" fill="url(#bgRadial)" stroke="#ffffff" stroke-width="2" stroke-opacity="0.12"/>

  <!-- Subtle Concentric Athletic Caliper Circles -->
  <circle cx="256" cy="256" r="210" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.05" stroke-dasharray="6 8"/>
  <circle cx="256" cy="256" r="185" fill="none" stroke="#ff5708" stroke-width="1.5" stroke-opacity="0.15"/>

  <!-- Dynamic Diamond Core Shield with Shadow -->
  <g filter="url(#shieldShadow)">
    <path d="M 256 76 L 436 256 L 256 436 L 76 256 Z" 
          fill="url(#shieldGrad)" 
          stroke="#ffeedd" 
          stroke-width="5" 
          stroke-linejoin="round"/>
  </g>

  <!-- Cyan High-Performance Metabolic Tag -->
  <circle cx="360" cy="152" r="12" fill="url(#cyanAccent)" filter="url(#boltGlow)"/>
  <circle cx="152" cy="360" r="8" fill="#ffffff" opacity="0.8"/>

  <!-- High-Energy ECG Pulse & Lightning Bolt Monogram (White Core) -->
  <g filter="url(#boltGlow)">
    <path d="M 120 256 
             L 190 256 
             L 215 300 
             L 256 128 
             L 292 368 
             L 325 256 
             L 392 256" 
          fill="none" 
          stroke="#ffffff" 
          stroke-width="22" 
          stroke-linecap="round" 
          stroke-linejoin="round"/>
  </g>

  <!-- Sharp Inner Lightning Cutout Notch -->
  <polygon points="256,150 268,230 248,230" fill="#ffffff" opacity="0.9"/>
</svg>`;

fs.writeFileSync('./public/app-icon-alt.svg', svgContent);

console.log('Alternative 512x512 icon generated successfully!');
