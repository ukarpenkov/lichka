import {
  getTheme,
  DEFAULT_LIGHT,
  DEFAULT_DARK,
  THEME_PRESETS,
  type ThemePreset,
} from '../theme';

describe('theme', () => {
  describe('DEFAULT_LIGHT', () => {
    it('should have correct colors', () => {
      expect(DEFAULT_LIGHT.background).toBe('#FAFAFA');
      expect(DEFAULT_LIGHT.text).toBe('#000000');
    });

    it('should have id "light"', () => {
      expect(DEFAULT_LIGHT.id).toBe('light');
    });
  });

  describe('DEFAULT_DARK', () => {
    it('should have correct colors', () => {
      expect(DEFAULT_DARK.background).toBe('#000000');
      expect(DEFAULT_DARK.text).toBe('#FFFFFF');
    });

    it('should have id "dark"', () => {
      expect(DEFAULT_DARK.id).toBe('dark');
    });
  });

  describe('THEME_PRESETS', () => {
    it('should contain exactly 11 presets', () => {
      expect(THEME_PRESETS).toHaveLength(11);
    });

    it('should have unique ids', () => {
      const ids = THEME_PRESETS.map((p) => p.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should have valid hex colors', () => {
      const hexRe = /^#[0-9A-Fa-f]{6}$/;
      for (const preset of THEME_PRESETS) {
        expect(preset.background).toMatch(hexRe);
        expect(preset.text).toMatch(hexRe);
      }
    });
  });

  describe('getTheme', () => {
    it('should return DEFAULT_LIGHT for "light"', () => {
      expect(getTheme('light')).toBe(DEFAULT_LIGHT);
    });

    it('should return DEFAULT_DARK for "dark"', () => {
      expect(getTheme('dark')).toBe(DEFAULT_DARK);
    });

    it('should return correct preset by id', () => {
      for (const preset of THEME_PRESETS) {
        expect(getTheme(preset.id)).toBe(preset);
      }
    });

    it('should fallback to DEFAULT_LIGHT for unknown id', () => {
      expect(getTheme('nonexistent')).toBe(DEFAULT_LIGHT);
    });

    it('should fallback to DEFAULT_LIGHT for empty string', () => {
      expect(getTheme('')).toBe(DEFAULT_LIGHT);
    });
  });
});
