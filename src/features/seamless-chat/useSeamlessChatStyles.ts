import { useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTheme } from '../../shared/config';
import {
  SEAMLESS_OPACITY,
  SEAMLESS_RADIUS,
  SEAMLESS_SPACING,
  defaultBubbleShadow,
  isLightBackground,
} from './layout';

export type BubbleStyle = {
  backgroundColor: string;
  borderRadius: number;
  paddingHorizontal: number;
  paddingVertical: number;
  marginVertical: number;
  marginHorizontal: number;
} & Pick<Required<ViewStyle>, 'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'>;

export type SeamlessChatStyles = {
  background: string;
  text: string;
  isLight: boolean;
  bubble: BubbleStyle;
  pill: {
    backgroundColor: string;
    borderRadius: number;
    paddingHorizontal: number;
    paddingVertical: number;
  };
  header: {
    backgroundColor: string;
    paddingHorizontal: number;
    paddingVertical: number;
  };
  meta: {
    color: string;
  };
};

export function useSeamlessChatStyles(): SeamlessChatStyles {
  const { background, text } = useTheme();

  return useMemo<SeamlessChatStyles>(() => {
    const isLight = isLightBackground(background);
    const shadow = defaultBubbleShadow(background);

    return {
      background,
      text,
      isLight,
      bubble: {
        backgroundColor: text + SEAMLESS_OPACITY.bubbleFill,
        borderRadius: SEAMLESS_RADIUS.bubble,
        paddingHorizontal: SEAMLESS_SPACING.bubblePaddingH,
        paddingVertical: SEAMLESS_SPACING.bubblePaddingV,
        marginVertical: SEAMLESS_SPACING.bubbleGap / 2,
        marginHorizontal: SEAMLESS_SPACING.headerPaddingH,
        shadowColor: shadow.shadowColor as string,
        shadowOffset: shadow.shadowOffset as { width: number; height: number },
        shadowOpacity: shadow.shadowOpacity as number,
        shadowRadius: shadow.shadowRadius as number,
        elevation: shadow.elevation as number,
      },
      pill: {
        backgroundColor: text + SEAMLESS_OPACITY.pillFill,
        borderRadius: SEAMLESS_RADIUS.pill,
        paddingHorizontal: SEAMLESS_SPACING.pillPaddingH,
        paddingVertical: SEAMLESS_SPACING.pillPaddingV,
      },
      header: {
        backgroundColor: 'transparent',
        paddingHorizontal: SEAMLESS_SPACING.headerPaddingH,
        paddingVertical: SEAMLESS_SPACING.headerPaddingV,
      },
      meta: {
        color: text + SEAMLESS_OPACITY.meta,
      },
    };
  }, [background, text]);
}
