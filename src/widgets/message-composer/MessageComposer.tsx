import React, { useCallback, useState } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../shared/config';
import { IconButton, Text } from '../../shared/ui';
import { createMessage } from '../../entities/message';
import { Send, Bell, AlarmClock, Repeat, Mic, X, Square } from 'lucide-react-native';

import { DateTimePicker } from '../datetime-picker';
import { PeriodPicker } from '../period-picker';
import { useVoiceRecorder } from './useVoiceRecorder';
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

export function MessageComposer({ chatId, onSent }: Props) {
  const { text, background } = useTheme();
  const [body, setBody] = useState('');
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
  const [pickerDate, setPickerDate] = useState(new Date());
  const [intervalVisible, setIntervalVisible] = useState(false);

  const { isRecording, durationMs, startRecording, stopRecording, cancelRecording } =
    useVoiceRecorder();

  const sendMessage = useCallback(
    (type: 'simple' | 'reminder' | 'alarm' | 'periodic', opts?: { scheduledAt?: string; intervalMinutes?: number; payload?: string }) => {
      const textBody = type === 'simple' ? body.trim() : body.trim() || '(без текста)';
      if (!textBody && type === 'simple') return;

      createMessage(chatId, type, textBody, opts?.scheduledAt ?? null, opts?.intervalMinutes ?? null, opts?.payload ?? null);
      setBody('');
      onSent?.();
    },
    [body, chatId, onSent],
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
    (date: Date) => {
      if (pickerMode) {
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

  const handleMic = useCallback(async () => {
    if (isRecording) {
      const result = await stopRecording();
      if (result && result.uri) {
        const relativeUri = result.uri.replace(`${DocumentDirectoryPath}/`, '');
        const payload = JSON.stringify({ uri: relativeUri });
        const durationSec = Math.round(result.durationMs / 1000);
        createMessage(chatId, 'simple', `[Голосовое ${durationSec}с]`, null, null, payload);
        onSent?.();
      }
    } else {
      await startRecording();
    }
  }, [isRecording, stopRecording, startRecording, chatId, onSent]);

  const handleCancelRecord = useCallback(async () => {
    await cancelRecording();
  }, [cancelRecording]);

  // Recording mode UI
  if (isRecording) {
    return (
      <View style={[styles.container, { backgroundColor: background, borderTopColor: `${text}15` }]}>
        <View style={styles.recordingRow}>
          <View style={styles.recordingIndicator}>
            <View style={[styles.recDot, { backgroundColor: '#ff4444' }]} />
            <Text variant="body">Запись {formatDuration(durationMs)}</Text>
          </View>
          <View style={styles.recordingActions}>
            <IconButton icon={X} size={22} color={`${text}99`} onPress={handleCancelRecord} />
            <Pressable style={[styles.stopBtn, { backgroundColor: text }]} onPress={handleMic}>
              <Square size={16} color={background} fill={background} />
            </Pressable>
          </View>
        </View>
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
          <IconButton icon={Send} size={22} color={body.trim() ? text : `${text}40`} onPress={handleSend} disabled={!body.trim()} />
          <IconButton icon={Bell} size={22} color={`${text}99`} onPress={handleReminder} />
          <IconButton icon={AlarmClock} size={22} color={`${text}99`} onPress={handleAlarm} />
          <IconButton icon={Repeat} size={22} color={`${text}99`} onPress={handlePeriodic} />
          <IconButton icon={Mic} size={22} color={`${text}99`} onPress={handleMic} />
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
