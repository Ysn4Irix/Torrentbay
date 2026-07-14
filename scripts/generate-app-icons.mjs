import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const size = 1024;
const outputDir = join(process.cwd(), 'src', 'assets');

const colors = {
  background: '#08111F',
  primary: '#2DD4BF',
};

const brandPaths = [
  { type: 'circle', cx: 27, cy: 27, r: 16, width: 6 },
  { type: 'line', x1: 39, y1: 39, x2: 53, y2: 53, width: 6 },
  { type: 'line', x1: 43, y1: 19, x2: 59, y2: 19, width: 5 },
  { type: 'line', x1: 47, y1: 30, x2: 62, y2: 30, width: 5 },
  { type: 'line', x1: 50, y1: 41, x2: 61, y2: 41, width: 5 },
  { type: 'line', x1: 31, y1: 54, x2: 36, y2: 61, width: 5 },
  { type: 'line', x1: 36, y1: 61, x2: 41, y2: 54, width: 5 },
];

function parseHexColor(hex, alpha = 255) {
  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
    alpha,
  ];
}

function createImage(fillColor) {
  const pixels = Buffer.alloc(size * size * 4);

  if (fillColor) {
    const [r, g, b, a] = parseHexColor(fillColor);

    for (let index = 0; index < pixels.length; index += 4) {
      pixels[index] = r;
      pixels[index + 1] = g;
      pixels[index + 2] = b;
      pixels[index + 3] = a;
    }
  }

  return pixels;
}

function alphaForStroke(distance, halfWidth) {
  const feather = 1;

  if (distance <= halfWidth - feather) {
    return 1;
  }

  if (distance >= halfWidth + feather) {
    return 0;
  }

  return (halfWidth + feather - distance) / (feather * 2);
}

function distanceToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy;
  const t = Math.max(
    0,
    Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSquared),
  );
  const closestX = x1 + t * dx;
  const closestY = y1 + t * dy;

  return Math.hypot(px - closestX, py - closestY);
}

function blendPixel(pixels, x, y, color, alpha) {
  if (alpha <= 0 || x < 0 || y < 0 || x >= size || y >= size) {
    return;
  }

  const index = (y * size + x) * 4;
  const sourceAlpha = (color[3] / 255) * alpha;
  const destinationAlpha = pixels[index + 3] / 255;
  const outAlpha = sourceAlpha + destinationAlpha * (1 - sourceAlpha);

  if (outAlpha === 0) {
    return;
  }

  pixels[index] = Math.round(
    (color[0] * sourceAlpha +
      pixels[index] * destinationAlpha * (1 - sourceAlpha)) /
      outAlpha,
  );
  pixels[index + 1] = Math.round(
    (color[1] * sourceAlpha +
      pixels[index + 1] * destinationAlpha * (1 - sourceAlpha)) /
      outAlpha,
  );
  pixels[index + 2] = Math.round(
    (color[2] * sourceAlpha +
      pixels[index + 2] * destinationAlpha * (1 - sourceAlpha)) /
      outAlpha,
  );
  pixels[index + 3] = Math.round(outAlpha * 255);
}

function drawBrandMark(pixels) {
  const scale = 11;
  const offset = (size - 72 * scale) / 2;
  const color = parseHexColor(colors.primary);

  for (const path of brandPaths) {
    const strokeWidth = path.width * scale;
    const halfWidth = strokeWidth / 2;
    const padding = halfWidth + 2;

    if (path.type === 'circle') {
      const cx = offset + path.cx * scale;
      const cy = offset + path.cy * scale;
      const radius = path.r * scale;
      const minX = Math.floor(cx - radius - padding);
      const maxX = Math.ceil(cx + radius + padding);
      const minY = Math.floor(cy - radius - padding);
      const maxY = Math.ceil(cy + radius + padding);

      for (let y = minY; y <= maxY; y += 1) {
        for (let x = minX; x <= maxX; x += 1) {
          const distance = Math.abs(
            Math.hypot(x + 0.5 - cx, y + 0.5 - cy) - radius,
          );
          blendPixel(pixels, x, y, color, alphaForStroke(distance, halfWidth));
        }
      }

      continue;
    }

    const x1 = offset + path.x1 * scale;
    const y1 = offset + path.y1 * scale;
    const x2 = offset + path.x2 * scale;
    const y2 = offset + path.y2 * scale;
    const minX = Math.floor(Math.min(x1, x2) - padding);
    const maxX = Math.ceil(Math.max(x1, x2) + padding);
    const minY = Math.floor(Math.min(y1, y2) - padding);
    const maxY = Math.ceil(Math.max(y1, y2) + padding);

    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const distance = distanceToSegment(x + 0.5, y + 0.5, x1, y1, x2, y2);
        blendPixel(pixels, x, y, color, alphaForStroke(distance, halfWidth));
      }
    }
  }
}

function createPngChunk(type, data = Buffer.alloc(0)) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);

  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buffer) {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc ^= byte;

    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function encodePng(pixels) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;

  const scanlines = Buffer.alloc((size * 4 + 1) * size);

  for (let y = 0; y < size; y += 1) {
    const scanlineOffset = y * (size * 4 + 1);
    scanlines[scanlineOffset] = 0;
    pixels.copy(
      scanlines,
      scanlineOffset + 1,
      y * size * 4,
      (y + 1) * size * 4,
    );
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    createPngChunk('IHDR', header),
    createPngChunk('IDAT', deflateSync(scanlines, { level: 9 })),
    createPngChunk('IEND'),
  ]);
}

function writeIcon(fileName, backgroundColor) {
  const pixels = createImage(backgroundColor);
  drawBrandMark(pixels);
  const filePath = join(outputDir, fileName);

  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, encodePng(pixels));
}

writeIcon('icon.png', colors.background);
writeIcon('adaptive-icon.png');
