export type Rgb = readonly [number, number, number];

export type PixelAvatarOptions = {
  /** Low-res grid size. Default 40 — mildly pixelated, not 16×16. */
  pixelGrid?: number;
  /** Final PNG edge length. Default 224. */
  outputSize?: number;
  /** Luminance contrast before posterize. Default 1.35. */
  contrast?: number;
  /** Brightness bands mapped to theme palette. Default 4. */
  posterizeLevels?: number;
  /** Theme background (#RRGGBB). Lightest luminance level. */
  background?: string;
  /** Theme text (#RRGGBB). Darkest luminance level. */
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
  pixelGrid: 40,
  outputSize: 224,
  contrast: 1.35,
  posterizeLevels: 4,
  background: [250, 250, 250],
  text: [0, 0, 0],
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
      32,
      48,
    ),
    outputSize: clampInt(
      o.outputSize ?? DEFAULT_PIXEL_AVATAR_OPTIONS.outputSize,
      96,
      512,
    ),
    contrast: clamp(
      o.contrast ?? DEFAULT_PIXEL_AVATAR_OPTIONS.contrast,
      0.5,
      3,
    ),
    posterizeLevels: clampInt(
      o.posterizeLevels ?? DEFAULT_PIXEL_AVATAR_OPTIONS.posterizeLevels,
      2,
      4,
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
