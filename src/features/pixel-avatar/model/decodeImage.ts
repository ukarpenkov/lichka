import jpeg from 'jpeg-js';
import UPNGImport from 'upng-js';
import type { RgbaImage } from './types';
import { base64ToBytes } from './pngEncode';

export type ImageBinaryFormat = 'jpeg' | 'png' | 'webp' | 'unknown';

type UpngApi = {
  decode: (buffer: ArrayBuffer) => { width: number; height: number };
  toRGBA8: (img: { width: number; height: number }) => ArrayBuffer[];
};

function getUpng(): UpngApi {
  const mod = UPNGImport as unknown as UpngApi & { default?: UpngApi };
  const api = (mod?.decode ? mod : mod?.default) as UpngApi | undefined;
  if (!api?.decode) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('upng-js') as UpngApi;
  }
  return api;
}

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

function hexPreview(bytes: Uint8Array, n = 8): string {
  return Array.from(bytes.subarray(0, Math.min(n, bytes.length)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(' ');
}

/** Contiguous copy — RNFS / base64 views can be sliced and break jpeg-js. */
function ensureContiguous(bytes: Uint8Array): Uint8Array {
  if (bytes.byteOffset === 0 && bytes.byteLength === bytes.buffer.byteLength) {
    return bytes;
  }
  return new Uint8Array(bytes);
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const contiguous = ensureContiguous(bytes);
  return contiguous.buffer.slice(
    contiguous.byteOffset,
    contiguous.byteOffset + contiguous.byteLength,
  ) as ArrayBuffer;
}

function getJpegDecode(): (data: Uint8Array, opts: object) => { width: number; height: number; data: Uint8Array } {
  const mod = jpeg as unknown as {
    decode?: (data: Uint8Array, opts: object) => { width: number; height: number; data: Uint8Array };
    default?: { decode: (data: Uint8Array, opts: object) => { width: number; height: number; data: Uint8Array } };
  };
  const decode = mod.decode ?? mod.default?.decode;
  if (!decode) {
    throw new Error('jpeg-js decode is unavailable');
  }
  return decode;
}

function decodeJpeg(bytes: Uint8Array): RgbaImage {
  const input = ensureContiguous(bytes);
  try {
    const decoded = getJpegDecode()(input, {
      useTArray: true,
      formatAsRGBA: true,
      tolerantDecoding: true,
      maxResolutionInMP: 40,
    });
    return {
      width: decoded.width,
      height: decoded.height,
      data: decoded.data as Uint8Array,
    };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`JPEG decode failed (${bytes.length} B, head ${hexPreview(bytes)}): ${msg}`);
  }
}

function decodePng(bytes: Uint8Array): RgbaImage {
  try {
    const UPNG = getUpng();
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
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`PNG decode failed (${bytes.length} B, head ${hexPreview(bytes)}): ${msg}`);
  }
}

/** Decode JPEG or PNG from raw bytes (format sniffed). */
export function decodeImageBytes(bytes: Uint8Array): RgbaImage {
  if (!bytes.length) {
    throw new Error('Empty image data for pixel avatar');
  }

  const format = sniffImageFormat(bytes);
  switch (format) {
    case 'jpeg':
      return decodeJpeg(bytes);
    case 'png':
      return decodePng(bytes);
    case 'webp':
      throw new Error('WebP is not supported for pixel avatar yet');
    default:
      throw new Error(
        `Unsupported image format (need JPEG/PNG, got ${format}, ${bytes.length} B, head ${hexPreview(bytes)})`,
      );
  }
}

export function decodeImageBase64(base64: string): RgbaImage {
  const clean = base64.replace(/^data:[^;]+;base64,/, '').replace(/\s/g, '');
  if (!clean) {
    throw new Error('Empty base64 for pixel avatar');
  }
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
