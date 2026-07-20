import {
  resolveSemanticColors,
  spacing,
  radii,
  typography,
  listRow,
  pageHeader,
  fixedColors,
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

    it('should use measured list row densities', () => {
      expect(listRow.chat.paddingVertical).toBe(12);
      expect(listRow.scheduled.paddingVertical).toBe(14);
      expect(listRow.settings.minHeight).toBe(56);
    });

    it('should keep a tight radii set', () => {
      expect(radii.md).toBe(12);
      expect(radii.lg).toBe(16);
      expect(radii.full).toBe(9999);
    });

    it('should define display as modest 26/600', () => {
      expect(typography.display.fontSize).toBe(26);
      expect(typography.display.fontWeight).toBe('600');
      expect(typography.display.lineHeight).toBe(32);
    });
  });
});
