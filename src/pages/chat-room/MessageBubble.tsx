import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, View, AccessibilityInfo } from 'react-native';
import Animated, { FadeInUp, FadeOutDown, Layout } from 'react-native-reanimated';
import { Bell, Repeat } from 'lucide-react-native';
import { useTheme, useLocale } from '../../shared/config';
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

const TYPE_ICON: Record<Exclude<MessageType, 'simple'>, typeof Bell> = {
  reminder: Bell,
  alarm: undefined as any,
  periodic: Repeat,
  image: undefined as any,
};

export function MessageBubble({ message, highlighted, onLongPress }: MessageBubbleProps) {
  const { text } = useTheme();
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
  const TypeIcon = message.type === 'alarm' ? AlarmClockIcon : TYPE_ICON[message.type as keyof typeof TYPE_ICON];

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
        style={({ pressed }) => [
          styles.bubble,
          {
            backgroundColor: highlighted ? text + '25' : text + '12',
            opacity: pressed ? 0.85 : 1,
          },
          isImage && styles.bubbleImage,
        ]}
      >
        {isVoice ? (
          <VoiceMessage message={message} />
        ) : isImage ? (
          <ImageMessage message={message} />
        ) : (
          <Text variant="body" style={styles.body}>
            {message.body}
          </Text>
        )}
        <View style={styles.metaRow}>
          {isEdited && (
            <Text variant="caption" style={[styles.meta, styles.edited, { color: text + '60' }]}>
              {t.edited}
            </Text>
          )}
          {!isVoice && !isImage && TypeIcon && (
            <TypeIcon size={11} color={text + '50'} />
          )}
          <Text variant="caption" style={[styles.meta, { color: text + '50' }]}>
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
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 2,
    marginHorizontal: 12,
  },
  bubbleImage: {
    overflow: 'hidden',
  },
  body: {
    fontSize: 15,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  meta: {
    fontSize: 11,
  },
  edited: {
    fontStyle: 'italic',
  },
});
