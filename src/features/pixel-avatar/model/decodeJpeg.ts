import jpeg from 'jpeg-js';
import type { RgbaImage } from './types';
import { base64ToBytes } from './pngEncode';

export function decodeJpegBytes(bytes: Uint8Array): RgbaImage {
  const decoded = jpeg.decode(bytes, { useTArray: true, formatAsRGBA: true });
  return {
    width: decoded.width,
    height: decoded.height,
    data: decoded.data as Uint8Array,
  };
}

export function decodeJpegBase64(base64: string): RgbaImage {
  return decodeJpegBytes(base64ToBytes(base64));
}
