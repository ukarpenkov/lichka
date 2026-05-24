import React from 'react';
import { View, type ViewProps, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../config';

export type ScreenProps = ViewProps & {
  children: React.ReactNode;
};

export function Screen({ children, style, ...rest }: ScreenProps) {
  const { background } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: background }]}>
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
