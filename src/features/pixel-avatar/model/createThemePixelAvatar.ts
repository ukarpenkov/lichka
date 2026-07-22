import {
  resolvePixelAvatarOptions,
  type PixelAvatarOptions,
  type PixelAvatarResult,
  type RgbaImage,
} from './types';
import {
  buildThemePixelMask,
  paintThemePixelMask,
} from './processThemePixelBuffer';
import { encodePngRgba, bytesToBase64, base64ToBytes } from './pngEncode';
import { decodeImageBase64, decodeImageBytes } from './decodeImage';

export type PixelAvatarInput =
  | { kind: 'rgba'; image: RgbaImage }
  | { kind: 'bytes'; bytes: Uint8Array }
  | { kind: 'base64'; base64: string }
  /** @deprecated use kind: 'bytes' */
  | { kind: 'jpeg-bytes'; bytes: Uint8Array }
  /** @deprecated use kind: 'base64' */
  | { kind: 'jpeg-base64'; base64: string };

export type ThemePixelPaintResult = {
  png: Uint8Array;
  dataUri: string;
  width: number;
  height: number;
};

function decodeInput(input: PixelAvatarInput): RgbaImage {
  switch (input.kind) {
    case 'rgba':
      return input.image;
    case 'bytes':
    case 'jpeg-bytes':
      return decodeImageBytes(input.bytes);
    case 'base64':
    case 'jpeg-base64':
      return decodeImageBase64(input.base64);
    default: {
      const _exhaustive: never = input;
      throw new Error(`Unsupported input: ${JSON.stringify(_exhaustive)}`);
    }
  }
}

function encodePainted(preview: RgbaImage): ThemePixelPaintResult {
  const png = encodePngRgba(preview.width, preview.height, preview.data);
  const b64 = bytesToBase64(png);
  return {
    png,
    dataUri: `data:image/png;base64,${b64}`,
    width: preview.width,
    height: preview.height,
  };
}

/**
 * Create a theme-pixel avatar from a photo.
 * `png` / `dataUri` / `mask*` — grayscale mask to persist.
 * `preview*` — painted with the given theme (UI only).
 */
export function createThemePixelAvatar(
  input: PixelAvatarInput,
  options?: PixelAvatarOptions,
): PixelAvatarResult {
  const resolved = resolvePixelAvatarOptions(options);
  const source = decodeInput(input);
  const mask = buildThemePixelMask(source, resolved);
  const preview = paintThemePixelMask(mask, resolved);

  const maskPng = encodePngRgba(mask.width, mask.height, mask.data);
  const previewPng = encodePngRgba(preview.width, preview.height, preview.data);
  const maskDataUri = `data:image/png;base64,${bytesToBase64(maskPng)}`;
  const previewDataUri = `data:image/png;base64,${bytesToBase64(previewPng)}`;

  return {
    maskPng,
    maskDataUri,
    previewPng,
    previewDataUri,
    png: maskPng,
    dataUri: maskDataUri,
    width: mask.width,
    height: mask.height,
  };
}

/** Recolor a stored mask (or legacy baked PNG) for the current theme. */
export function recolorThemePixelAvatar(
  input: PixelAvatarInput,
  options?: PixelAvatarOptions,
): ThemePixelPaintResult {
  const resolved = resolvePixelAvatarOptions(options);
  const source = decodeInput(input);
  return encodePainted(paintThemePixelMask(source, resolved));
}

export function createThemePixelAvatarFromBase64(
  base64: string,
  options?: PixelAvatarOptions,
): PixelAvatarResult {
  return createThemePixelAvatar({ kind: 'base64', base64 }, options);
}

export function createThemePixelAvatarFromBytes(
  bytes: Uint8Array,
  options?: PixelAvatarOptions,
): PixelAvatarResult {
  return createThemePixelAvatar({ kind: 'bytes', bytes }, options);
}

export function recolorThemePixelAvatarFromBase64(
  base64: string,
  options?: PixelAvatarOptions,
): ThemePixelPaintResult {
  return recolorThemePixelAvatar({ kind: 'base64', base64 }, options);
}

export function recolorThemePixelAvatarFromBytes(
  bytes: Uint8Array,
  options?: PixelAvatarOptions,
): ThemePixelPaintResult {
  return recolorThemePixelAvatar({ kind: 'bytes', bytes }, options);
}

/** @deprecated Use createThemePixelAvatar */
export const createPixelContourAvatar = createThemePixelAvatar;
/** @deprecated Use createThemePixelAvatarFromBase64 */
export const createPixelContourAvatarFromBase64 = createThemePixelAvatarFromBase64;
/** @deprecated Use createThemePixelAvatarFromBytes */
export const createPixelContourAvatarFromBytes = createThemePixelAvatarFromBytes;

export { base64ToBytes };
