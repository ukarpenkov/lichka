import type { TextStyle, ViewStyle } from 'react-native';
import { Platform } from 'react-native';
import { withAlpha } from '../lib/color';

/**
 * Typography faces (Android family = filename without extension).
 * - Press Start 2P — pixel display for root page titles (Latin + Cyrillic).
 * - JetBrains Mono — UI / body / chat stream.
 * Weight for Mono = file, not faux fontWeight.
 */
export const fonts = {
  /** Pixel display — PageHeader titles. https://fonts.google.com/specimen/Press+Start+2P */
  display: 'PressStart2P-Regular',
  regular: 'JetBrainsMono-Regular',
  medium: 'JetBrainsMono-Medium',
  semiBold: 'JetBrainsMono-SemiBold',
  bold: 'JetBrainsMono-Bold',
} as const;

export type FontWeightKey = Exclude<keyof typeof fonts, 'display'>;

/** Spacing scale — base 4. */
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  /** Page horizontal gutter (designer: 20). */
  gutter: 20,
  base: 16,
  lg: 20,
  xl: 24,
  /** Gap between settings sections (label ← previous section). */
  sectionGap: 28,
  xxl: 32,
} as const;

export type Spacing = typeof spacing;

/**
 * Radii — terminal: minimal.
 * Messages = 0; chips/fields = sm–md; avatar/FAB = full.
 */
export const radii = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
} as const;

export type Radii = typeof radii;

function monoFace(
  weight: FontWeightKey,
  metrics: Omit<TextStyle, 'fontFamily' | 'fontWeight'>,
): TextStyle {
  return {
    fontFamily: fonts[weight],
    // Avoid Android faux-bold when a weight-specific file is already set.
    fontWeight: Platform.OS === 'ios' ? weightToNumeric(weight) : 'normal',
    ...metrics,
  };
}

function weightToNumeric(weight: FontWeightKey): TextStyle['fontWeight'] {
  switch (weight) {
    case 'regular':
      return '400';
    case 'medium':
      return '500';
    case 'semiBold':
      return '600';
    case 'bold':
      return '700';
  }
}

/** Typography — Press Start 2P display + JetBrains Mono UI. */
export const typography = {
  /**
   * Root tab titles — pixel display.
   * Size kept modest: Press Start 2P is very wide («Запланировано» must fit).
   */
  display: {
    fontFamily: fonts.display,
    fontSize: 18,
    lineHeight: 28,
    letterSpacing: 0,
    fontWeight: Platform.OS === 'ios' ? ('400' as const) : ('normal' as const),
  },
  title: monoFace('semiBold', {
    fontSize: 17,
    lineHeight: 22,
  }),
  'title-sm': monoFace('medium', {
    fontSize: 15,
    lineHeight: 21,
  }),
  body: monoFace('regular', {
    fontSize: 16,
    lineHeight: 24,
  }),
  'body-sm': monoFace('regular', {
    fontSize: 13,
    lineHeight: 18,
  }),
  /** Timestamp / log meta — tabular feel via mono. */
  'mono-meta': monoFace('regular', {
    fontSize: 12,
    lineHeight: 16,
    fontVariant: ['tabular-nums'],
  }),
  caption: monoFace('semiBold', {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  }),
  micro: monoFace('semiBold', {
    fontSize: 11,
    lineHeight: 13,
  }),
  button: monoFace('medium', {
    fontSize: 15,
    lineHeight: 20,
  }),
} as const satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof typography;

/** Fixed semantic accents (outside theme pair). */
export const fixedColors = {
  badge: '#E53935',
  onBadge: '#FFFFFF',
  destructive: '#E53935',
  scrim: 'rgba(0, 0, 0, 0.45)',
} as const;

export type SemanticColors = {
  canvas: string;
  ink: string;
  body: string;
  muted: string;
  mutedSoft: string;
  surfaceSoft: string;
  surfaceStrong: string;
  onInk: string;
  switchTrackOff: string;
  switchTrackOn: string;
  badge: string;
  onBadge: string;
  destructive: string;
  scrim: string;
};

export function resolveSemanticColors(
  background: string,
  text: string,
): SemanticColors {
  return {
    canvas: background,
    ink: text,
    body: withAlpha(text, 0.9),
    muted: withAlpha(text, 0.6),
    mutedSoft: withAlpha(text, 0.38),
    surfaceSoft: withAlpha(text, 0.06),
    surfaceStrong: withAlpha(text, 0.12),
    onInk: background,
    switchTrackOff: withAlpha(text, 0.2),
    switchTrackOn: withAlpha(text, 0.85),
    badge: fixedColors.badge,
    onBadge: fixedColors.onBadge,
    destructive: fixedColors.destructive,
    scrim: fixedColors.scrim,
  };
}

/** FAB soft float — platform-split (do not merge into one token). */
export const fabShadow: ViewStyle = Platform.select({
  ios: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
  },
  android: {
    elevation: 3,
  },
  default: {},
})!;

/** List row density — CLI denser than journal. */
export const listRow = {
  chat: { paddingVertical: 10, paddingHorizontal: spacing.gutter },
  scheduled: { paddingVertical: 10, paddingHorizontal: spacing.gutter },
  settings: {
    paddingVertical: 10,
    paddingHorizontal: spacing.gutter,
    minHeight: 52,
  },
} as const;

/** PageHeader geometry. */
export const pageHeader = {
  minHeight: 56,
  paddingHorizontal: spacing.gutter,
} as const;
