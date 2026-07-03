import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, TextInput, Pressable, StyleSheet, AccessibilityInfo, Linking } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme, useLocale } from '../../shared/config';
import { IconButton, Text, AlertDialog, AlarmClockIcon, MicIcon } from '../../shared/ui';
import { createMessage } from '../../entities/message';
import { getSettings } from '../../entities/settings';
import {
  scheduleNotification,
  ensureExactAlarmPermission,
  requestBatteryOptimizationExemption,
} from '../../features/notifications';
import { useVoiceRecorder, requestMicrophonePermission } from '../../features/voice-record';
import { Send, Bell, Repeat, X, Square } from 'lucide-react-native';
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
  const { t } = useLocale();
  const [body, setBody] = useState('');
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
  const [pickerDate, setPickerDate] = useState(new Date());
  const [intervalVisible, setIntervalVisible] = useState(false);
  const [permissionDialog, setPermissionDialog] = useState(false);

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

  // Recording indicator animations
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
      const textBody = body.trim();
      if (!textBody) return;

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
            setPermissionDialog(true);
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

    dotScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    recOpacity.value = withSpring(0, { damping: 15, stiffness: 150 });

    const result = await stopRecording();
    if (result && result.uri) {
      const relativeUri = result.uri.replace(`${DocumentDirectoryPath}/`, '');
      const payload = JSON.stringify({ uri: relativeUri });
      const durationSec = Math.round(result.durationMs / 1000);
      createMessage(chatId, 'simple', t.voiceMessage(durationSec), null, null, payload);
      onSent?.();
    }
  }, [isRecording, stopRecording, chatId, onSent, dotScale, recOpacity, t]);

  const handleCancelRecord = useCallback(async () => {
    dotScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    recOpacity.value = withSpring(0, { damping: 15, stiffness: 150 });
    await cancelRecording();
  }, [cancelRecording, dotScale, recOpacity]);

  // Pan gesture for swipe-to-cancel during recording
  const panTranslateX = useSharedValue(0);
  const stopScale = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .onUpdate((e) => {
      panTranslateX.value = e.translationX;
      const progress = Math.min(Math.abs(e.translationX) / 100, 1);
      stopScale.value = 1 - progress * 0.3;
    })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > 100) {
        panTranslateX.value = withSpring(-300, { damping: 20, stiffness: 200 });
        runOnJS(handleCancelRecord)();
      } else {
        panTranslateX.value = withSpring(0, { damping: 15, stiffness: 200 });
      }
      stopScale.value = withSpring(1, { damping: 15, stiffness: 200 });
    });

  const panStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: panTranslateX.value }],
  }));

  const stopBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: stopScale.value }],
  }));

  if (isRecording) {
    return (
      <Animated.View style={[styles.container, { backgroundColor: background, borderTopColor: `${text}15` }]}>
        <Animated.View style={[styles.recordingRow, recRowAnimatedStyle]}>
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.recordingIndicator, panStyle]}>
              <Animated.View style={[styles.recDot, { backgroundColor: '#ff4444' }, dotAnimatedStyle]} />
              <Text variant="body">{t.recording(formatDuration(durationMs))}</Text>
              <Text variant="caption" style={{ color: text + '50', marginLeft: 8 }}>
                ← {t.cancel}
              </Text>
            </Animated.View>
          </GestureDetector>
          <View style={styles.recordingActions}>
            <IconButton icon={X} size={22} color={`${text}99`} onPress={handleCancelRecord} />
            <Animated.View style={stopBtnStyle}>
              <Pressable style={[styles.stopBtn, { backgroundColor: text }]} onPress={handleMicPressOut}>
                <Square size={16} color={background} fill={background} />
              </Pressable>
            </Animated.View>
          </View>
        </Animated.View>
      </Animated.View>
    );
  }

  return (
    <>
      <Animated.View style={[styles.container, { backgroundColor: background, borderTopColor: `${text}15` }]}>
        <TextInput
          style={[styles.input, { color: text, borderColor: `${text}33` }]}
          placeholder={t.messageInput}
          placeholderTextColor={`${text}66`}
          multiline
          value={body}
          onChangeText={setBody}
          maxLength={4000}
        />
        <View style={styles.actions}>
          <IconButton icon={Send} size={22} color={text} onPress={handleSend} disabled={!body.trim()} onPressIn={triggerHapticTap} />
          <IconButton icon={Bell} size={22} color={`${text}99`} onPress={handleReminder} disabled={!body.trim()} onPressIn={triggerHapticTap} />
          <IconButton icon={AlarmClockIcon} size={22} color={`${text}99`} onPress={handleAlarm} disabled={!body.trim()} onPressIn={triggerHapticTap} />
          <IconButton icon={Repeat} size={22} color={`${text}99`} onPress={handlePeriodic} disabled={!body.trim()} onPressIn={triggerHapticTap} />
          <AnimatedPressable
            onLongPress={handleMicLongPress}
            delayLongPress={300}
            style={styles.micBtn}>
            <MicIcon size={22} color={`${text}99`} />
          </AnimatedPressable>
        </View>
      </Animated.View>

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

      <AlertDialog
        visible={permissionDialog}
        title={t.exactAlarms}
        message={t.exactAlarmsMessage}
        buttons={[
          { text: t.cancel, style: 'cancel' },
          { text: t.openSettings, onPress: () => Linking.openSettings() },
        ]}
        onClose={() => setPermissionDialog(false)}
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
