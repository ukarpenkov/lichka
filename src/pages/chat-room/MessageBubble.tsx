import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, View, AccessibilityInfo, Platform } from 'react-native';
import Animated, { FadeInUp, FadeOutDown, Layout } from 'react-native-reanimated';
import { Bell, Repeat, Image as ImageIcon } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme, useLocale, radii } from '../../shared/config';
import { withAlpha } from '../../shared/lib/color';
import { Text, AlarmClockIcon } from '../../shared/ui';
import { VoiceMessage } from '../../widgets/voice-message';
import { ImageMessage } from '../../widgets/image-message';
import { hapticLongPress } from '../../shared/lib';
import { getSettings } from '../../entities/settings';
import type { Message, MessageType } from '../../entities/message';

type MessageBubbleProps = {
  message: Message;
  highlighted?: boolean;
  onLongPress: (message: Message) => void;
  onImagePress?: (data: { uri: string; width: number; height: number }) => void;
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
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

const TYPE_ICON: Record<Exclude<MessageType, 'simple'>, LucideIcon | typeof AlarmClockIcon | null> = {
  reminder: Bell,
  alarm: AlarmClockIcon,
  periodic: Repeat,
  image: ImageIcon,
};

export function MessageBubble({ message, highlighted, onLongPress, onImagePress }: MessageBubbleProps) {
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
    message.type === 'simple' ? null : TYPE_ICON[message.type as Exclude<MessageType, 'simple'>];

  const bubbleFill = highlighted ? withAlpha(colors.ink, 0.18) : colors.surfaceStrong;

  const handleLongPress = useCallback(() => {
    if (!reduceMotionRef.current && getSettings().hapticEnabled) {
      hapticLongPress();
    }
    onLongPress(message);
  }, [message, onLongPress]);

  return (
    <Animated.View
      entering={FadeInUp.springify().damping(18).stiffness(220)}
      exiting={FadeOutDown.duration(200)}
      layout={Layout.springify().damping(20).stiffness(200)}>
      <Pressable
        onLongPress={handleLongPress}
        delayLongPress={300}
        android_ripple={
          Platform.OS === 'android' ? { color: colors.surfaceSoft } : undefined
        }
        style={({ pressed }) => [
          styles.bubble,
          {
            backgroundColor: bubbleFill,
            opacity: pressed && Platform.OS !== 'android' ? 0.92 : 1,
          },
          isImage && styles.bubbleImage,
        ]}
      >
        {isVoice ? (
          <VoiceMessage message={message} />
        ) : isImage ? (
          <ImageMessage message={message} onPress={onImagePress} />
        ) : (
          <Text variant="body" tone="ink">
            {message.body}
          </Text>
        )}
        <View style={styles.metaRow}>
          {isEdited && (
            <Text variant="micro" tone="muted" style={styles.edited}>
              {t.edited}
            </Text>
          )}
          {!isVoice && !isImage && TypeIcon ? (
            <TypeIcon size={11} color={colors.mutedSoft} />
          ) : null}
          <Text variant="micro" tone="mutedSoft">
            {formatTime(message.createdAt)}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '80%',
    borderRadius: radii.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 2,
    marginHorizontal: 12,
  },
  bubbleImage: {
    overflow: 'hidden',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  edited: {
    fontStyle: 'italic',
  },
});
