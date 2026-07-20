import type { RgbaImage, ResolvedPixelAvatarOptions } from './types';

function idx(x: number, y: number, w: number): number {
  return (y * w + x) * 4;
}

function luminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function posterize(value: number, levels: number): number {
  if (levels <= 2) return value < 128 ? 0 : 255;
  const step = 255 / (levels - 1);
  return Math.round(Math.min(255, Math.max(0, value)) / step) * step;
}

export function centerCropSquare(src: RgbaImage): RgbaImage {
  const side = Math.min(src.width, src.height);
  const ox = Math.floor((src.width - side) / 2);
  const oy = Math.floor((src.height - side) / 2);
  return cropRect(src, ox, oy, side);
}

function cropRect(src: RgbaImage, ox: number, oy: number, side: number): RgbaImage {
  const data = new Uint8Array(side * side * 4);
  for (let y = 0; y < side; y++) {
    for (let x = 0; x < side; x++) {
      const si = idx(ox + x, oy + y, src.width);
      const di = idx(x, y, side);
      data[di] = src.data[si]!;
      data[di + 1] = src.data[si + 1]!;
      data[di + 2] = src.data[si + 2]!;
      data[di + 3] = src.data[si + 3]!;
    }
  }
  return { width: side, height: side, data };
}

/**
 * Prefer a square around skin-like pixels (faces) so kitchen cabinets
 * don't dominate Sobel. Falls back to center crop.
 */
export function subjectCropSquare(src: RgbaImage): RgbaImage {
  let minX = src.width;
  let minY = src.height;
  let maxX = 0;
  let maxY = 0;
  let hits = 0;

  for (let y = 0; y < src.height; y++) {
    for (let x = 0; x < src.width; x++) {
      const i = idx(x, y, src.width);
      const r = src.data[i]!;
      const g = src.data[i + 1]!;
      const b = src.data[i + 2]!;
      // Classic cheap skin gate (works for many phone portraits)
      const skin =
        r > 95 &&
        g > 40 &&
        b > 20 &&
        r > g &&
        r > b &&
        r - g > 15 &&
        Math.abs(r - g) > 15;
      if (!skin) continue;
      hits++;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  // Need a meaningful skin region
  if (hits < Math.max(80, (src.width * src.height) / 200)) {
    return centerCropSquare(src);
  }

  const bw = maxX - minX + 1;
  const bh = maxY - minY + 1;
  const pad = Math.floor(Math.max(bw, bh) * 0.22);
  let x0 = Math.max(0, minX - pad);
  let y0 = Math.max(0, minY - pad);
  let x1 = Math.min(src.width - 1, maxX + pad);
  let y1 = Math.min(src.height - 1, maxY + pad);
  let side = Math.max(x1 - x0 + 1, y1 - y0 + 1);
  side = Math.min(side, src.width, src.height);

  // Center the square on the skin bbox
  let cx = Math.floor((minX + maxX) / 2);
  let cy = Math.floor((minY + maxY) / 2);
  let ox = Math.max(0, Math.min(src.width - side, cx - Math.floor(side / 2)));
  let oy = Math.max(0, Math.min(src.height - side, cy - Math.floor(side / 2)));

  return cropRect(src, ox, oy, side);
}

export function downsampleBox(src: RgbaImage, size: number): RgbaImage {
  if (src.width === size && src.height === size) {
    return { width: size, height: size, data: new Uint8Array(src.data) };
  }
  const data = new Uint8Array(size * size * 4);
  const scale = src.width / size;
  for (let y = 0; y < size; y++) {
    const y0 = Math.floor(y * scale);
    const y1 = Math.min(src.height, Math.max(y0 + 1, Math.floor((y + 1) * scale)));
    for (let x = 0; x < size; x++) {
      const x0 = Math.floor(x * scale);
      const x1 = Math.min(src.width, Math.max(x0 + 1, Math.floor((x + 1) * scale)));
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let n = 0;
      for (let yy = y0; yy < y1; yy++) {
        for (let xx = x0; xx < x1; xx++) {
          const i = idx(xx, yy, src.width);
          r += src.data[i]!;
          g += src.data[i + 1]!;
          b += src.data[i + 2]!;
          a += src.data[i + 3]!;
          n++;
        }
      }
      const di = idx(x, y, size);
      data[di] = Math.round(r / n);
      data[di + 1] = Math.round(g / n);
      data[di + 2] = Math.round(b / n);
      data[di + 3] = Math.round(a / n);
    }
  }
  return { width: size, height: size, data };
}

export function upscaleNearest(src: RgbaImage, size: number): RgbaImage {
  if (src.width === size && src.height === size) {
    return { width: size, height: size, data: new Uint8Array(src.data) };
  }
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    const sy = Math.min(src.height - 1, Math.floor((y * src.height) / size));
    for (let x = 0; x < size; x++) {
      const sx = Math.min(src.width - 1, Math.floor((x * src.width) / size));
      const si = idx(sx, sy, src.width);
      const di = idx(x, y, size);
      data[di] = src.data[si]!;
      data[di + 1] = src.data[si + 1]!;
      data[di + 2] = src.data[si + 2]!;
      data[di + 3] = src.data[si + 3]!;
    }
  }
  return { width: size, height: size, data };
}

function toGray(work: RgbaImage): Float32Array {
  const gray = new Float32Array(work.width * work.height);
  for (let i = 0, p = 0; i < gray.length; i++, p += 4) {
    gray[i] = luminance(work.data[p]!, work.data[p + 1]!, work.data[p + 2]!);
  }
  return gray;
}

function applyContrast(gray: Float32Array, contrast: number): void {
  for (let i = 0; i < gray.length; i++) {
    gray[i] = Math.min(255, Math.max(0, (gray[i]! - 128) * contrast + 128));
  }
}

function sobelMagnitude(gray: Float32Array, w: number, h: number): Float32Array {
  const out = new Float32Array(w * h);
  let max = 1e-6;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const gx =
        -gray[(y - 1) * w + (x - 1)]! +
        gray[(y - 1) * w + (x + 1)]! +
        -2 * gray[y * w + (x - 1)]! +
        2 * gray[y * w + (x + 1)]! +
        -gray[(y + 1) * w + (x - 1)]! +
        gray[(y + 1) * w + (x + 1)]!;
      const gy =
        -gray[(y - 1) * w + (x - 1)]! -
        2 * gray[(y - 1) * w + x]! -
        gray[(y - 1) * w + (x + 1)]! +
        gray[(y + 1) * w + (x - 1)]! +
        2 * gray[(y + 1) * w + x]! +
        gray[(y + 1) * w + (x + 1)]!;
      const mag = Math.hypot(gx, gy);
      out[y * w + x] = mag;
      if (mag > max) max = mag;
    }
  }
  for (let i = 0; i < out.length; i++) out[i] = out[i]! / max;
  return out;
}

