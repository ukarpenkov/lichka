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
  return Math.round(value / step) * step;
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
      data[di] = src.data[si];
      data[di + 1] = src.data[si + 1];
      data[di + 2] = src.data[si + 2];
      data[di + 3] = src.data[si + 3];
    }
  }

  return { width: side, height: side, data };
}

/** Area (box) downsample — sharper blocks than bilinear for pixel art prep. */
export function downsampleBox(src: RgbaImage, size: number): RgbaImage {
  if (src.width === size && src.height === size) {
    return { width: size, height: size, data: new Uint8Array(src.data) };
  }

  const data = new Uint8Array(size * size * 4);
  const scale = src.width / size;

  for (let y = 0; y < size; y++) {
    const y0 = Math.floor(y * scale);
    const y1 = Math.min(src.height, Math.floor((y + 1) * scale) || y0 + 1);
    for (let x = 0; x < size; x++) {
      const x0 = Math.floor(x * scale);
      const x1 = Math.min(src.width, Math.floor((x + 1) * scale) || x0 + 1);
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let n = 0;
      for (let yy = y0; yy < y1; yy++) {
        for (let xx = x0; xx < x1; xx++) {
          const i = idx(xx, yy, src.width);
          r += src.data[i];
          g += src.data[i + 1];
          b += src.data[i + 2];
          a += src.data[i + 3];
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
      data[di] = src.data[si];
      data[di + 1] = src.data[si + 1];
      data[di + 2] = src.data[si + 2];
      data[di + 3] = src.data[si + 3];
    }
  }

  return { width: size, height: size, data };
}

function applyContrastGray(gray: Float32Array, contrast: number): void {
  for (let i = 0; i < gray.length; i++) {
    const v = (gray[i]! - 128) * contrast + 128;
    gray[i] = Math.min(255, Math.max(0, v));
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

  for (let i = 0; i < out.length; i++) {
    out[i] = out[i]! / max;
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
 * Build pixel-contour avatar RGBA (transparent outside contours).
 * Pure function — safe to unit-test and later port to C++/Nitro.
 */
export function processPixelContourBuffer(
  source: RgbaImage,
  options: ResolvedPixelAvatarOptions,
): RgbaImage {
  const square = centerCropSquare(source);
  const workSize = Math.max(options.pixelGrid * 3, options.pixelGrid);
  const work = downsampleBox(square, workSize);

  const gray = new Float32Array(workSize * workSize);
  for (let i = 0, p = 0; i < gray.length; i++, p += 4) {
    gray[i] = luminance(work.data[p]!, work.data[p + 1]!, work.data[p + 2]!);
  }
  applyContrastGray(gray, options.contrast);

  const edges = sobelMagnitude(gray, workSize, workSize);
  const binary = new Uint8Array(workSize * workSize);
  for (let i = 0; i < edges.length; i++) {
    binary[i] = edges[i]! >= options.edgeThreshold ? 1 : 0;
  }
  const thick = dilateBinary(binary, workSize, workSize, options.edgeDilate);

  const grid = options.pixelGrid;
  const cell = workSize / grid;
  const out = new Uint8Array(grid * grid * 4);

  for (let gy = 0; gy < grid; gy++) {
    for (let gx = 0; gx < grid; gx++) {
      const x0 = Math.floor(gx * cell);
      const y0 = Math.floor(gy * cell);
      const x1 = Math.min(workSize, Math.floor((gx + 1) * cell));
      const y1 = Math.min(workSize, Math.floor((gy + 1) * cell));

      let edgeHits = 0;
      let rSum = 0;
      let gSum = 0;
      let bSum = 0;
      let maxEdge = 0;

      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const ei = y * workSize + x;
          const e = edges[ei]!;
          if (e > maxEdge) maxEdge = e;
          if (thick[ei]) {
            const pi = idx(x, y, workSize);
            rSum += work.data[pi]!;
            gSum += work.data[pi + 1]!;
            bSum += work.data[pi + 2]!;
            edgeHits++;
          }
        }
      }

      const di = idx(gx, gy, grid);
      const isEdge = edgeHits > 0 || maxEdge >= options.edgeThreshold;

      if (!isEdge) {
        out[di] = 0;
        out[di + 1] = 0;
        out[di + 2] = 0;
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

      let r: number;
      let g: number;
      let b: number;
      if (edgeHits > 0) {
        r = rSum / edgeHits;
        g = gSum / edgeHits;
        b = bSum / edgeHits;
      } else {
        const cx = Math.min(workSize - 1, Math.floor((x0 + x1) / 2));
        const cy = Math.min(workSize - 1, Math.floor((y0 + y1) / 2));
        const ci = idx(cx, cy, workSize);
        r = work.data[ci]!;
        g = work.data[ci + 1]!;
        b = work.data[ci + 2]!;
      }

      // Slight darken so contours stay readable on light/dark themes
      r = posterize(r * 0.82, options.posterizeLevels);
      g = posterize(g * 0.82, options.posterizeLevels);
      b = posterize(b * 0.82, options.posterizeLevels);

      out[di] = r;
      out[di + 1] = g;
      out[di + 2] = b;
      out[di + 3] = 255;
    }
  }

  return upscaleNearest({ width: grid, height: grid, data: out }, options.outputSize);
}
