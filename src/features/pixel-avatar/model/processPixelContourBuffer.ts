import type { RgbaImage, ResolvedPixelAvatarOptions } from './types';

/** Working resolution for Sobel — high enough for clean face lines, then grid-snap. */
const WORK_SIZE = 144;

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

/** Center-crop to square. */
export function centerCropSquare(src: RgbaImage): RgbaImage {
  const side = Math.min(src.width, src.height);
  const ox = Math.floor((src.width - side) / 2);
  const oy = Math.floor((src.height - side) / 2);
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

/** Area (box) downsample. */
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
      if (n === 0) {
        data[di + 3] = 0;
        continue;
      }
      data[di] = Math.round(r / n);
      data[di + 1] = Math.round(g / n);
      data[di + 2] = Math.round(b / n);
      data[di + 3] = Math.round(a / n);
    }
  }

  return { width: size, height: size, data };
}

/** Nearest-neighbor upscale — crisp pixel blocks. */
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

/** 3×3 box blur — kills photo noise that becomes “каша” after Sobel. */
function blurGray3(gray: Float32Array, w: number, h: number): Float32Array {
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          const yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
          sum += gray[yy * w + xx]!;
          n++;
        }
      }
      out[y * w + x] = sum / n;
    }
  }
  return out;
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

  for (let i = 0; i < out.length; i++) {
    out[i] = out[i]! / max;
  }
  return out;
}

/** Keep only local maxima along gradient (thins mushy thick edges). */
function nonMaxSuppress(edges: Float32Array, gray: Float32Array, w: number, h: number): Float32Array {
  const out = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const mag = edges[i]!;
      if (mag <= 0) continue;

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

      const angle = (Math.atan2(gy, gx) * 180) / Math.PI;
      const a = angle < 0 ? angle + 180 : angle;

      let n1: number;
      let n2: number;
      if ((a >= 0 && a < 22.5) || (a >= 157.5 && a <= 180)) {
        n1 = edges[y * w + (x - 1)]!;
        n2 = edges[y * w + (x + 1)]!;
      } else if (a >= 22.5 && a < 67.5) {
        n1 = edges[(y - 1) * w + (x + 1)]!;
        n2 = edges[(y + 1) * w + (x - 1)]!;
      } else if (a >= 67.5 && a < 112.5) {
        n1 = edges[(y - 1) * w + x]!;
        n2 = edges[(y + 1) * w + x]!;
      } else {
        n1 = edges[(y - 1) * w + (x - 1)]!;
        n2 = edges[(y + 1) * w + (x + 1)]!;
      }

      out[i] = mag >= n1 && mag >= n2 ? mag : 0;
    }
  }
  return out;
}

function thresholdEdges(edges: Float32Array, threshold: number): Uint8Array {
  const out = new Uint8Array(edges.length);
  for (let i = 0; i < edges.length; i++) {
    out[i] = edges[i]! >= threshold ? 1 : 0;
  }
  return out;
}

/** Drop isolated pixels (noise speckles). */
function despeckle(mask: Uint8Array, w: number, h: number): Uint8Array {
  const out = new Uint8Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      if (!mask[i]) continue;
      let neighbors = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          if (mask[(y + dy) * w + (x + dx)]) neighbors++;
        }
      }
      // Keep if connected; also keep strong-looking 2-neighbor diagonals lightly
      out[i] = neighbors >= 1 ? 1 : 0;
    }
  }
  return out;
}

function dilateBinary(mask: Uint8Array, w: number, h: number, iterations: number): Uint8Array {
  let cur = mask;
  for (let it = 0; it < iterations; it++) {
    const next = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let on = 0;
        for (let dy = -1; dy <= 1 && !on; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx;
            const yy = y + dy;
            if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
            if (cur[yy * w + xx]) {
              on = 1;
              break;
            }
          }
        }
        next[y * w + x] = on;
      }
    }
    cur = next;
  }
  return cur;
}

/**
 * Snap high-res binary edges onto a coarse pixel grid.
 * Cell lights only if enough edge mass — avoids speckled mush.
 */
