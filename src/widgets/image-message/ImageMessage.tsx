import React, { useCallback, useMemo } from 'react';
import { Image, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { Text } from '../../shared/ui';
import { resolveMediaPath } from '../../shared/lib';
import { radii } from '../../shared/config';
import type { Message } from '../../entities/message';

const IMAGE_RADIUS = radii.md;
const MAX_IMAGE_HEIGHT = 300;

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

function ImageVignette({
  width,
  height,
  gradientId,
}: {
  width: number;
  height: number;
  gradientId: string;
}) {
  return (
    <Svg
      width={width}
      height={height}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Defs>
        <RadialGradient id={gradientId} cx="50%" cy="50%" rx="72%" ry="72%">
          <Stop offset="0%" stopColor="#000" stopOpacity={0} />
          <Stop offset="55%" stopColor="#000" stopOpacity={0} />
          <Stop offset="100%" stopColor="#000" stopOpacity={0.28} />
        </RadialGradient>
      </Defs>
      <Rect width={width} height={height} fill={`url(#${gradientId})`} />
    </Svg>
  );
}

export function ImageMessage({ message, onPress }: ImageMessageProps) {
  const { width: screenWidth } = useWindowDimensions();

  const imageData = useMemo(() => parseImagePayload(message.payload), [message.payload]);
  const absoluteUri = useMemo(
    () => (imageData ? `file://${resolveMediaPath(imageData.uri)}` : null),
    [imageData],
  );

  const hasCaption = Boolean(message.body && message.body.trim().length > 0);
  const vignetteId = `img-vignette-${message.id}`;

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
  const imageHeight = Math.min(bubbleWidth / aspectRatio, MAX_IMAGE_HEIGHT);
  const frameStyle = {
    width: bubbleWidth,
    height: imageHeight,
    borderRadius: IMAGE_RADIUS,
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={handlePress} accessibilityRole="imagebutton">
        <View style={[styles.frame, frameStyle]}>
          <Image
            source={{ uri: absoluteUri }}
            style={[styles.image, { width: bubbleWidth, height: imageHeight }]}
          />
          <ImageVignette
            width={bubbleWidth}
            height={imageHeight}
            gradientId={vignetteId}
          />
        </View>
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
  frame: {
    overflow: 'hidden',
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
