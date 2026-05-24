import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Text } from './Text';
import { useTheme } from '../config';

export type AvatarProps = {
  title: string;
  avatarPath?: string | null;
  size?: number;
};

export function Avatar({ title, avatarPath, size = 48 }: AvatarProps) {
  const { text } = useTheme();
  const radius = size / 2;
  const letter = title.charAt(0).toUpperCase() || '?';

  if (avatarPath) {
    return (
      <Image
        source={{ uri: `file://${avatarPath}` }}
        style={[styles.image, { width: size, height: size, borderRadius: radius }]}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: text + '15',
        },
      ]}>
      <Text style={{ fontSize: size * 0.4, lineHeight: size, color: text }}>
        {letter}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
