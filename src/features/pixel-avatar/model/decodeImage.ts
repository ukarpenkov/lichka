import jpeg from 'jpeg-js';
import * as UPNG from 'upng-js';
import type { RgbaImage } from './types';
import { base64ToBytes } from './pngEncode';

export type ImageBinaryFormat = 'jpeg' | 'png' | 'webp' | 'unknown';

export function sniffImageFormat(bytes: Uint8Array): ImageBinaryFormat {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'jpeg';
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return 'png';
  }
  // RIFF....WEBP
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'webp';
  }
  return 'unknown';
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function decodeJpeg(bytes: Uint8Array): RgbaImage {
  const decoded = jpeg.decode(bytes, { useTArray: true, formatAsRGBA: true });
  return {
    width: decoded.width,
    height: decoded.height,
    data: decoded.data as Uint8Array,
  };
}

function decodePng(bytes: Uint8Array): RgbaImage {
  const img = UPNG.decode(toArrayBuffer(bytes));
  const frames = UPNG.toRGBA8(img);
  const frame = frames[0];
  if (!frame) {
    throw new Error('PNG has no frames');
  }
  return {
    width: img.width,
    height: img.height,
    data: new Uint8Array(frame),
  };
}

/** Decode JPEG or PNG from raw bytes (format sniffed). */
export function decodeImageBytes(bytes: Uint8Array): RgbaImage {
  const format = sniffImageFormat(bytes);
  switch (format) {
    case 'jpeg':
      return decodeJpeg(bytes);
    case 'png':
      return decodePng(bytes);
    case 'webp':
      throw new Error('WebP is not supported for pixel avatar yet — pick a JPEG/PNG photo');
    default:
      throw new Error(
        `Unsupported image format for pixel avatar (expected JPEG or PNG, got ${format})`,
      );
  }
}

export function decodeImageBase64(base64: string): RgbaImage {
  const clean = base64.replace(/^data:[^;]+;base64,/, '').replace(/\s/g, '');
  return decodeImageBytes(base64ToBytes(clean));
}

/** @deprecated use decodeImageBytes */
export function decodeJpegBytes(bytes: Uint8Array): RgbaImage {
  return decodeJpeg(bytes);
}

/** @deprecated use decodeImageBase64 */
export function decodeJpegBase64(base64: string): RgbaImage {
  return decodeImageBase64(base64);
}
