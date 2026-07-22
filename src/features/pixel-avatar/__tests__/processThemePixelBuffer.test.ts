import {
  centerCropSquare,
  downsampleBox,
  processThemePixelBuffer,
  buildThemePixelMask,
  paintThemePixelMask,
  posterizeLevel,
  themeColorForLevel,
  upscaleNearest,
} from '../model/processThemePixelBuffer';
import {
  parseHexRgb,
  resolvePixelAvatarOptions,
  type RgbaImage,
} from '../model/types';
import { encodePngRgba, bytesToBase64, base64ToBytes } from '../model/pngEncode';
import {
  createThemePixelAvatar,
  recolorThemePixelAvatarFromBytes,
} from '../model/createThemePixelAvatar';
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

/** Soft gradient portrait stand-in: dark center, lighter rim. */
function softBlob(size: number): RgbaImage {
  const img = solidImage(size, size, 220, 220, 220);
  const cx = size / 2;
  const cy = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const d = Math.hypot(x - cx, y - cy) / (size * 0.45);
      const t = Math.min(1, Math.max(0, d));
      const lum = Math.round(40 + t * 180);
      const i = (y * size + x) * 4;
      img.data[i] = lum;
      img.data[i + 1] = lum;
      img.data[i + 2] = lum;
    }
  }
  return img;
}

describe('processThemePixelBuffer', () => {
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

  it('should map darkest luminance to theme text and lightest to background', () => {
    const src = solidImage(64, 64, 255, 255, 255);
    // paint a dark 8×8 block in the center
    for (let y = 28; y < 36; y++) {
      for (let x = 28; x < 36; x++) {
        const i = (y * 64 + x) * 4;
        src.data[i] = 0;
        src.data[i + 1] = 0;
        src.data[i + 2] = 0;
      }
    }

    const opts = resolvePixelAvatarOptions({
      pixelGrid: 64,
      outputSize: 96,
      posterizeLevels: 8,
      background: '#FAFAFA',
      text: '#000000',
      contrast: 1,
    });
    const out = processThemePixelBuffer(src, opts);

    let light = 0;
    let dark = 0;
    for (let i = 0; i < out.data.length; i += 4) {
      const r = out.data[i]!;
      const g = out.data[i + 1]!;
      const b = out.data[i + 2]!;
      if (r > 200 && g > 200 && b > 200) light++;
      if (r < 30 && g < 30 && b < 30) dark++;
    }
    expect(light).toBeGreaterThan(dark);
    expect(dark).toBeGreaterThan(5);
  });

  it('should only use colors from the theme palette lerp', () => {
    const src = softBlob(96);
    const opts = resolvePixelAvatarOptions({
      pixelGrid: 64,
      outputSize: 128,
      posterizeLevels: 8,
      background: '#000000',
      text: '#39FF14',
      contrast: 1.1,
    });
    const out = processThemePixelBuffer(src, opts);

    const allowed = new Set<string>();
    for (let level = 0; level < 8; level++) {
      const [r, g, b] = themeColorForLevel(level, 8, [0, 0, 0], [57, 255, 20]);
      allowed.add(`${r},${g},${b}`);
    }

    for (let i = 0; i < out.data.length; i += 4) {
      const key = `${out.data[i]},${out.data[i + 1]},${out.data[i + 2]}`;
      expect(allowed.has(key)).toBe(true);
      expect(out.data[i + 3]).toBe(255);
    }
  });

  it('should map bright areas to green on green-on-black (duotone photo, not inverted)', () => {
    const src = solidImage(64, 64, 0, 0, 0);
    for (let y = 16; y < 48; y++) {
      for (let x = 16; x < 48; x++) {
        const i = (y * 64 + x) * 4;
        src.data[i] = 240;
        src.data[i + 1] = 240;
        src.data[i + 2] = 240;
      }
    }
    const opts = resolvePixelAvatarOptions({
      pixelGrid: 64,
      outputSize: 128,
      posterizeLevels: 8,
      background: '#000000',
      text: '#39FF14',
      contrast: 1,
    });
    const out = processThemePixelBuffer(src, opts);
    expect(out.width).toBe(128);
    // center (bright) → near text green; corner (dark) → near black bg
    const center = (64 * 128 + 64) * 4;
    const corner = 0;
    expect(out.data[center + 1]!).toBeGreaterThan(150);
    expect(out.data[corner]!).toBeLessThan(40);
    expect(out.data[corner + 1]!).toBeLessThan(40);
  });

  it('should keep mild pixelation (opaque fill, finer default grid)', () => {
    const src = softBlob(160);
    const opts = resolvePixelAvatarOptions({
      background: '#F5F0DC',
      text: '#2C2C2C',
    });
    expect(opts.pixelGrid).toBeGreaterThanOrEqual(64);
    expect(opts.posterizeLevels).toBeGreaterThanOrEqual(8);

    const out = processThemePixelBuffer(src, opts);
    const total = out.width * out.height;
    let opaque = 0;
    for (let i = 0; i < out.data.length; i += 4) {
      if (out.data[i + 3]! === 255) opaque++;
    }
    expect(opaque).toBe(total);
  });
});

