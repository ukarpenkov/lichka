export type PixelColorMode = 'color' | 'mono';

export type PixelAvatarOptions = {
  /** Low-res grid size (blocky look). Default 32. */
  pixelGrid?: number;
  /** Final PNG edge length. Default 128. */
  outputSize?: number;
  /** Luminance contrast multiplier. Default 2.2. */
  contrast?: number;
  /** Edge magnitude threshold 0..1. Default 0.22. */
  edgeThreshold?: number;
  /** Posterize levels per channel in color mode. Default 5. */
  posterizeLevels?: number;
  /** Colored contours vs black. Default 'color'. */
  colorMode?: PixelColorMode;
  /** Morphological dilate iterations on edge map. Default 1. */
  edgeDilate?: number;
};

export type ResolvedPixelAvatarOptions = {
  pixelGrid: number;
  outputSize: number;
  contrast: number;
  edgeThreshold: number;
  posterizeLevels: number;
  colorMode: PixelColorMode;
  edgeDilate: number;
};

export const DEFAULT_PIXEL_AVATAR_OPTIONS: ResolvedPixelAvatarOptions = {
  pixelGrid: 32,
  outputSize: 128,
  contrast: 2.2,
  edgeThreshold: 0.22,
  posterizeLevels: 5,
  colorMode: 'color',
  edgeDilate: 1,
};

export type RgbaImage = {
  width: number;
  height: number;
  /** length = width * height * 4 */
  data: Uint8Array;
};

export type PixelAvatarResult = {
  /** PNG bytes */
  png: Uint8Array;
  /** data:image/png;base64,... for Image preview */
  dataUri: string;
  width: number;
  height: number;
};

export function resolvePixelAvatarOptions(
  options?: PixelAvatarOptions,
): ResolvedPixelAvatarOptions {
  const o = { ...DEFAULT_PIXEL_AVATAR_OPTIONS, ...options };
  return {
    pixelGrid: clampInt(o.pixelGrid, 16, 64),
    outputSize: clampInt(o.outputSize, 32, 512),
    contrast: clamp(o.contrast, 0.5, 5),
    edgeThreshold: clamp(o.edgeThreshold, 0.05, 0.8),
    posterizeLevels: clampInt(o.posterizeLevels, 2, 8),
    colorMode: o.colorMode === 'mono' ? 'mono' : 'color',
    edgeDilate: clampInt(o.edgeDilate, 0, 2),
  };
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function clampInt(n: number, min: number, max: number): number {
  return Math.round(clamp(n, min, max));
}
