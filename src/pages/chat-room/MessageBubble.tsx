import React, { useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '../../shared/config';
import { Text } from '../../shared/ui';
import { VoiceMessage } from '../../widgets/voice-message';
import type { Message } from '../../entities/message';

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

export function MessageBubble({ message, highlighted, onLongPress }: MessageBubbleProps) {
  const { text } = useTheme();

  const isEdited = message.updatedAt > message.createdAt;
  const isVoice = useMemo(() => isVoiceMessage(message), [message]);

  const handleLongPress = useCallback(() => {
    onLongPress(message);
  }, [message, onLongPress]);

  return (
    <Animated.View entering={FadeInUp.duration(250)}>
      <Pressable
        onLongPress={handleLongPress}
        delayLongPress={300}
        style={({ pressed }) => [
          styles.bubble,
          {
            backgroundColor: highlighted ? text + '25' : text + '12',
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        {isVoice ? (
          <VoiceMessage message={message} />
        ) : (
          <Text variant="body" style={styles.body}>
            {message.body}
          </Text>
        )}
        <View style={styles.metaRow}>
          {isEdited && (
            <Text variant="caption" style={[styles.meta, styles.edited, { color: text + '60' }]}>
              изменено
            </Text>
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