function thresholdByFraction(edges: Float32Array, fraction: number): Uint8Array {
  const vals: number[] = [];
  for (let i = 0; i < edges.length; i++) {
    if (edges[i]! > 1e-4) vals.push(edges[i]!);
  }
  const out = new Uint8Array(edges.length);
  if (vals.length === 0) return out;
  vals.sort((a, b) => a - b);
  const keep = Math.max(12, Math.floor(vals.length * fraction));
  const thr = vals[Math.max(0, vals.length - keep)]!;
  for (let i = 0; i < edges.length; i++) {
    out[i] = edges[i]! >= thr ? 1 : 0;
  }
  return out;
}

function despeckle(mask: Uint8Array, w: number, h: number): Uint8Array {
  const out = new Uint8Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      if (!mask[i]) continue;
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          if (mask[(y + dy) * w + (x + dx)]) n++;
        }
      }
      out[i] = n >= 1 ? 1 : 0;
    }
  }
  return out;
}

/**
 * Drop long axis-aligned runs (cabinet panel lines) while keeping compact face ink.
 */
/**
 * Clear long axis-aligned runs that touch the image border (cabinet rails).
 * Interior face/hair outlines are kept.
 */
function suppressBorderRuns(mask: Uint8Array, w: number, h: number): Uint8Array {
  const out = new Uint8Array(mask);
  const minRun = Math.max(6, Math.floor(Math.min(w, h) * 0.25));

  for (let y = 0; y < h; y++) {
    let x = 0;
    while (x < w) {
      if (!mask[y * w + x]) {
        x++;
        continue;
      }
      let x2 = x;
      while (x2 < w && mask[y * w + x2]) x2++;
      const run = x2 - x;
      const touchesBorder = x === 0 || x2 === w || y < 2 || y >= h - 2;
      if (run >= minRun && touchesBorder) {
        for (let xx = x; xx < x2; xx++) out[y * w + xx] = 0;
      }
      x = x2;
    }
  }

  for (let x = 0; x < w; x++) {
    let y = 0;
    while (y < h) {
      if (!out[y * w + x]) {
        y++;
        continue;
      }
      let y2 = y;
      while (y2 < h && out[y2 * w + x]) y2++;
      const run = y2 - y;
      const touchesBorder = y === 0 || y2 === h || x < 2 || x >= w - 2;
      if (run >= minRun && touchesBorder) {
        for (let yy = y; yy < y2; yy++) out[yy * w + x] = 0;
      }
      y = y2;
    }
  }

  return out;
}

