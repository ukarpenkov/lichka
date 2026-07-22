import React, { useCallback, useMemo, useState } from 'react';
import {
  Image,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { Text } from '../../shared/ui';
import { resolveMediaPath } from '../../shared/lib';
import { radii, spacing } from '../../shared/config';
import type { Message } from '../../entities/message';

const IMAGE_RADIUS = radii.md;
const MAX_IMAGE_HEIGHT = 300;
/** MessageLine time column minWidth — used only as layout fallback before onLayout. */
const MESSAGE_TIME_COL_FALLBACK = 88;

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

/** Soft corner glows — darkest at corners, no hard oval ring from a center radial. */
const VIGNETTE_CORNERS = [
  { key: 'tl', cx: '0%', cy: '0%' },
  { key: 'tr', cx: '100%', cy: '0%' },
  { key: 'bl', cx: '0%', cy: '100%' },
  { key: 'br', cx: '100%', cy: '100%' },
] as const;

function ImageVignette({ gradientId }: { gradientId: string }) {
  return (
    <Svg
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Defs>
        {VIGNETTE_CORNERS.map(({ key, cx, cy }) => (
          <RadialGradient
            key={key}
            id={`${gradientId}-${key}`}
            cx={cx}
            cy={cy}
            rx="72%"
            ry="72%"
          >
            <Stop offset="0%" stopColor="#000" stopOpacity={0.42} />
            <Stop offset="35%" stopColor="#000" stopOpacity={0.18} />
            <Stop offset="70%" stopColor="#000" stopOpacity={0.05} />
            <Stop offset="100%" stopColor="#000" stopOpacity={0} />
          </RadialGradient>
        ))}
      </Defs>
      {VIGNETTE_CORNERS.map(({ key }) => (
        <Rect
          key={key}
          width="100%"
          height="100%"
          fill={`url(#${gradientId}-${key})`}
        />
      ))}
    </Svg>
  );
}

export function ImageMessage({ message, onPress }: ImageMessageProps) {
  const { width: screenWidth } = useWindowDimensions();
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);

  const imageData = useMemo(() => parseImagePayload(message.payload), [message.payload]);
  const absoluteUri = useMemo(
    () => (imageData ? `file://${resolveMediaPath(imageData.uri)}` : null),
    [imageData],
  );

  const hasCaption = Boolean(message.body && message.body.trim().length > 0);
  const vignetteId = `img-vignette-${message.id}`;

  const fallbackWidth = Math.max(
    120,
    screenWidth - spacing.gutter * 2 - MESSAGE_TIME_COL_FALLBACK - spacing.sm,
  );
  const availableWidth = measuredWidth ?? fallbackWidth;

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const next = Math.floor(event.nativeEvent.layout.width);
    if (next > 0) {
      setMeasuredWidth((prev) => (prev === next ? prev : next));
    }
  }, []);

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

  const aspectRatio =
    imageData.width > 0 && imageData.height > 0
      ? imageData.width / imageData.height
      : 1;
  // Integer bounds — fractional height + overflow:hidden + radius leaves a 1px
  // light seam (reads as a white line) at the bottom of the clip on both platforms.
  const imageHeight = Math.max(
    1,
    Math.round(Math.min(availableWidth / aspectRatio, MAX_IMAGE_HEIGHT)),
  );
  const imageWidth = Math.max(1, Math.round(availableWidth));
  const frameStyle = {
    width: imageWidth,
    height: imageHeight,
    borderRadius: IMAGE_RADIUS,
  };

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <Pressable onPress={handlePress} accessibilityRole="imagebutton">
        <View style={[styles.frame, frameStyle]}>
          <Image source={{ uri: absoluteUri }} style={styles.image} />
          <ImageVignette gradientId={vignetteId} />
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
    width: '100%',
    maxWidth: '100%',
    alignSelf: 'stretch',
    gap: 4,
  },
  frame: {
    overflow: 'hidden',
    maxWidth: '100%',
    // Absorbs anti-alias gap so canvas (#FAFAFA) never flashes as a white hairline
    backgroundColor: '#000',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    // 1px bleed past the clip edge covers the classic radius AA seam
    top: -1,
    right: -1,
    bottom: -1,
    left: -1,
    resizeMode: 'cover',
  },
  caption: {
    fontSize: 14,
    marginTop: 2,
  },
  fallback: {
    fontSize: 15,
    lineHeight: 20,
  },
});
