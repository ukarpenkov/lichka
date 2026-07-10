import { Platform, type ViewStyle } from 'react-native';

export const SEAMLESS_RADIUS = {
  bubble: 18,
  pill: 12,
  header: 0,
} as const;

export const SEAMLESS_SPACING = {
  bubblePaddingH: 14,
  bubblePaddingV: 10,
  bubbleGap: 6,
  headerPaddingH: 16,
  headerPaddingV: 10,
  pillPaddingH: 12,
  pillPaddingV: 4,
  pillMarginVertical: 12,
} as const;

export const SEAMLESS_OPACITY = {
  bubbleFill: '12',
  bubbleFillHighlighted: '25',
  pillFill: '10',
  meta: '60',
} as const;

export type ShadowOptions = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;

export function buildSeamlessShadow(opacity: number): ShadowOptions {
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: opacity,
    shadowRadius: 8,
    elevation: Platform.OS === 'android' ? 2 : 0,
  };
}

export function defaultBubbleShadow(themeBackground: string): ShadowOptions {
  const isLight = isLightBackground(themeBackground);
  return buildSeamlessShadow(isLight ? 0.06 : 0.25);
}

export function isLightBackground(background: string): boolean {
  const lightHeuristic = ['#FAFAFA', '#F5F0DC', '#F5F5F5'];
  return lightHeuristic.includes(background);
}
