export type Rgb = readonly [number, number, number];

export type PixelAvatarOptions = {
  /**
   * Working grid before NN upscale.
   * Default 96 — mild pixelation (not chunky 32–40).
   */
  pixelGrid?: number;
  /** Final PNG edge length. Default 256. */
  outputSize?: number;
  /** Soft luminance contrast before quantize. Default 1.1. */
  contrast?: number;
  /**
   * Shades along the theme ramp (quality duotone photo).
   * Default 16 — many black↔green (or bg↔text) steps, not 4 flat bands.
   */
  posterizeLevels?: number;
  /** Theme background (#RRGGBB). */
  background?: string;
  /** Theme text (#RRGGBB). */
  text?: string;
};

export type ResolvedPixelAvatarOptions = {
  pixelGrid: number;
  outputSize: number;
  contrast: number;
  posterizeLevels: number;
  background: Rgb;
  text: Rgb;
};

export const DEFAULT_PIXEL_AVATAR_OPTIONS: ResolvedPixelAvatarOptions = {
  pixelGrid: 96,
  outputSize: 256,
  contrast: 1.1,
  posterizeLevels: 16,
  background: [250, 250, 250],
  text: [0, 0, 0],
};

export type RgbaImage = {
  width: number;
  height: number;
  data: Uint8Array;
};

export type PixelAvatarResult = {
  /**
   * Grayscale luminance mask PNG — persist this; recolor on theme change.
   * `png` / `dataUri` alias the mask for save-path compatibility.
   */
  maskPng: Uint8Array;
  maskDataUri: string;
  /** Theme-painted preview for the colors passed at create time. */
  previewPng: Uint8Array;
  previewDataUri: string;
  /** @deprecated alias of maskPng — save this, not the preview */
  png: Uint8Array;
  /** @deprecated alias of maskDataUri */
  dataUri: string;
  width: number;
  height: number;
};

export function parseHexRgb(hex: string): Rgb | null {
  const normalized = hex.trim().replace(/^#/, '');
  if (!/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(normalized)) {
    return null;
  }
  if (normalized.length === 3) {
    return [
      parseInt(normalized[0]! + normalized[0]!, 16),
      parseInt(normalized[1]! + normalized[1]!, 16),
      parseInt(normalized[2]! + normalized[2]!, 16),
    ];
  }
  return [
    parseInt(normalized.slice(0, 2), 16),
    parseInt(normalized.slice(2, 4), 16),
    parseInt(normalized.slice(4, 6), 16),
  ];
}

export function resolvePixelAvatarOptions(
  options?: PixelAvatarOptions,
): ResolvedPixelAvatarOptions {
  const o = { ...options };
  const background =
    (o.background ? parseHexRgb(o.background) : null) ??
    DEFAULT_PIXEL_AVATAR_OPTIONS.background;
  const text =
    (o.text ? parseHexRgb(o.text) : null) ?? DEFAULT_PIXEL_AVATAR_OPTIONS.text;

  return {
    pixelGrid: clampInt(
      o.pixelGrid ?? DEFAULT_PIXEL_AVATAR_OPTIONS.pixelGrid,
      64,
      128,
    ),
    outputSize: clampInt(
      o.outputSize ?? DEFAULT_PIXEL_AVATAR_OPTIONS.outputSize,
      96,
      512,
    ),
    contrast: clamp(
      o.contrast ?? DEFAULT_PIXEL_AVATAR_OPTIONS.contrast,
      0.5,
      2,
    ),
    posterizeLevels: clampInt(
      o.posterizeLevels ?? DEFAULT_PIXEL_AVATAR_OPTIONS.posterizeLevels,
      8,
      32,
    ),
    background,
    text,
  };
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function clampInt(n: number, min: number, max: number): number {
  return Math.round(clamp(n, min, max));
}
