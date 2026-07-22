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
/** 1px bleed past clip edge — covers radius AA hairline without a black underlay. */
const CLIP_BLEED = 1;

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
  // Pixel-space radial — percentage rx/ry on RN SVG often collapses to a solid
  // black fill, which made chat previews unreadable.
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.sqrt(cx * cx + cy * cy);

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
        <RadialGradient
          id={gradientId}
          cx={cx}
          cy={cy}
          rx={radius}
          ry={radius}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0%" stopColor="#000" stopOpacity={0} />
          <Stop offset="55%" stopColor="#000" stopOpacity={0} />
          <Stop offset="82%" stopColor="#000" stopOpacity={0.1} />
          <Stop offset="100%" stopColor="#000" stopOpacity={0.22} />
        </RadialGradient>
      </Defs>
      <Rect width={width} height={height} fill={`url(#${gradientId})`} />
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
  const previewStyle = {
    width: imageWidth + CLIP_BLEED * 2,
    height: imageHeight + CLIP_BLEED * 2,
    marginLeft: -CLIP_BLEED,
    marginTop: -CLIP_BLEED,
  };

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <Pressable onPress={handlePress} accessibilityRole="imagebutton">
        <View style={[styles.frame, frameStyle]}>
          <Image
            source={{ uri: absoluteUri }}
            style={previewStyle}
            resizeMode="cover"
          />
          <ImageVignette
            width={imageWidth}
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
    width: '100%',
    maxWidth: '100%',
    alignSelf: 'stretch',
    gap: 4,
  },
  frame: {
    overflow: 'hidden',
    maxWidth: '100%',
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
