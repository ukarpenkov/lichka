import type { TextStyle, ViewStyle } from 'react-native';
import { Platform } from 'react-native';
import { withAlpha } from '../lib/color';

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

/** Soft radii only — fewer tiers, more intentional. */
export const radii = {
  md: 12,
  lg: 16,
  full: 9999,
} as const;

export type Radii = typeof radii;

/** Typography metrics for Text variants. */
export const typography = {
  display: {
    fontSize: 26,
    fontWeight: '600',
    lineHeight: 32,
    letterSpacing: -0.2,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
  },
  'title-sm': {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 21,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  'body-sm': {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  caption: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 16,
  },
  micro: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 13,
  },
  button: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 20,
  },
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

/** List row density (lead designer — not blanket 16). */
export const listRow = {
  chat: { paddingVertical: 12, paddingHorizontal: spacing.gutter },
  scheduled: { paddingVertical: 14, paddingHorizontal: spacing.gutter },
  settings: {
    paddingVertical: 12,
    paddingHorizontal: spacing.gutter,
    minHeight: 56,
  },
} as const;

/** PageHeader geometry. */
export const pageHeader = {
  minHeight: 56,
  paddingHorizontal: spacing.gutter,
} as const;
