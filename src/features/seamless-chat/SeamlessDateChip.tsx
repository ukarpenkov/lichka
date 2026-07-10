import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Text } from '../../shared/ui';
import { useSeamlessChatStyles } from './useSeamlessChatStyles';
import { SEAMLESS_SPACING } from './layout';

export type SeamlessDateChipProps = {
  label: string;
  pill?: boolean;
  testID?: string;
};

export function SeamlessDateChip({ label, pill = true, testID }: SeamlessDateChipProps) {
  const styles = useSeamlessChatStyles();

  const pillStyle: ViewStyle[] = pill
    ? [
        styles.pill,
        {
          marginVertical: SEAMLESS_SPACING.pillMarginVertical,
          alignSelf: 'center',
        } as ViewStyle,
      ]
    : [baseStyles.unstyled];

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      style={[baseStyles.container, ...pillStyle]}>
      <View testID={testID}>
        <Text variant="caption" style={[baseStyles.label, { color: styles.meta.color }]}>
          {label}
        </Text>
      </View>
    </Animated.View>
  );
}

const baseStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unstyled: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});
