import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, TextInput, Pressable, StyleSheet, AccessibilityInfo, Linking, Image } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme, useLocale } from '../../shared/config';
import { IconButton, Text, AlertDialog, AlarmClockIcon, MicIcon } from '../../shared/ui';
import { createMessage, type MessageType } from '../../entities/message';
import { getSettings } from '../../entities/settings';
import {
  scheduleNotification,
  ensureExactAlarmPermission,
  requestBatteryOptimizationExemption,
} from '../../features/notifications';
import { useVoiceRecorder, requestMicrophonePermission } from '../../features/voice-record';
import { Send, Bell, Repeat, X, Square, Paperclip } from 'lucide-react-native';
import {
  hapticTap,
  hapticLongPress,
  hapticSuccess,
  playSendSound,
  useKeyboardHeight,
  KEYBOARD_COMPOSER_GAP,
  generateId,
  pickAndCompressImage,
  saveImage,
} from '../../shared/lib';
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
  const keyboardHeight = useKeyboardHeight();
  const [body, setBody] = useState('');
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
  const [pickerDate, setPickerDate] = useState(new Date());
  const [intervalVisible, setIntervalVisible] = useState(false);
  const [permissionDialog, setPermissionDialog] = useState(false);
  const [alarmGuideVisible, setAlarmGuideVisible] = useState(false);
  const [imagePreview, setImagePreview] = useState<{ uri: string; width: number; height: number } | null>(null);
  const [imageErrorDialog, setImageErrorDialog] = useState(false);

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

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    paddingBottom: keyboardHeight.value > 0 ? 0 : 12,
    transform: [
      {
        translateY:
          keyboardHeight.value > 0 ? -KEYBOARD_COMPOSER_GAP : 0,
      },
    ],
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
    async (type: 'simple' | 'reminder' | 'alarm' | 'periodic', opts?: { scheduledAt?: string; intervalMinutes?: number }) => {
      const textBody = body.trim();
      if (!textBody && !imagePreview) return;

      let payload: string | null = null;
      let msgId: string | undefined;

      if (imagePreview) {
        msgId = generateId();
        const savedPath = await saveImage(imagePreview.uri, msgId);
        payload = JSON.stringify({
          uri: savedPath,
          width: imagePreview.width,
          height: imagePreview.height,
        });
      }

      const hasImage = payload !== null;
      const finalBody = textBody || (hasImage ? t.imageMessage(imagePreview!.width, imagePreview!.height) : '');
      if (!finalBody) return;

      const finalType: MessageType = (type === 'simple' && hasImage) ? 'image' : type;

      const msg = createMessage(
        chatId,
        finalType,
        finalBody,
        opts?.scheduledAt ?? null,
        opts?.intervalMinutes ?? null,
        payload,
        msgId,
      );

      if (finalType !== 'simple' && finalType !== 'image') {
        scheduleNotification(msg);
      }

      triggerHapticSuccess();
      triggerSendSound();
      setBody('');
      setImagePreview(null);
      onSent?.();
    },
    [body, imagePreview, chatId, onSent, t, triggerHapticSuccess, triggerSendSound],
  );

  const handleAttachImage = useCallback(async () => {
    try {
      const result = await pickAndCompressImage();
      if (result) {
        setImagePreview({ uri: result.uri, width: result.width, height: result.height });
      }
    } catch {
      setImageErrorDialog(true);
    }
  }, []);

  const handleRemoveImage = useCallback(() => {
    setImagePreview(null);
  }, []);

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
      if (pickerMode === 'alarm') {
        const hasSeen = await AsyncStorage.getItem('alarm_guide_shown');
        if (hasSeen === '1') {
          setPickerMode(null);
          const canSchedule = await ensureExactAlarmPermission();
          if (!canSchedule) {
            setPermissionDialog(true);
            return;
          }
          requestBatteryOptimizationExemption();
          sendMessage('alarm', { scheduledAt: date.toISOString() });
        } else {
          await AsyncStorage.setItem('alarm_guide_shown', '1');
          setAlarmGuideVisible(true);
          setPickerDate(date);
        }
        return;
      }
      if (pickerMode === 'reminder') {
        sendMessage('reminder', { scheduledAt: date.toISOString() });
      }
      setPickerMode(null);
    },
    [pickerMode, sendMessage],
  );

  const handleAlarmGuideConfirm = useCallback(async () => {
    setAlarmGuideVisible(false);
    setPickerMode(null);
    const canSchedule = await ensureExactAlarmPermission();
    if (!canSchedule) {
      setPermissionDialog(true);
      return;
    }
    requestBatteryOptimizationExemption();
    sendMessage('alarm', { scheduledAt: pickerDate.toISOString() });
  }, [sendMessage, pickerDate]);

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
      const relativeUri = result.uri.replace('file://', '').replace(`${DocumentDirectoryPath}/`, '');
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
    <Animated.View style={[styles.container, containerAnimatedStyle, { backgroundColor: background, borderTopColor: `${text}15` }]}>
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
    <Animated.View style={[styles.container, containerAnimatedStyle, { backgroundColor: background, borderTopColor: `${text}15` }]}>
      {imagePreview ? (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: imagePreview.uri }} style={styles.imagePreview} />
          <Pressable style={styles.removeImageBtn} onPress={handleRemoveImage}>
            <X size={18} color={text} />
          </Pressable>
        </View>
      ) : null}
      <View testID="composer-input-wrapper" style={[styles.inputWrapper, { borderColor: `${text}33` }]}>
          <TextInput
            style={[styles.input, { color: text }]}
            placeholder={imagePreview ? t.messagePlaceholder : t.messageInput}
            placeholderTextColor={`${text}66`}
            multiline
            textAlignVertical="center"
            value={body}
            onChangeText={setBody}
            maxLength={4000}
          />
          <IconButton icon={Paperclip} size={22} color={`${text}99`} onPress={handleAttachImage} onPressIn={triggerHapticTap} />
        </View>
        <View style={styles.actions}>
          {!imagePreview && (
            <AnimatedPressable
              onLongPress={handleMicLongPress}
              delayLongPress={300}
              style={styles.micBtn}>
              <MicIcon size={22} color={`${text}99`} />
            </AnimatedPressable>
          )}
          <IconButton icon={Repeat} size={22} color={`${text}99`} onPress={handlePeriodic} disabled={!imagePreview && !body.trim()} onPressIn={triggerHapticTap} />
          <IconButton icon={AlarmClockIcon} size={22} color={`${text}99`} onPress={handleAlarm} disabled={!imagePreview && !body.trim()} onPressIn={triggerHapticTap} />
          <IconButton icon={Bell} size={22} color={`${text}99`} onPress={handleReminder} disabled={!imagePreview && !body.trim()} onPressIn={triggerHapticTap} />
          <IconButton icon={Send} size={22} color={text} onPress={handleSend} disabled={!imagePreview && !body.trim()} onPressIn={triggerHapticTap} />
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

      <AlertDialog
        visible={alarmGuideVisible}
        title={t.exactAlarms}
        message={t.alarmPermissionsGuide}
        buttons={[
          { text: t.cancel, style: 'cancel', onPress: () => {
            setAlarmGuideVisible(false);
            setPickerMode(null);
          }},
          { text: t.done, onPress: handleAlarmGuideConfirm },
        ]}
        onClose={() => {
          setAlarmGuideVisible(false);
          setPickerMode(null);
        }}
      />

      <AlertDialog
        visible={imageErrorDialog}
        title={t.error}
        message={t.imagePickError}
        buttons={[
          { text: t.done, onPress: () => setImageErrorDialog(false) },
        ]}
        onClose={() => setImageErrorDialog(false)}
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 120,
    paddingVertical: 6,
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
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  imagePreview: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
