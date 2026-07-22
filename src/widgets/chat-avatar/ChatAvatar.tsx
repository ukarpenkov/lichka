import React from 'react';
import { View, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Avatar, type AvatarProps } from '../../shared/ui';
import { useTheme } from '../../shared/config';
import {
  isThemePixelFileAvatar,
  useThemePixelAvatarUri,
} from '../../features/pixel-avatar';

/**
 * Chat avatar with live theme-pixel recoloring for PNG photo avatars.
 * Icons / emoji / letters fall through to shared Avatar.
 */
export function ChatAvatar({ title, avatarPath, size = 48 }: AvatarProps) {
  const { text, background } = useTheme();
  const tintedUri = useThemePixelAvatarUri(
    avatarPath && isThemePixelFileAvatar(avatarPath) ? avatarPath : null,
  );
  const radius = size / 2;

  if (avatarPath && isThemePixelFileAvatar(avatarPath)) {
    return (
      <View
        style={[
          styles.wrap,
          {
            width: size,
            height: size,
            borderRadius: radius,
            backgroundColor: background,
            overflow: 'hidden',
          },
        ]}>
        {tintedUri ? (
          <Image
            source={{ uri: tintedUri }}
            style={{ width: size, height: size, borderRadius: radius }}
            resizeMode="cover"
          />
        ) : (
          <ActivityIndicator color={text} size="small" />
        )}
      </View>
    );
  }

  return <Avatar title={title} avatarPath={avatarPath} size={size} />;
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
