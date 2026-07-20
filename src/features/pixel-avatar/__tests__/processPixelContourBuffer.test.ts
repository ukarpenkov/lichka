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

/** High-contrast circle on white — reliable Sobel edges. */
function circleOnWhite(size: number, radius: number, color: [number, number, number]): RgbaImage {
  const img = solidImage(size, size, 255, 255, 255);
  const cx = size / 2;
  const cy = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const d = Math.hypot(x - cx, y - cy);
      if (d <= radius && d >= radius - 3) {
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

  it('should keep transparent background outside contours', () => {
    const src = circleOnWhite(64, 20, [200, 40, 40]);
    const opts = resolvePixelAvatarOptions({
      pixelGrid: 24,
      outputSize: 48,
      colorMode: 'color',
      edgeThreshold: 0.15,
    });
    const out = processPixelContourBuffer(src, opts);
    expect(out.width).toBe(48);

    let transparent = 0;
    let opaque = 0;
    for (let i = 0; i < out.data.length; i += 4) {
      if (out.data[i + 3] === 0) transparent++;
      else opaque++;
    }
    expect(transparent).toBeGreaterThan(0);
    expect(opaque).toBeGreaterThan(0);
  });

  it('should use black contours in mono mode', () => {
    const src = circleOnWhite(64, 20, [200, 40, 40]);
    const opts = resolvePixelAvatarOptions({
      pixelGrid: 24,
      outputSize: 48,
      colorMode: 'mono',
      edgeThreshold: 0.15,
    });
    const out = processPixelContourBuffer(src, opts);

    for (let i = 0; i < out.data.length; i += 4) {
      if (out.data[i + 3]! > 0) {
        expect(out.data[i]).toBe(0);
        expect(out.data[i + 1]).toBe(0);
        expect(out.data[i + 2]).toBe(0);
      }
    }
  });

  it('should keep non-zero color on contours in color mode', () => {
    const src = circleOnWhite(64, 20, [220, 30, 30]);
    const opts = resolvePixelAvatarOptions({
      pixelGrid: 24,
      outputSize: 48,
      colorMode: 'color',
      posterizeLevels: 4,
      edgeThreshold: 0.15,
    });
    const out = processPixelContourBuffer(src, opts);

    let colored = 0;
    for (let i = 0; i < out.data.length; i += 4) {
      if (out.data[i + 3]! > 0 && (out.data[i]! > 0 || out.data[i + 1]! > 0 || out.data[i + 2]! > 0)) {
        colored++;
      }
    }
    expect(colored).toBeGreaterThan(0);
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
    const src = circleOnWhite(48, 14, [40, 120, 200]);
    const result = createPixelContourAvatar(
      { kind: 'rgba', image: src },
      { pixelGrid: 16, outputSize: 64, edgeThreshold: 0.12 },
    );
    expect(result.width).toBe(64);
    expect(result.height).toBe(64);
    expect(result.dataUri.startsWith('data:image/png;base64,')).toBe(true);
    expect(result.png[0]).toBe(137);
  });

  it('should decode PNG bytes and produce avatar', () => {
    const src = circleOnWhite(32, 10, [10, 200, 80]);
    const png = encodePngRgba(src.width, src.height, src.data);
    expect(sniffImageFormat(png)).toBe('png');

    const decoded = decodeImageBytes(png);
    expect(decoded.width).toBe(32);

    const result = createPixelContourAvatar(
      { kind: 'bytes', bytes: png },
      { pixelGrid: 16, outputSize: 32, edgeThreshold: 0.12 },
    );
    expect(result.png[0]).toBe(137);
  });

  it('should sniff jpeg magic bytes', () => {
    expect(sniffImageFormat(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe('jpeg');
    expect(sniffImageFormat(new Uint8Array([0x00, 0x01, 0x02]))).toBe('unknown');
  });
});
