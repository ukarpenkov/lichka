import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, TextInput, Pressable, StyleSheet, AccessibilityInfo } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { useTheme } from '../../shared/config';
import { IconButton, Text } from '../../shared/ui';
import { createMessage } from '../../entities/message';
import { getSettings } from '../../entities/settings';
import {
  scheduleNotification,
  ensureExactAlarmPermission,
  requestBatteryOptimizationExemption,
} from '../../features/notifications';
import { useVoiceRecorder, requestMicrophonePermission } from '../../features/voice-record';
import { Send, Bell, AlarmClock, Repeat, Mic, X, Square } from 'lucide-react-native';
import { hapticTap, hapticLongPress, hapticSuccess, playSendSound } from '../../shared/lib';

import { DateTimePicker } from '../datetime-picker';
import { PeriodPicker } from '../period-picker';
import { DocumentDirectoryPath } from 'react-native-fs';

type Props = {
  chatId: string;
  onSent?: () => void;
};

type PickerMode = 'reminder' | 'alarm' | null;

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function MessageComposer({ chatId, onSent }: Props) {
  const { text, background } = useTheme();
  const [body, setBody] = useState('');
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
  const [pickerDate, setPickerDate] = useState(new Date());
  const [intervalVisible, setIntervalVisible] = useState(false);

  const { isRecording, durationMs, startRecording, stopRecording, cancelRecording } =
    useVoiceRecorder();

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

  // Animation values for recording indicator
  const dotScale = useSharedValue(1);
  const recOpacity = useSharedValue(0);

  const dotAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale.value }],
  }));

  const recRowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: recOpacity.value,
  }));

  const triggerHapticTap = useCallback(() => {
    if (reduceMotionRef.current) return;
    if (!getSettings().hapticEnabled) return;
    hapticTap();
  }, []);

  const triggerHapticSuccess = useCallback(() => {
    if (reduceMotionRef.current) return;
    if (!getSettings().hapticEnabled) return;
    hapticSuccess();
  }, []);

  const triggerHapticLongPress = useCallback(() => {
    if (reduceMotionRef.current) return;
    if (!getSettings().hapticEnabled) return;
    hapticLongPress();
  }, []);

  const triggerSendSound = useCallback(() => {
    if (!getSettings().soundEnabled) return;
    playSendSound();
  }, []);

  const sendMessage = useCallback(
    (type: 'simple' | 'reminder' | 'alarm' | 'periodic', opts?: { scheduledAt?: string; intervalMinutes?: number; payload?: string }) => {
      const textBody = type === 'simple' ? body.trim() : body.trim() || '(без текста)';
      if (!textBody && type === 'simple') return;

      const msg = createMessage(chatId, type, textBody, opts?.scheduledAt ?? null, opts?.intervalMinutes ?? null, opts?.payload ?? null);
      if (type !== 'simple') {
        scheduleNotification(msg);
      }
      triggerHapticSuccess();
      triggerSendSound();
      setBody('');
      onSent?.();
    },
    [body, chatId, onSent, triggerHapticSuccess, triggerSendSound],
  );

  const handleSend = useCallback(() => {
    sendMessage('simple');
  }, [sendMessage]);

  const handleReminder = useCallback(() => {
    setPickerDate(new Date());
    setPickerMode('reminder');
  }, []);

  const handleAlarm = useCallback(() => {
    setPickerDate(new Date());
    setPickerMode('alarm');
  }, []);

  const handlePeriodic = useCallback(() => {
    setIntervalVisible(true);
  }, []);

  const handlePickerConfirm = useCallback(
    async (date: Date) => {
      if (pickerMode) {
        if (pickerMode === 'alarm') {
          const canSchedule = await ensureExactAlarmPermission();
          if (!canSchedule) {
            setPickerMode(null);
            return;
          }
          requestBatteryOptimizationExemption();
        }
        sendMessage(pickerMode, { scheduledAt: date.toISOString() });
      }
      setPickerMode(null);
    },
    [pickerMode, sendMessage],
  );

  const handlePickerCancel = useCallback(() => {
    setPickerMode(null);
  }, []);

  const handleIntervalConfirm = useCallback(
    (minutes: number) => {
      setIntervalVisible(false);
      sendMessage('periodic', { intervalMinutes: minutes });
    },
    [sendMessage],
  );

  const handleIntervalCancel = useCallback(() => {
    setIntervalVisible(false);
  }, []);

  const handleMicLongPress = useCallback(async () => {
    triggerHapticLongPress();
    const granted = await requestMicrophonePermission();
    if (!granted) return;

    const uri = await startRecording();
    if (uri) {
      // Start pulsating animation
      dotScale.value = withRepeat(
        withSequence(
          withSpring(1.3, { damping: 2, stiffness: 200 }),
          withSpring(1.0, { damping: 2, stiffness: 200 }),
        ),
        -1,
        true,
      );
      recOpacity.value = withSpring(1, { damping: 15, stiffness: 150 });
    }
  }, [startRecording, dotScale, recOpacity, triggerHapticLongPress]);

  const handleMicPressOut = useCallback(async () => {
    if (!isRecording) return;

    // Stop pulsating
    dotScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    recOpacity.value = withSpring(0, { damping: 15, stiffness: 150 });

    const result = await stopRecording();
    if (result && result.uri) {
      const relativeUri = result.uri.replace(`${DocumentDirectoryPath}/`, '');
      const payload = JSON.stringify({ uri: relativeUri });
      const durationSec = Math.round(result.durationMs / 1000);
      createMessage(chatId, 'simple', `[Голосовое ${durationSec}с]`, null, null, payload);
      onSent?.();
    }
  }, [isRecording, stopRecording, chatId, onSent, dotScale, recOpacity]);

  const handleCancelRecord = useCallback(async () => {
    dotScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    recOpacity.value = withSpring(0, { damping: 15, stiffness: 150 });
    await cancelRecording();
  }, [cancelRecording, dotScale, recOpacity]);

  // Recording mode UI
  if (isRecording) {
    return (
      <View style={[styles.container, { backgroundColor: background, borderTopColor: `${text}15` }]}>
        <Animated.View style={[styles.recordingRow, recRowAnimatedStyle]}>
          <View style={styles.recordingIndicator}>
            <Animated.View style={[styles.recDot, { backgroundColor: '#ff4444' }, dotAnimatedStyle]} />
            <Text variant="body">Запись {formatDuration(durationMs)}</Text>
          </View>
          <View style={styles.recordingActions}>
            <IconButton icon={X} size={22} color={`${text}99`} onPress={handleCancelRecord} />
            <Pressable style={[styles.stopBtn, { backgroundColor: text }]} onPress={handleMicPressOut}>
              <Square size={16} color={background} fill={background} />
            </Pressable>
          </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <>
      <View style={[styles.container, { backgroundColor: background, borderTopColor: `${text}15` }]}>
        <TextInput
          style={[styles.input, { color: text, borderColor: `${text}33` }]}
          placeholder="Сообщение..."
          placeholderTextColor={`${text}66`}
          multiline
          value={body}
          onChangeText={setBody}
          maxLength={4000}
        />
        <View style={styles.actions}>
          <IconButton icon={Send} size={22} color={body.trim() ? text : `${text}40`} onPress={handleSend} disabled={!body.trim()} onPressIn={triggerHapticTap} />
          <IconButton icon={Bell} size={22} color={`${text}99`} onPress={handleReminder} onPressIn={triggerHapticTap} />
          <IconButton icon={AlarmClock} size={22} color={`${text}99`} onPress={handleAlarm} onPressIn={triggerHapticTap} />
          <IconButton icon={Repeat} size={22} color={`${text}99`} onPress={handlePeriodic} onPressIn={triggerHapticTap} />
          <AnimatedPressable
            style={styles.micBtn}
            onLongPress={handleMicLongPress}
            delayLongPress={300}
          >
            <Mic size={22} color={`${text}99`} />
          </AnimatedPressable>
        </View>
      </View>

      <DateTimePicker
        visible={pickerMode !== null}
        value={pickerDate}
        onConfirm={handlePickerConfirm}
        onCancel={handlePickerCancel}
      />

      <PeriodPicker
        visible={intervalVisible}
        onConfirm={handleIntervalConfirm}
        onCancel={handleIntervalCancel}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 120,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 6,
  },
  micBtn: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  recordingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stopBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
