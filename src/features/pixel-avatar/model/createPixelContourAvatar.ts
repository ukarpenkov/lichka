import {
  resolvePixelAvatarOptions,
  type PixelAvatarOptions,
  type PixelAvatarResult,
  type RgbaImage,
} from './types';
import { processPixelContourBuffer } from './processPixelContourBuffer';
import { encodePngRgba, bytesToBase64 } from './pngEncode';
import { decodeJpegBase64, decodeJpegBytes } from './decodeJpeg';

export type PixelAvatarInput =
  | { kind: 'rgba'; image: RgbaImage }
  | { kind: 'jpeg-bytes'; bytes: Uint8Array }
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
    case 'jpeg-bytes':
      source = decodeJpegBytes(input.bytes);
      break;
    case 'jpeg-base64':
      source = decodeJpegBase64(input.base64);
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

/** Helper for RNFS / picker base64 without data-URI prefix. */
export function createPixelContourAvatarFromBase64(
  base64: string,
  options?: PixelAvatarOptions,
): PixelAvatarResult {
  const clean = base64.replace(/^data:[^;]+;base64,/, '');
  try {
    return createPixelContourAvatar({ kind: 'jpeg-base64', base64: clean }, options);
  } catch {
    throw new Error('Failed to decode image for pixel avatar (expected JPEG)');
  }
}
