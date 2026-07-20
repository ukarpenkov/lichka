import {
  centerCropSquare,
  downsampleBox,
  processPixelContourBuffer,
  upscaleNearest,
} from '../model/processPixelContourBuffer';
import { resolvePixelAvatarOptions, type RgbaImage } from '../model/types';
import { encodePngRgba, bytesToBase64, base64ToBytes } from '../model/pngEncode';
import { createPixelContourAvatar } from '../model/createPixelContourAvatar';
import { sniffImageFormat, decodeImageBytes } from '../model/decodeImage';

function solidImage(w: number, h: number, r: number, g: number, b: number): RgbaImage {
  const data = new Uint8Array(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    data[i * 4] = r;
    data[i * 4 + 1] = g;
    data[i * 4 + 2] = b;
    data[i * 4 + 3] = 255;
  }
  return { width: w, height: h, data };
}

/** High-contrast circle on white — reliable Sobel edges near center. */
function circleOnWhite(size: number, radius: number, color: [number, number, number]): RgbaImage {
  const img = solidImage(size, size, 255, 255, 255);
  const cx = size / 2;
  const cy = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const d = Math.hypot(x - cx, y - cy);
      if (d <= radius && d >= radius - 4) {
        const i = (y * size + x) * 4;
        img.data[i] = color[0];
        img.data[i + 1] = color[1];
        img.data[i + 2] = color[2];
      }
    }
  }
  return img;
}

describe('processPixelContourBuffer', () => {
  it('should center-crop non-square image to square', () => {
    const src = solidImage(100, 60, 10, 20, 30);
    const cropped = centerCropSquare(src);
    expect(cropped.width).toBe(60);
    expect(cropped.height).toBe(60);
  });

  it('should upscale with nearest neighbor preserving flat blocks', () => {
    const src = solidImage(2, 2, 0, 0, 0);
    src.data[0] = 255;
    const up = upscaleNearest(src, 4);
    expect(up.width).toBe(4);
    expect(up.data[0]).toBe(255);
    expect(up.data[(0 * 4 + 1) * 4]).toBe(255);
  });

  it('should downsample with box filter', () => {
    const src = solidImage(4, 4, 100, 100, 100);
    const down = downsampleBox(src, 2);
    expect(down.width).toBe(2);
    expect(down.data[0]).toBe(100);
  });

  it('should draw black ink on white background by default', () => {
    const src = circleOnWhite(128, 36, [0, 0, 0]);
    const opts = resolvePixelAvatarOptions({
      pixelGrid: 40,
      outputSize: 120,
      edgeKeepFraction: 0.12,
    });
    const out = processPixelContourBuffer(src, opts);
    expect(out.width).toBe(120);

    let white = 0;
    let black = 0;
    for (let i = 0; i < out.data.length; i += 4) {
      const r = out.data[i]!;
      const g = out.data[i + 1]!;
      const b = out.data[i + 2]!;
      if (r > 240 && g > 240 && b > 240) white++;
      if (r < 20 && g < 20 && b < 20) black++;
    }
    expect(white).toBeGreaterThan(black);
    expect(black).toBeGreaterThan(5);
  });

  it('should use black contours in mono mode', () => {
    const src = circleOnWhite(128, 36, [200, 40, 40]);
    const opts = resolvePixelAvatarOptions({
      pixelGrid: 40,
      outputSize: 120,
      colorMode: 'mono',
      edgeKeepFraction: 0.12,
    });
    const out = processPixelContourBuffer(src, opts);

    for (let i = 0; i < out.data.length; i += 4) {
      const r = out.data[i]!;
      const g = out.data[i + 1]!;
      const b = out.data[i + 2]!;
      // either white bg or black ink
      const isWhite = r > 240 && g > 240 && b > 240;
      const isBlack = r < 20 && g < 20 && b < 20;
      expect(isWhite || isBlack).toBe(true);
    }
  });

  it('should leave most of the canvas white (contour-only, not a filled mush)', () => {
    const src = circleOnWhite(160, 40, [20, 20, 20]);
    const opts = resolvePixelAvatarOptions({
      pixelGrid: 56,
      outputSize: 112,
      colorMode: 'mono',
      edgeKeepFraction: 0.18,
    });
    const out = processPixelContourBuffer(src, opts);
    let ink = 0;
    const total = out.width * out.height;
    for (let i = 0; i < out.data.length; i += 4) {
      if (out.data[i]! < 40 && out.data[i + 1]! < 40 && out.data[i + 2]! < 40) ink++;
    }
    expect(ink).toBeGreaterThan(5);
    expect(ink / total).toBeLessThan(0.35);
  });
});

