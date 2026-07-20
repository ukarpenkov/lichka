import { withAlpha } from '../color';

describe('withAlpha', () => {
  it('should convert #RRGGBB to rgba with given alpha', () => {
    expect(withAlpha('#000000', 0.06)).toBe('rgba(0, 0, 0, 0.06)');
    expect(withAlpha('#FFFFFF', 0.6)).toBe('rgba(255, 255, 255, 0.6)');
  });

  it('should expand #RGB shorthand', () => {
    expect(withAlpha('#39F', 1)).toBe('rgba(51, 153, 255, 1)');
  });

  it('should clamp alpha to 0–1', () => {
    expect(withAlpha('#000000', -1)).toBe('rgba(0, 0, 0, 0)');
    expect(withAlpha('#000000', 2)).toBe('rgba(0, 0, 0, 1)');
  });

  it('should handle neon theme ink without hex concatenation', () => {
    expect(withAlpha('#39FF14', 0.6)).toBe('rgba(57, 255, 20, 0.6)');
  });

  it('should return original string for invalid hex', () => {
    expect(withAlpha('not-a-color', 0.5)).toBe('not-a-color');
    expect(withAlpha('#12zzzz', 0.5)).toBe('#12zzzz');
  });
});
