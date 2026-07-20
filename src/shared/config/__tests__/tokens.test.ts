import {
  resolveSemanticColors,
  spacing,
  radii,
  typography,
  listRow,
  pageHeader,
  fixedColors,
  fonts,
  monoWeight,
} from '../tokens';
import { DEFAULT_LIGHT, DEFAULT_DARK, getTheme } from '../theme';

describe('tokens', () => {
  describe('resolveSemanticColors', () => {
    it('should map light pair to canvas/ink and opacity tones', () => {
      const colors = resolveSemanticColors(
        DEFAULT_LIGHT.background,
        DEFAULT_LIGHT.text,
      );

      expect(colors.canvas).toBe('#FAFAFA');
      expect(colors.ink).toBe('#000000');
      expect(colors.onInk).toBe('#FAFAFA');
      expect(colors.body).toBe('rgba(0, 0, 0, 0.9)');
      expect(colors.muted).toBe('rgba(0, 0, 0, 0.6)');
      expect(colors.surfaceSoft).toBe('rgba(0, 0, 0, 0.06)');
      expect(colors.badge).toBe(fixedColors.badge);
    });

    it('should keep badge fixed on neon green theme', () => {
      const mint = getTheme('green-on-black');
      const colors = resolveSemanticColors(mint.background, mint.text);

      expect(colors.ink).toBe('#39FF14');
      expect(colors.badge).toBe('#E53935');
      expect(colors.muted).toBe('rgba(57, 255, 20, 0.6)');
    });

    it('should resolve dark theme onInk as black canvas', () => {
      const colors = resolveSemanticColors(
        DEFAULT_DARK.background,
        DEFAULT_DARK.text,
      );
      expect(colors.onInk).toBe('#000000');
      expect(colors.ink).toBe('#FFFFFF');
    });
  });

  describe('scales', () => {
    it('should expose designer gutter and page header geometry', () => {
      expect(spacing.gutter).toBe(20);
      expect(pageHeader.minHeight).toBe(56);
      expect(pageHeader.paddingHorizontal).toBe(20);
    });

    it('should use CLI-dense list row metrics', () => {
      expect(listRow.chat.paddingVertical).toBe(10);
      expect(listRow.scheduled.paddingVertical).toBe(10);
      expect(listRow.settings.minHeight).toBe(52);
    });

    it('should keep a tight terminal radii set', () => {
      expect(radii.none).toBe(0);
      expect(radii.sm).toBe(8);
      expect(radii.md).toBe(12);
      expect(radii.lg).toBe(16);
      expect(radii.full).toBe(9999);
    });

    it('should use Press Start 2P for display and JetBrains Mono for UI body', () => {
      expect(fonts.display).toBe('PressStart2P-Regular');
      expect(fonts.regular).toBe('JetBrainsMono-Regular');
      expect(typography.display.fontFamily).toBe(fonts.display);
      expect(typography.display.fontSize).toBe(18);
      expect(typography.body.fontFamily).toBe(fonts.regular);
      expect(typography['mono-meta'].fontFamily).toBe(fonts.regular);
      expect(typography['mono-meta'].fontSize).toBe(12);
    });

    it('should expose monoWeight without Android faux-bold fallback risk', () => {
      const bold = monoWeight('bold');
      expect(bold.fontFamily).toBe(fonts.bold);
      expect(bold.fontWeight === '700' || bold.fontWeight === 'normal').toBe(true);
    });
  });
});
