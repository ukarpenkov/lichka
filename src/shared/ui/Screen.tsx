import React from 'react';
import { View, type ViewProps, StyleSheet } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useTheme } from '../config';

/** По умолчанию без bottom: нижний inset отдаёт PagerTabBar (home indicator). */
const DEFAULT_EDGES: Edge[] = ['top', 'left', 'right'];

export type ScreenProps = ViewProps & {
  children: React.ReactNode;
  /** Края safe area. Для fullscreen вне табов передайте с `bottom`. */
  edges?: Edge[];
};

export function Screen({
  children,
  style,
  edges = DEFAULT_EDGES,
  ...rest
}: ScreenProps) {
  const { background } = useTheme();

  return (
    <SafeAreaView
      edges={edges}
      style={[styles.safe, { backgroundColor: background }]}>
      <View style={[styles.container, style]} {...rest}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});
