import {
  resolvePixelAvatarOptions,
  type PixelAvatarOptions,
  type PixelAvatarResult,
  type RgbaImage,
} from './types';
import { processPixelContourBuffer } from './processPixelContourBuffer';
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

/**
 * Create a pixel-contour avatar PNG from a photo.
 * Local-only; designed so the buffer pipeline can move to Nitro C++ later.
 */
export function createPixelContourAvatar(
  input: PixelAvatarInput,
  options?: PixelAvatarOptions,
): PixelAvatarResult {
  const resolved = resolvePixelAvatarOptions(options);

  let source: RgbaImage;
  switch (input.kind) {
    case 'rgba':
      source = input.image;
      break;
    case 'bytes':
    case 'jpeg-bytes':
      source = decodeImageBytes(input.bytes);
      break;
    case 'base64':
    case 'jpeg-base64':
      source = decodeImageBase64(input.base64);
      break;
    default: {
      const _exhaustive: never = input;
      throw new Error(`Unsupported input: ${JSON.stringify(_exhaustive)}`);
    }
  }

  const rgba = processPixelContourBuffer(source, resolved);
  const png = encodePngRgba(rgba.width, rgba.height, rgba.data);
  const b64 = bytesToBase64(png);

  return {
    png,
    dataUri: `data:image/png;base64,${b64}`,
    width: rgba.width,
    height: rgba.height,
  };
}

/** Helper for RNFS / picker base64 (JPEG or PNG). */
export function createPixelContourAvatarFromBase64(
  base64: string,
  options?: PixelAvatarOptions,
): PixelAvatarResult {
  return createPixelContourAvatar({ kind: 'base64', base64 }, options);
}

export function createPixelContourAvatarFromBytes(
  bytes: Uint8Array,
  options?: PixelAvatarOptions,
): PixelAvatarResult {
  return createPixelContourAvatar({ kind: 'bytes', bytes }, options);
}

export { base64ToBytes };
