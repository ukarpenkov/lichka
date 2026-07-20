export type PixelColorMode = 'color' | 'mono';

export type PixelAvatarOptions = {
  /** Low-res grid size (blocky look). Default 48. */
  pixelGrid?: number;
  /** Final PNG edge length. Default 192. */
  outputSize?: number;
  /** Luminance contrast multiplier. Default 1.8. */
  contrast?: number;
  /** Edge magnitude threshold 0..1 after normalization. Default 0.42. */
  edgeThreshold?: number;
  /** Posterize levels per channel in color mode. Default 4. */
  posterizeLevels?: number;
  /** Colored (dark-tinted) contours vs pure black. Default 'color'. */
  colorMode?: PixelColorMode;
  /** Morphological dilate on the low-res grid (0–1). Default 0. */
  edgeDilate?: number;
  /** Min fraction of work-cell that must be edge to light a pixel. Default 0.18. */
  edgeDensity?: number;
};

export type ResolvedPixelAvatarOptions = {
  pixelGrid: number;
  outputSize: number;
  contrast: number;
  edgeThreshold: number;
  posterizeLevels: number;
  colorMode: PixelColorMode;
  edgeDilate: number;
  edgeDensity: number;
};

export const DEFAULT_PIXEL_AVATAR_OPTIONS: ResolvedPixelAvatarOptions = {
  pixelGrid: 48,
  outputSize: 192,
  contrast: 1.8,
  edgeThreshold: 0.42,
  posterizeLevels: 4,
  colorMode: 'color',
  edgeDilate: 0,
  edgeDensity: 0.18,
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
    pixelGrid: clampInt(o.pixelGrid, 24, 64),
    outputSize: clampInt(o.outputSize, 64, 512),
    contrast: clamp(o.contrast, 0.5, 5),
    edgeThreshold: clamp(o.edgeThreshold, 0.15, 0.85),
    posterizeLevels: clampInt(o.posterizeLevels, 2, 8),
    colorMode: o.colorMode === 'mono' ? 'mono' : 'color',
    edgeDilate: clampInt(o.edgeDilate, 0, 1),
    edgeDensity: clamp(o.edgeDensity ?? DEFAULT_PIXEL_AVATAR_OPTIONS.edgeDensity, 0.05, 0.5),
  };
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function clampInt(n: number, min: number, max: number): number {
  return Math.round(clamp(n, min, max));
}
