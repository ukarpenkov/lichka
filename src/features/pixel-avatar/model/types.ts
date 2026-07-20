export type PixelColorMode = 'color' | 'mono';

export type PixelAvatarOptions = {
  /** Low-res grid size. Default 56 — close to reference. */
  pixelGrid?: number;
  /** Final PNG edge length. Default 224. */
  outputSize?: number;
  /** Luminance contrast. Default 1.6. */
  contrast?: number;
  /**
   * Keep this fraction of strongest (center-weighted) edges, 0..1.
   * Default 0.07 — sparse lines like the reference, not a filled mush.
   */
  edgeKeepFraction?: number;
  /** Posterize levels in color mode. Default 3. */
  posterizeLevels?: number;
  /** Pure black vs dark local tint. Default 'mono' (reference look). */
  colorMode?: PixelColorMode;
  /** Opaque white background (reference) vs transparent. Default true. */
  whiteBackground?: boolean;
};

export type ResolvedPixelAvatarOptions = {
  pixelGrid: number;
  outputSize: number;
  contrast: number;
  edgeKeepFraction: number;
  posterizeLevels: number;
  colorMode: PixelColorMode;
  whiteBackground: boolean;
};

export const DEFAULT_PIXEL_AVATAR_OPTIONS: ResolvedPixelAvatarOptions = {
  pixelGrid: 56,
  outputSize: 224,
  contrast: 2.0,
  edgeKeepFraction: 0.18,
  posterizeLevels: 3,
  colorMode: 'mono',
  whiteBackground: true,
};

export type RgbaImage = {
  width: number;
  height: number;
  data: Uint8Array;
};

export type PixelAvatarResult = {
  png: Uint8Array;
  dataUri: string;
  width: number;
  height: number;
};

export function resolvePixelAvatarOptions(
  options?: PixelAvatarOptions,
): ResolvedPixelAvatarOptions {
  const o = { ...DEFAULT_PIXEL_AVATAR_OPTIONS, ...options };
  return {
    pixelGrid: clampInt(o.pixelGrid, 32, 72),
    outputSize: clampInt(o.outputSize, 96, 512),
    contrast: clamp(o.contrast, 0.5, 4),
    edgeKeepFraction: clamp(o.edgeKeepFraction ?? DEFAULT_PIXEL_AVATAR_OPTIONS.edgeKeepFraction, 0.03, 0.2),
    posterizeLevels: clampInt(o.posterizeLevels, 2, 6),
    colorMode: o.colorMode === 'color' ? 'color' : 'mono',
    whiteBackground: o.whiteBackground !== false,
  };
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function clampInt(n: number, min: number, max: number): number {
  return Math.round(clamp(n, min, max));
}
