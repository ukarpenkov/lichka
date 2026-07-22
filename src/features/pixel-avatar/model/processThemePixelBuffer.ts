import type { Rgb, RgbaImage, ResolvedPixelAvatarOptions } from './types';

function idx(x: number, y: number, w: number): number {
  return (y * w + x) * 4;
}

export function luminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/** Map continuous 0..255 luminance onto discrete 0..levels-1 bands (0 = darkest). */
export function posterizeLevel(value: number, levels: number): number {
  if (levels <= 2) return value < 128 ? 0 : 1;
  const clamped = Math.min(255, Math.max(0, value));
  const t = clamped / 255;
  return Math.min(levels - 1, Math.floor(t * levels));
}

/**
 * Duotone photo ramp: dark photo → darker theme color, light photo → lighter.
 * Works for light themes (ink on paper) and dark (green phosphor on black).
 */
export function themeRampEnds(background: Rgb, text: Rgb): { dark: Rgb; light: Rgb } {
  const bgLum = luminance(background[0], background[1], background[2]);
  const textLum = luminance(text[0], text[1], text[2]);
  if (bgLum <= textLum) {
    return { dark: background, light: text };
  }
  return { dark: text, light: background };
}

/** Lerp dark→light by band index (0 = darkest). */
export function themeColorForLevel(
  level: number,
  levels: number,
  background: Rgb,
  text: Rgb,
): Rgb {
  const { dark, light } = themeRampEnds(background, text);
  const t = levels <= 1 ? 1 : level / (levels - 1);
  return [
    Math.round(dark[0] + (light[0] - dark[0]) * t),
    Math.round(dark[1] + (light[1] - dark[1]) * t),
    Math.round(dark[2] + (light[2] - dark[2]) * t),
  ];
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

function applyContrast(value: number, contrast: number): number {
  return Math.min(255, Math.max(0, (value - 128) * contrast + 128));
}

/**
 * Build a grayscale luminance mask (theme-independent).
 * Gray value = posterized luminance; persist this PNG and recolor on theme change.
 */
export function buildThemePixelMask(
  source: RgbaImage,
  options: ResolvedPixelAvatarOptions,
): RgbaImage {
  const square = centerCropSquare(source);
  const grid = downsampleBox(square, options.pixelGrid);
  const levels = options.posterizeLevels;
  const out = new Uint8Array(grid.width * grid.height * 4);

  for (let i = 0, p = 0; i < grid.width * grid.height; i++, p += 4) {
    const lum = applyContrast(
      luminance(grid.data[p]!, grid.data[p + 1]!, grid.data[p + 2]!),
      options.contrast,
    );
    const level = posterizeLevel(lum, levels);
    const gray =
      levels <= 1 ? 255 : Math.round((level / (levels - 1)) * 255);
    out[p] = gray;
    out[p + 1] = gray;
    out[p + 2] = gray;
    out[p + 3] = 255;
  }

  return upscaleNearest(
    { width: grid.width, height: grid.height, data: out },
    options.outputSize,
  );
}

/**
 * Paint any RGBA source onto the theme duotone ramp using per-pixel luminance.
 * Works for grayscale masks and previously baked theme-pixel PNGs.
 */
export function paintThemePixelMask(
  source: RgbaImage,
  options: ResolvedPixelAvatarOptions,
): RgbaImage {
  const levels = options.posterizeLevels;
  const out = new Uint8Array(source.data.length);

  for (let p = 0; p < source.data.length; p += 4) {
    const lum = luminance(source.data[p]!, source.data[p + 1]!, source.data[p + 2]!);
    const level = posterizeLevel(lum, levels);
    const [r, g, b] = themeColorForLevel(
      level,
      levels,
      options.background,
      options.text,
    );
    out[p] = r;
    out[p + 1] = g;
    out[p + 2] = b;
    out[p + 3] = 255;
  }

  return { width: source.width, height: source.height, data: out };
}

/**
 * Full pipeline: mask → paint with current theme.
 */
export function processThemePixelBuffer(
  source: RgbaImage,
  options: ResolvedPixelAvatarOptions,
): RgbaImage {
  return paintThemePixelMask(buildThemePixelMask(source, options), options);
}

/** @deprecated Use processThemePixelBuffer — contour MVP replaced by theme-pixel. */
export const processPixelContourBuffer = processThemePixelBuffer;
