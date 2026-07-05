import React, { useCallback, useMemo } from 'react';
import { Image, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Text } from '../../shared/ui';
import { resolveMediaPath } from '../../shared/lib';
import type { Message } from '../../entities/message';

type ImageMessageProps = {
  message: Message;
  onPress?: (data: { uri: string; width: number; height: number }) => void;
};

function parseImagePayload(
  payload: string | null,
): { uri: string; width: number; height: number } | null {
  if (!payload) return null;
  try {
    const parsed = JSON.parse(payload);
    if (typeof parsed.uri === 'string') {
      return {
        uri: parsed.uri,
        width: typeof parsed.width === 'number' ? parsed.width : 0,
        height: typeof parsed.height === 'number' ? parsed.height : 0,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function ImageMessage({ message, onPress }: ImageMessageProps) {
  const { width: screenWidth } = useWindowDimensions();

  const imageData = useMemo(() => parseImagePayload(message.payload), [message.payload]);
  const absoluteUri = useMemo(
    () => (imageData ? `file://${resolveMediaPath(imageData.uri)}` : null),
    [imageData],
  );

  const hasCaption = message.body && message.body.trim().length > 0;

  const handlePress = useCallback(() => {
    if (imageData && absoluteUri && onPress) {
      onPress({ uri: absoluteUri, width: imageData.width, height: imageData.height });
    }
  }, [imageData, absoluteUri, onPress]);

  if (!imageData || !absoluteUri) {
    return (
      <Text variant="body" style={styles.fallback}>
        {message.body}
      </Text>
    );
  }

  const bubbleWidth = screenWidth * 0.8;
  const aspectRatio =
    imageData.width > 0 && imageData.height > 0
      ? imageData.width / imageData.height
      : 1;
  const imageHeight = Math.min(bubbleWidth / aspectRatio, 300);
  const imageRadius = hasCaption ? undefined : 16;

  return (
    <View style={styles.container}>
      <Pressable onPress={handlePress}>
        <Image
          source={{ uri: absoluteUri }}
          style={[
            styles.image,
            { width: bubbleWidth, height: imageHeight },
            hasCaption
              ? { borderTopLeftRadius: 16, borderTopRightRadius: 16 }
              : { borderRadius: imageRadius },
          ]}
        />
      </Pressable>
      {hasCaption && (
        <Text variant="body" style={styles.caption}>
          {message.body}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: -12,
    marginVertical: -8,
    gap: 4,
  },
  image: {
    resizeMode: 'cover',
  },
  caption: {
    fontSize: 14,
    marginTop: 2,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  fallback: {
    fontSize: 15,
    lineHeight: 20,
  },
});