function inkColor(r: number, g: number, b: number, levels: number): [number, number, number] {
  const mix = 0.18;
  const ir = posterize(r * mix, levels);
  const ig = posterize(g * mix, levels);
  const ib = posterize(b * mix, levels);
  if (luminance(ir, ig, ib) > 55) return [0, 0, 0];
  return [ir, ig, ib];
}

/**
 * Reference pipeline: downsample to pixel grid FIRST, then Sobel on that grid.
 * Produces chunky GameBoy-style contours (not a colorful photo mush).
 */
export function processPixelContourBuffer(
  source: RgbaImage,
  options: ResolvedPixelAvatarOptions,
): RgbaImage {
  const square = subjectCropSquare(source);
  const grid = options.pixelGrid;
  // Slightly larger work grid for stabler Sobel, then nearest to pixelGrid
  const workSize = Math.min(80, Math.max(grid, grid + 12));
  const work = downsampleBox(square, workSize);

  const gray = toGray(work);
  applyContrast(gray, options.contrast);

  const edges = sobelMagnitude(gray, workSize, workSize);
  let binary = thresholdByFraction(edges, options.edgeKeepFraction);
  binary = despeckle(binary, workSize, workSize);
  // Strip only runs glued to the frame edge (cabinets), not face outlines
  binary = suppressBorderRuns(binary, workSize, workSize);
  binary = despeckle(binary, workSize, workSize);

  // Snap workSize → pixelGrid via OR-pooling
  const cell = workSize / grid;
  const out = new Uint8Array(grid * grid * 4);
  const bg = options.whiteBackground;

  for (let gy = 0; gy < grid; gy++) {
    for (let gx = 0; gx < grid; gx++) {
      const x0 = Math.floor(gx * cell);
      const y0 = Math.floor(gy * cell);
      const x1 = Math.min(workSize, Math.floor((gx + 1) * cell));
      const y1 = Math.min(workSize, Math.floor((gy + 1) * cell));
      let hits = 0;
      let rSum = 0;
      let gSum = 0;
      let bSum = 0;
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          if (!binary[y * workSize + x]) continue;
          hits++;
          const pi = idx(x, y, workSize);
          rSum += work.data[pi]!;
          gSum += work.data[pi + 1]!;
          bSum += work.data[pi + 2]!;
        }
      }

      const di = idx(gx, gy, grid);
      if (hits < 1) {
        if (bg) {
          out[di] = 255;
          out[di + 1] = 255;
          out[di + 2] = 255;
          out[di + 3] = 255;
        } else {
          out[di + 3] = 0;
        }
        continue;
      }

      if (options.colorMode === 'mono') {
        out[di] = 0;
        out[di + 1] = 0;
        out[di + 2] = 0;
        out[di + 3] = 255;
        continue;
      }

      const [r, g, b] = inkColor(rSum / hits, gSum / hits, bSum / hits, options.posterizeLevels);
      out[di] = r;
      out[di + 1] = g;
      out[di + 2] = b;
      out[di + 3] = 255;
    }
  }

  return upscaleNearest({ width: grid, height: grid, data: out }, options.outputSize);
}
