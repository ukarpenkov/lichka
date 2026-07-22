import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Text } from './Text';
import { useTheme } from '../config';
import { resolveMediaPath } from '../lib';
import { PixelIcon, isChatIconAvatar } from './pixel';

export type AvatarProps = {
  title: string;
  avatarPath?: string | null;
  size?: number;
};

function isFileAvatar(path: string): boolean {
  return path.includes('/') || path.includes('\\') || path.startsWith('file:');
}

export function Avatar({ title, avatarPath, size = 48 }: AvatarProps) {
  const { text, background } = useTheme();
  const radius = size / 2;
  const letter = title.charAt(0).toUpperCase() || '?';

  if (avatarPath) {
    if (isChatIconAvatar(avatarPath)) {
      return (
        <View
          style={[
            styles.icon,
            {
              width: size,
              height: size,
              borderRadius: radius,
              backgroundColor: text + '15',
            },
          ]}>
          <PixelIcon name={avatarPath} color={text} size={size * 0.5} />
        </View>
      );
    }

    if (!isFileAvatar(avatarPath)) {
      // Legacy emoji avatar
      return (
        <View
          style={[
            styles.emoji,
            {
              width: size,
              height: size,
              borderRadius: radius,
              backgroundColor: text + '15',
            },
          ]}>
          <Text style={{ fontSize: size * 0.5, lineHeight: size }}>
            {avatarPath}
          </Text>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.icon,
          {
            width: size,
            height: size,
            borderRadius: radius,
            // Theme-pixel avatars are opaque theme palette; plate matches theme bg
            backgroundColor: avatarPath.endsWith('.png') ? background : text + '15',
            overflow: 'hidden',
          },
        ]}>
        <Image
          source={{ uri: `file://${resolveMediaPath(avatarPath)}` }}
          style={{ width: size, height: size, borderRadius: radius }}
          resizeMode="cover"
        />
      </View>
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
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