describe('theme palette helpers', () => {
  it('should posterize into discrete levels', () => {
    expect(posterizeLevel(0, 4)).toBe(0);
    expect(posterizeLevel(255, 4)).toBe(3);
    expect(posterizeLevel(100, 2)).toBe(0);
    expect(posterizeLevel(200, 2)).toBe(1);
  });

  it('should lerp dark→light theme colors across levels', () => {
    // light theme: dark=text, light=background
    expect(themeColorForLevel(0, 3, [255, 255, 255], [0, 0, 0])).toEqual([0, 0, 0]);
    expect(themeColorForLevel(2, 3, [255, 255, 255], [0, 0, 0])).toEqual([
      255, 255, 255,
    ]);
    expect(themeColorForLevel(1, 3, [255, 255, 255], [0, 0, 0])).toEqual([
      128, 128, 128,
    ]);
    // dark theme: dark=background, light=text (green phosphor)
    expect(themeColorForLevel(0, 3, [0, 0, 0], [57, 255, 20])).toEqual([0, 0, 0]);
    expect(themeColorForLevel(2, 3, [0, 0, 0], [57, 255, 20])).toEqual([
      57, 255, 20,
    ]);
  });

  it('should parse hex colors', () => {
    expect(parseHexRgb('#39FF14')).toEqual([57, 255, 20]);
    expect(parseHexRgb('#abc')).toEqual([170, 187, 204]);
    expect(parseHexRgb('nope')).toBeNull();
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

describe('createThemePixelAvatar', () => {
  it('should return dataUri and matching dimensions from rgba input', () => {
    const src = softBlob(96);
    const result = createThemePixelAvatar(
      { kind: 'rgba', image: src },
      {
        pixelGrid: 64,
        outputSize: 128,
        background: '#FAFAFA',
        text: '#000000',
      },
    );
    expect(result.width).toBe(128);
    expect(result.height).toBe(128);
    expect(result.dataUri.startsWith('data:image/png;base64,')).toBe(true);
    expect(result.maskDataUri).toBe(result.dataUri);
    expect(result.previewDataUri.startsWith('data:image/png;base64,')).toBe(true);
    expect(result.png[0]).toBe(137);
  });

  it('should persist a grayscale mask that recolors under a new theme', () => {
    const src = softBlob(64);
    const created = createThemePixelAvatar(
      { kind: 'rgba', image: src },
      {
        pixelGrid: 64,
        outputSize: 96,
        background: '#000000',
        text: '#39FF14',
      },
    );

    const mask = decodeImageBytes(created.maskPng);
    // mask is grayscale: R === G === B
    expect(mask.data[0]).toBe(mask.data[1]);
    expect(mask.data[1]).toBe(mask.data[2]);

    const green = recolorThemePixelAvatarFromBytes(created.maskPng, {
      background: '#000000',
      text: '#39FF14',
    });
    const amber = recolorThemePixelAvatarFromBytes(created.maskPng, {
      background: '#000000',
      text: '#FFB000',
    });
    expect(green.dataUri).not.toBe(amber.dataUri);

    const greenImg = decodeImageBytes(green.png);
    const amberImg = decodeImageBytes(amber.png);
    // Find a non-black pixel — should shift from green toward amber (more red)
    let found = false;
    for (let i = 0; i < greenImg.data.length; i += 4) {
      if (greenImg.data[i + 1]! > 80) {
        expect(amberImg.data[i]!).toBeGreaterThan(greenImg.data[i]!);
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });

  it('should decode PNG bytes and produce avatar', () => {
    const src = softBlob(64);
    const png = encodePngRgba(src.width, src.height, src.data);
    expect(sniffImageFormat(png)).toBe('png');

    const decoded = decodeImageBytes(png);
    expect(decoded.width).toBe(64);

    const result = createThemePixelAvatar(
      { kind: 'bytes', bytes: png },
      { pixelGrid: 64, outputSize: 96, background: '#000', text: '#FFF' },
    );
    expect(result.png[0]).toBe(137);
  });

  it('should decode JPEG bytes and produce avatar', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const jpeg = require('jpeg-js') as typeof import('jpeg-js');
    const rgba = softBlob(32);
    const encoded = jpeg.encode({ width: 32, height: 32, data: rgba.data }, 90);
    const bytes = new Uint8Array(encoded.data);
    expect(sniffImageFormat(bytes)).toBe('jpeg');

    const result = createThemePixelAvatar(
      { kind: 'bytes', bytes },
      { pixelGrid: 64, outputSize: 96, background: '#1B4332', text: '#95D5B2' },
    );
    expect(result.png[0]).toBe(137);
  });

  it('should sniff jpeg magic bytes', () => {
    expect(sniffImageFormat(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe('jpeg');
    expect(sniffImageFormat(new Uint8Array([0x00, 0x01, 0x02]))).toBe('unknown');
  });
});

describe('paintThemePixelMask', () => {
  it('should map the same mask to different theme ramps', () => {
    const opts = resolvePixelAvatarOptions({
      pixelGrid: 64,
      outputSize: 64,
      posterizeLevels: 8,
      contrast: 1,
    });
    const mask = buildThemePixelMask(softBlob(64), {
      ...opts,
      background: [0, 0, 0],
      text: [255, 255, 255],
    });
    const a = paintThemePixelMask(mask, {
      ...opts,
      background: [0, 0, 0],
      text: [57, 255, 20],
    });
    const b = paintThemePixelMask(mask, {
      ...opts,
      background: [0, 0, 0],
      text: [255, 176, 0],
    });
    expect(a.data).not.toEqual(b.data);
  });
});
