import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, View, AccessibilityInfo, Platform } from 'react-native';
import Animated, { FadeInUp, FadeOutDown, Layout } from 'react-native-reanimated';
import { useTheme, useLocale, spacing } from '../../shared/config';
import { Bell, Repeat, Image as ImageIcon, type PixelIconComponent } from '../../shared/ui/pixel';
import { Text, AlarmClockIcon } from '../../shared/ui';
import { VoiceMessage } from '../../widgets/voice-message';
import { ImageMessage } from '../../widgets/image-message';
import { hapticLongPress } from '../../shared/lib';
import { getSettings } from '../../entities/settings';
import type { Message, MessageType } from '../../entities/message';

type MessageLineProps = {
  message: Message;
  highlighted?: boolean;
  onLongPress: (message: Message) => void;
  onImagePress?: (data: { uri: string; width: number; height: number }) => void;
};

/** Log timestamp: [HH:MM:SS] — tabular mono. */
export function formatLogTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  const s = d.getSeconds().toString().padStart(2, '0');
  return `[${h}:${m}:${s}]`;
}

function isVoiceMessage(message: Message): boolean {
  if (!message.payload) return false;
  try {
    const parsed = JSON.parse(message.payload);
    return typeof parsed.uri === 'string' && parsed.uri.includes('voice');
  } catch {
    return false;
  }
}

function isImageMessage(message: Message): boolean {
  if (message.type === 'image') return true;
  if (!message.payload) return false;
  try {
    const parsed = JSON.parse(message.payload);
    return typeof parsed.uri === 'string' && parsed.uri.includes('images');
  } catch {
    return false;
  }
}

const TYPE_ICON: Record<Exclude<MessageType, 'simple'>, PixelIconComponent | null> = {
  reminder: Bell,
  alarm: AlarmClockIcon,
  periodic: Repeat,
  image: ImageIcon,
};

/**
 * Terminal log line — replaces MessageBubble.
 * Pattern: [HH:MM:SS]  [icon?]  text…
 */
export function MessageLine({
  message,
  highlighted,
  onLongPress,
  onImagePress,
}: MessageLineProps) {
  const { colors } = useTheme();
  const { t } = useLocale();
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      reduceMotionRef.current = enabled;
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      reduceMotionRef.current = enabled;
    });
    return () => sub.remove();
  }, []);

  const isEdited = message.updatedAt > message.createdAt;
  const isVoice = useMemo(() => isVoiceMessage(message), [message]);
  const isImage = useMemo(() => isImageMessage(message), [message]);
  const TypeIcon =
    message.type === 'simple'
      ? null
      : TYPE_ICON[message.type as Exclude<MessageType, 'simple'>];

  const typeA11y =
    message.type === 'reminder'
      ? t.messageTypeReminder
      : message.type === 'alarm'
        ? t.messageTypeAlarm
        : message.type === 'periodic'
          ? t.messageTypePeriodic
          : message.type === 'image' || isImage
            ? t.messageTypeImage
            : isVoice
              ? t.messageTypeVoice
              : undefined;

  const handleLongPress = useCallback(() => {
    if (!reduceMotionRef.current && getSettings().hapticEnabled) {
      hapticLongPress();
    }
    onLongPress(message);
  }, [message, onLongPress]);

  const accessibilityLabel = [
    formatLogTime(message.createdAt),
    typeA11y,
    isVoice ? undefined : message.body,
    isEdited ? t.edited : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Animated.View
      entering={FadeInUp.springify().damping(18).stiffness(220)}
      exiting={FadeOutDown.duration(200)}
      layout={Layout.springify().damping(20).stiffness(200)}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onLongPress={handleLongPress}
        delayLongPress={300}
        android_ripple={
          Platform.OS === 'android' ? { color: colors.surfaceSoft } : undefined
        }
        style={({ pressed }) => [
          styles.row,
          {
            backgroundColor: highlighted
              ? colors.surfaceSoft
              : pressed && Platform.OS !== 'android'
                ? colors.surfaceSoft
                : 'transparent',
          },
        ]}>
        <Text variant="mono-meta" tone="muted" style={styles.time}>
          {formatLogTime(message.createdAt)}
        </Text>

        <View style={styles.content}>
          {isVoice ? (
            <View style={styles.mediaBlock}>
              {TypeIcon ? (
                <View style={styles.typeIcon} accessibilityLabel={typeA11y}>
                  <TypeIcon size={14} color={colors.muted} />
                </View>
              ) : null}
              <VoiceMessage message={message} />
            </View>
          ) : isImage ? (
            <View style={styles.textRow}>
              {TypeIcon ? (
                <View style={styles.typeIcon} accessibilityLabel={typeA11y}>
                  <TypeIcon size={14} color={colors.muted} />
                </View>
              ) : null}
              <View style={styles.mediaBody}>
                <ImageMessage message={message} onPress={onImagePress} />
              </View>
            </View>
          ) : (
            <View style={styles.textRow}>
              {TypeIcon ? (
                <View style={styles.typeIcon} accessibilityLabel={typeA11y}>
                  <TypeIcon size={14} color={colors.ink} />
                </View>
              ) : null}
              <Text variant="body" tone="body" style={styles.body}>
                {message.body}
                {isEdited ? (
                  <Text variant="mono-meta" tone="muted">
                    {` (${t.edited})`}
                  </Text>
                ) : null}
              </Text>
            </View>
          )}
          {(isVoice || isImage) && isEdited ? (
            <Text variant="mono-meta" tone="muted" style={styles.editedAlone}>
              ({t.edited})
            </Text>
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  time: {
    // Fixed-ish column for wrap indent under text (mono tabular).
    minWidth: 88,
    marginTop: 3,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  typeIcon: {
    marginTop: 4,
    width: 14,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    flexShrink: 1,
  },
  mediaBlock: {
    gap: spacing.xs,
    width: '100%',
    maxWidth: '100%',
  },
  mediaBody: {
    flex: 1,
    minWidth: 0,
  },
  editedAlone: {
    marginTop: spacing.xxs,
  },
});
