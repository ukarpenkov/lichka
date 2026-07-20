import { Buffer } from 'buffer';
import UPNGImport from 'upng-js';

type UpngApi = {
  encode: (frames: ArrayBuffer[], w: number, h: number, cnum: number) => ArrayBuffer;
  decode: (buffer: ArrayBuffer) => { width: number; height: number };
  toRGBA8: (img: { width: number; height: number }) => ArrayBuffer[];
};

/** Metro/Hermes: default import from CJS may be undefined or nested. */
function getUpng(): UpngApi {
  const mod = UPNGImport as unknown as UpngApi & { default?: UpngApi };
  const api = (mod?.encode ? mod : mod?.default) as UpngApi | undefined;
  if (!api?.encode) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('upng-js') as UpngApi;
  }
  return api;
}

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

/**
 * Encode RGBA → PNG via upng-js (nested pako via require — Metro-safe).
 */
export function encodePngRgba(width: number, height: number, rgba: Uint8Array): Uint8Array {
  const frame = toArrayBuffer(rgba);
  const png = getUpng().encode([frame], width, height, 0);
  return new Uint8Array(png);
}

/** Hermes-safe base64 — use `buffer` package, not global atob/Buffer. */
export function bytesToBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64');
}

export function base64ToBytes(base64: string): Uint8Array {
  const clean = base64.replace(/^data:[^;]+;base64,/, '').replace(/\s/g, '');
  return new Uint8Array(Buffer.from(clean, 'base64'));
}