function gridSnapEdges(
  mask: Uint8Array,
  work: RgbaImage,
  grid: number,
  density: number,
): { mask: Uint8Array; colors: Uint8Array } {
  const w = work.width;
  const cell = w / grid;
  const outMask = new Uint8Array(grid * grid);
  const colors = new Uint8Array(grid * grid * 4);

  for (let gy = 0; gy < grid; gy++) {
    for (let gx = 0; gx < grid; gx++) {
      const x0 = Math.floor(gx * cell);
      const y0 = Math.floor(gy * cell);
      const x1 = Math.min(w, Math.floor((gx + 1) * cell));
      const y1 = Math.min(w, Math.floor((gy + 1) * cell));
      const area = Math.max(1, (x1 - x0) * (y1 - y0));

      let hits = 0;
      let rSum = 0;
      let gSum = 0;
      let bSum = 0;
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          if (!mask[y * w + x]) continue;
          hits++;
          const pi = idx(x, y, w);
          rSum += work.data[pi]!;
          gSum += work.data[pi + 1]!;
          bSum += work.data[pi + 2]!;
        }
      }

      const gi = gy * grid + gx;
      if (hits / area < density) {
        continue;
      }

      outMask[gi] = 1;
      const ci = gi * 4;
      if (hits > 0) {
        colors[ci] = Math.round(rSum / hits);
        colors[ci + 1] = Math.round(gSum / hits);
        colors[ci + 2] = Math.round(bSum / hits);
      } else {
        const cx = Math.min(w - 1, Math.floor((x0 + x1) / 2));
        const cy = Math.min(w - 1, Math.floor((y0 + y1) / 2));
        const pi = idx(cx, cy, w);
        colors[ci] = work.data[pi]!;
        colors[ci + 1] = work.data[pi + 1]!;
        colors[ci + 2] = work.data[pi + 2]!;
      }
      colors[ci + 3] = 255;
    }
  }

  return { mask: outMask, colors };
}

/** Dark ink-like contour color from local sample (emoji-readable, not neon mush). */
function inkColor(r: number, g: number, b: number, levels: number): [number, number, number] {
  // Pull strongly toward black while keeping a hint of hue
  const mix = 0.22;
  const ir = posterize(r * mix, levels);
  const ig = posterize(g * mix, levels);
  const ib = posterize(b * mix, levels);
  // Ensure visible ink (not near-white)
  const lum = luminance(ir, ig, ib);
  if (lum > 70) {
    return [0, 0, 0];
  }
  return [ir, ig, ib];
}

/**
 * Build pixel-contour avatar RGBA (transparent outside contours).
 * Pipeline mirrors the reference: detect lines → thin → snap to coarse grid → ink.
 */
export function processPixelContourBuffer(
  source: RgbaImage,
  options: ResolvedPixelAvatarOptions,
): RgbaImage {
  const square = centerCropSquare(source);
  const work = downsampleBox(square, WORK_SIZE);

  let gray = toGray(work);
  gray = blurGray3(gray, WORK_SIZE, WORK_SIZE);
  applyContrast(gray, options.contrast);

  const rawEdges = sobelMagnitude(gray, WORK_SIZE, WORK_SIZE);
  const thinEdges = nonMaxSuppress(rawEdges, gray, WORK_SIZE, WORK_SIZE);
  let binary = thresholdEdges(thinEdges, options.edgeThreshold);
  binary = despeckle(binary, WORK_SIZE, WORK_SIZE);

  const grid = options.pixelGrid;
  let snapped = gridSnapEdges(binary, work, grid, options.edgeDensity);

  if (options.edgeDilate > 0) {
    snapped = {
      mask: dilateBinary(snapped.mask, grid, grid, options.edgeDilate),
      colors: snapped.colors,
    };
    // Fill colors for newly dilated cells from neighbors / work center
    for (let gy = 0; gy < grid; gy++) {
      for (let gx = 0; gx < grid; gx++) {
        const gi = gy * grid + gx;
        if (!snapped.mask[gi] || snapped.colors[gi * 4 + 3]) continue;
        const cx = Math.min(WORK_SIZE - 1, Math.floor(((gx + 0.5) * WORK_SIZE) / grid));
        const cy = Math.min(WORK_SIZE - 1, Math.floor(((gy + 0.5) * WORK_SIZE) / grid));
        const pi = idx(cx, cy, WORK_SIZE);
        const ci = gi * 4;
        snapped.colors[ci] = work.data[pi]!;
        snapped.colors[ci + 1] = work.data[pi + 1]!;
        snapped.colors[ci + 2] = work.data[pi + 2]!;
        snapped.colors[ci + 3] = 255;
      }
    }
  }

  // Second despeckle on grid — remove lone pixels after snap
  snapped = {
    mask: despeckle(snapped.mask, grid, grid),
    colors: snapped.colors,
  };

  const out = new Uint8Array(grid * grid * 4);
  for (let i = 0; i < grid * grid; i++) {
    const di = i * 4;
    if (!snapped.mask[i]) {
      out[di + 3] = 0;
      continue;
    }

    if (options.colorMode === 'mono') {
      out[di] = 0;
      out[di + 1] = 0;
      out[di + 2] = 0;
      out[di + 3] = 255;
      continue;
    }

    const [r, g, b] = inkColor(
      snapped.colors[di]!,
      snapped.colors[di + 1]!,
      snapped.colors[di + 2]!,
      options.posterizeLevels,
    );
    out[di] = r;
    out[di + 1] = g;
    out[di + 2] = b;
    out[di + 3] = 255;
  }

  return upscaleNearest({ width: grid, height: grid, data: out }, options.outputSize);
}
