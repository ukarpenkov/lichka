import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useSeamlessChatStyles } from './useSeamlessChatStyles';

export type SeamlessHeaderProps = {
  children: React.ReactNode;
  transparentOnIdle?: boolean;
  testID?: string;
};

export function SeamlessHeader({
  children,
  transparentOnIdle = true,
  testID,
}: SeamlessHeaderProps) {
  const styles = useSeamlessChatStyles();

  return (
    <View
      testID={testID}
      style={[
        baseStyles.container,
        styles.header,
        {
          backgroundColor: transparentOnIdle ? styles.background : styles.header.backgroundColor,
        },
      ]}>
      {children}
    </View>
  );
}

const baseStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0,
  },
});
