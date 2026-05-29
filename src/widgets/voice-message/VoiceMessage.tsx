import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Play, Pause } from 'lucide-react-native';
import { useTheme } from '../../shared/config';
import { IconButton } from '../../shared/ui';
import { Text } from '../../shared/ui';
import { resolveMediaPath } from '../../shared/lib';
import { useVoicePlayer } from '../../features/voice-play';
import { WaveformBar } from './WaveformBar';
import type { Message } from '../../entities/message';

type VoiceMessageProps = {
  message: Message;
};

/** Extract duration in seconds from body like "[voice:5]" (neutral format) */
function parseDuration(body: string): number {
  const match = body.match(/\[voice:(\d+)\]/);
  return match ? parseInt(match[1], 10) : 0;
}

/** Extract relative URI from payload JSON */
function parseUri(payload: string | null): string | null {
  if (!payload) return null;
  try {
    const parsed = JSON.parse(payload);
    return typeof parsed.uri === 'string' ? parsed.uri : null;
  } catch {
    return null;
  }
}

/** Deterministic seed from message ID for consistent waveform */
function idToSeed(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function VoiceMessage({ message }: VoiceMessageProps) {
  const { text } = useTheme();
  const { isPlaying, isPaused, currentPositionMs, durationMs, play, pause } = useVoicePlayer();

  const relativeUri = useMemo(() => parseUri(message.payload), [message.payload]);
  const totalSec = useMemo(() => parseDuration(message.body), [message.body]);
  const seed = useMemo(() => idToSeed(message.id), [message.id]);

  const absoluteUri = useMemo(
    () => (relativeUri ? resolveMediaPath(relativeUri) : null),
    [relativeUri],
  );

  // Use real duration if available from player, otherwise parsed from body
  const effectiveDurationMs = durationMs > 0 ? durationMs : totalSec * 1000;
  const progress = effectiveDurationMs > 0 ? currentPositionMs / effectiveDurationMs : 0;

  const displaySeconds = isPlaying || isPaused
    ? Math.ceil((effectiveDurationMs - currentPositionMs) / 1000)
    : totalSec;

  const handlePress = async () => {
    if (!absoluteUri) return;
    if (isPlaying) {
      await pause();
    } else {
      await play(absoluteUri);
    }
  };

  if (!absoluteUri) {
    return (
      <Text variant="body" style={styles.fallback}>
        {message.body}
      </Text>
    );
  }

  return (
    <View style={styles.container}>
      <IconButton
        icon={isPlaying ? Pause : Play}
        size={20}
        color={text}
        onPress={handlePress}
      />
      <WaveformBar progress={progress} seed={seed} />
      <Text variant="caption" style={[styles.duration, { color: text + '60' }]}>
        {formatDuration(displaySeconds)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 200,
  },
  duration: {
    fontSize: 12,
    minWidth: 32,
    textAlign: 'right',
  },
  fallback: {
    fontSize: 15,
    lineHeight: 20,
  },
});
