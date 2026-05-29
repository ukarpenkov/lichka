import React, { useState, useCallback, useEffect } from 'react';
import { Modal, View, Pressable, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme, useLocale, formatScheduledAt, formatInterval } from '../../shared/config';
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

export function MessageEditor({ visible, message, onSave, onClose }: Props) {
  const { text, background } = useTheme();
  const { t, locale } = useLocale();

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
              {t.editMessage}
            </Text>

            <TextInput
              style={[styles.input, { color: text, borderColor: `${text}33` }]}
              value={body}
              onChangeText={setBody}
              multiline
              maxLength={4000}
              placeholder={t.messagePlaceholder}
              placeholderTextColor={`${text}66`}
              autoFocus
            />

            {isScheduled && (
              <View style={styles.timeRow}>
                <View style={styles.timeInfo}>
                  <CalendarClock size={16} color={`${text}99`} />
                  <Text variant="caption" style={{ color: `${text}99` }}>
                    {scheduledAt ? formatScheduledAt(scheduledAt, locale) : t.notSet}
                  </Text>
                </View>
                <Pressable onPress={() => setDatePickerVisible(true)} style={styles.changeBtn}>
                  <Text variant="caption" style={{ color: '#4A9EFF' }}>{t.change}</Text>
                </Pressable>
              </View>
            )}

            {isPeriodic && (
              <View style={styles.timeRow}>
                <View style={styles.timeInfo}>
                  <Repeat size={16} color={`${text}99`} />
                  <Text variant="caption" style={{ color: `${text}99` }}>
                    {intervalMinutes ? formatInterval(intervalMinutes, t) : t.notSet}
                  </Text>
                </View>
                <Pressable onPress={() => setPeriodPickerVisible(true)} style={styles.changeBtn}>
                  <Text variant="caption" style={{ color: '#4A9EFF' }}>{t.change}</Text>
                </Pressable>
              </View>
            )}

            <View style={styles.buttons}>
              <Pressable onPress={onClose} style={styles.btn}>
                <Text variant="body" style={{ color: `${text}99` }}>{t.cancel}</Text>
              </Pressable>
              <Pressable onPress={handleSave} style={styles.btn}>
                <Text variant="body" style={{ color: '#4A9EFF', fontWeight: '700' }}>{t.save}</Text>
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
