import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { Text } from './Text';
import { useTheme } from '../config';
import { pageHeader } from '../config/tokens';

export type PageHeaderProps = {
  title: string;
  right?: React.ReactNode;
  style?: ViewStyle;
};

/**
 * Unified root-tab page header: display title, optional trailing action.
 * Fixed 56px height — no bottom border; separation is whitespace.
 */
export function PageHeader({ title, right, style }: PageHeaderProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: colors.canvas },
        style,
      ]}>
      <Text variant="display" numberOfLines={1} style={styles.title}>
        {title}
      </Text>
      {right != null ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: pageHeader.minHeight,
    paddingHorizontal: pageHeader.paddingHorizontal,
  },
  title: {
    flex: 1,
    flexShrink: 1,
  },
  right: {
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
