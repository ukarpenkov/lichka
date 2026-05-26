import React, { useState, useCallback, useEffect } from 'react';
import { Modal, View, Pressable, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../../shared/config';
import { Text } from '../../shared/ui';
import { DateTimePicker } from '../../widgets/datetime-picker';
import { PeriodPicker } from '../../widgets/period-picker';
import type { Message } from '../../entities/message';
import type { EditFields } from '../../features/edit-message';
import { CalendarClock, Repeat } from 'lucide-react-native';

type Props = {
  visible: boolean;
  message: Message | null;
  onSave: (fields: EditFields) => void;
  onClose: () => void;
};

function formatScheduledAt(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${day}.${month}.${year} ${h}:${m}`;
}

function formatInterval(minutes: number): string {
  if (minutes < 60) return `${minutes} мин`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} ч ${minutes % 60 ? minutes % 60 + ' мин' : ''}`.trim();
  return `${Math.floor(minutes / 1440)} дн`;
}

export function MessageEditor({ visible, message, onSave, onClose }: Props) {
  const { text, background } = useTheme();

  const [body, setBody] = useState('');
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
  const [intervalMinutes, setIntervalMinutes] = useState<number | null>(null);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [periodPickerVisible, setPeriodPickerVisible] = useState(false);

  useEffect(() => {
    if (visible && message) {
      setBody(message.body);
      setScheduledAt(message.scheduledAt);
      setIntervalMinutes(message.intervalMinutes);
    }
  }, [visible, message]);

  const handleSave = useCallback(() => {
    if (!message) return;

    const fields: EditFields = {};
    if (body !== message.body) fields.body = body;
    if (scheduledAt !== message.scheduledAt) fields.scheduledAt = scheduledAt;
    if (intervalMinutes !== message.intervalMinutes) fields.intervalMinutes = intervalMinutes;

    if (Object.keys(fields).length > 0) {
      onSave(fields);
    } else {
      onClose();
    }
  }, [message, body, scheduledAt, intervalMinutes, onSave, onClose]);

  const handleDateConfirm = useCallback((date: Date) => {
    setScheduledAt(date.toISOString());
    setDatePickerVisible(false);
  }, []);

  const handlePeriodConfirm = useCallback((minutes: number) => {
    setIntervalMinutes(minutes);
    setPeriodPickerVisible(false);
  }, []);

  if (!message) return null;

  const isScheduled = message.type === 'reminder' || message.type === 'alarm';
  const isPeriodic = message.type === 'periodic';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Pressable style={[styles.card, { backgroundColor: background }]} onPress={() => {}}>
            <Text variant="body" style={[styles.title, { color: text }]}>
              Редактировать
            </Text>

            <TextInput
              style={[styles.input, { color: text, borderColor: `${text}33` }]}
              value={body}
              onChangeText={setBody}
              multiline
              maxLength={4000}
              placeholder="Текст сообщения..."
              placeholderTextColor={`${text}66`}
              autoFocus
            />

            {isScheduled && (
              <View style={styles.timeRow}>
                <View style={styles.timeInfo}>
                  <CalendarClock size={16} color={`${text}99`} />
                  <Text variant="caption" style={{ color: `${text}99` }}>
                    {scheduledAt ? formatScheduledAt(scheduledAt) : 'Не задано'}
                  </Text>
                </View>
                <Pressable onPress={() => setDatePickerVisible(true)} style={styles.changeBtn}>
                  <Text variant="caption" style={{ color: '#4A9EFF' }}>Изменить</Text>
                </Pressable>
              </View>
            )}

            {isPeriodic && (
              <View style={styles.timeRow}>
                <View style={styles.timeInfo}>
                  <Repeat size={16} color={`${text}99`} />
                  <Text variant="caption" style={{ color: `${text}99` }}>
                    {intervalMinutes ? formatInterval(intervalMinutes) : 'Не задано'}
                  </Text>
                </View>
                <Pressable onPress={() => setPeriodPickerVisible(true)} style={styles.changeBtn}>
                  <Text variant="caption" style={{ color: '#4A9EFF' }}>Изменить</Text>
                </Pressable>
              </View>
            )}

            <View style={styles.buttons}>
              <Pressable onPress={onClose} style={styles.btn}>
                <Text variant="body" style={{ color: `${text}99` }}>Отмена</Text>
              </Pressable>
              <Pressable onPress={handleSave} style={styles.btn}>
                <Text variant="body" style={{ color: '#4A9EFF', fontWeight: '700' }}>Сохранить</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>

      <DateTimePicker
        visible={datePickerVisible}
        value={scheduledAt ? new Date(scheduledAt) : new Date()}
        onConfirm={handleDateConfirm}
        onCancel={() => setDatePickerVisible(false)}
      />

      <PeriodPicker
        visible={periodPickerVisible}
        value={intervalMinutes ?? undefined}
        onConfirm={handlePeriodConfirm}
        onCancel={() => setPeriodPickerVisible(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '85%',
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    minHeight: 80,
    maxHeight: 160,
    textAlignVertical: 'top',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  changeBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 24,
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
});