describe('pngEncode', () => {
  it('should produce a PNG signature', () => {
    const img = solidImage(4, 4, 1, 2, 3);
    const png = encodePngRgba(4, 4, img.data);
    expect(Array.from(png.slice(0, 8))).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  });

  it('should round-trip base64 helpers', () => {
    const bytes = new Uint8Array([1, 2, 3, 250]);
    const b64 = bytesToBase64(bytes);
    expect(Array.from(base64ToBytes(b64))).toEqual([1, 2, 3, 250]);
  });
});

describe('createPixelContourAvatar', () => {
  it('should return dataUri and matching dimensions from rgba input', () => {
    const src = circleOnWhite(96, 28, [40, 120, 200]);
    const result = createPixelContourAvatar(
      { kind: 'rgba', image: src },
      { pixelGrid: 40, outputSize: 120, edgeKeepFraction: 0.12 },
    );
    expect(result.width).toBe(120);
    expect(result.height).toBe(120);
    expect(result.dataUri.startsWith('data:image/png;base64,')).toBe(true);
    expect(result.png[0]).toBe(137);
  });

  it('should decode PNG bytes and produce avatar', () => {
    const src = circleOnWhite(64, 18, [10, 200, 80]);
    const png = encodePngRgba(src.width, src.height, src.data);
    expect(sniffImageFormat(png)).toBe('png');

    const decoded = decodeImageBytes(png);
    expect(decoded.width).toBe(64);

    const result = createPixelContourAvatar(
      { kind: 'bytes', bytes: png },
      { pixelGrid: 32, outputSize: 96, edgeKeepFraction: 0.15 },
    );
    expect(result.png[0]).toBe(137);
  });

  it('should decode JPEG bytes and produce avatar', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const jpeg = require('jpeg-js') as typeof import('jpeg-js');
    const rgba = new Uint8Array(32 * 32 * 4);
    for (let i = 0; i < rgba.length; i += 4) {
      rgba[i] = 220;
      rgba[i + 1] = 220;
      rgba[i + 2] = 220;
      rgba[i + 3] = 255;
    }
    for (let y = 8; y < 24; y++) {
      for (let x = 8; x < 24; x++) {
        const onRing = Math.hypot(x - 16, y - 16);
        if (onRing >= 6 && onRing <= 8) {
          const i = (y * 32 + x) * 4;
          rgba[i] = 10;
          rgba[i + 1] = 10;
          rgba[i + 2] = 10;
        }
      }
    }
    const encoded = jpeg.encode({ width: 32, height: 32, data: rgba }, 90);
    const bytes = new Uint8Array(encoded.data);
    expect(sniffImageFormat(bytes)).toBe('jpeg');

    const result = createPixelContourAvatar(
      { kind: 'bytes', bytes },
      { pixelGrid: 32, outputSize: 96, edgeKeepFraction: 0.15 },
    );
    expect(result.png[0]).toBe(137);
  });

  it('should sniff jpeg magic bytes', () => {
    expect(sniffImageFormat(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe('jpeg');
    expect(sniffImageFormat(new Uint8Array([0x00, 0x01, 0x02]))).toBe('unknown');
  });
});
