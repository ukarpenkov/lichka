import React, { useState, useCallback, useEffect } from 'react';
import { Modal, View, Pressable, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme, useLocale, formatScheduledAt, formatInterval, radii } from '../../shared/config';
import { Text } from '../../shared/ui';
import { DateTimePicker } from '../../widgets/datetime-picker';
import { PeriodPicker } from '../../widgets/period-picker';
import type { Message } from '../../entities/message';
import type { EditFields } from '../../features/edit-message';
import { CalendarClock, Repeat } from '../../shared/ui/pixel';

type Props = {
  visible: boolean;
  message: Message | null;
  onSave: (fields: EditFields) => void;
  onClose: () => void;
};

export function MessageEditor({ visible, message, onSave, onClose }: Props) {
  const { colors } = useTheme();
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
        <Pressable style={[styles.backdrop, { backgroundColor: colors.scrim }]} onPress={onClose}>
          <Pressable
            style={[styles.card, { backgroundColor: colors.canvas }]}
            onPress={() => {}}>
            <Text variant="title" style={styles.title}>
              {t.editMessage}
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  color: colors.ink,
                  backgroundColor: colors.surfaceSoft,
                },
              ]}
              value={body}
              onChangeText={setBody}
              multiline
              maxLength={4000}
              placeholder={t.messagePlaceholder}
              placeholderTextColor={colors.mutedSoft}
              autoFocus
            />

            {isScheduled && (
              <View style={styles.timeRow}>
                <View style={styles.timeInfo}>
                  <CalendarClock size={16} color={colors.muted} />
                  <Text variant="body-sm" tone="muted">
                    {scheduledAt ? formatScheduledAt(scheduledAt, locale) : t.notSet}
                  </Text>
                </View>
                <Pressable onPress={() => setDatePickerVisible(true)} style={styles.changeBtn}>
                  <Text variant="button" tone="ink">
                    {t.change}
                  </Text>
                </Pressable>
              </View>
            )}

            {isPeriodic && (
              <View style={styles.timeRow}>
                <View style={styles.timeInfo}>
                  <Repeat size={16} color={colors.muted} />
                  <Text variant="body-sm" tone="muted">
                    {intervalMinutes ? formatInterval(intervalMinutes, t) : t.notSet}
                  </Text>
                </View>
                <Pressable onPress={() => setPeriodPickerVisible(true)} style={styles.changeBtn}>
                  <Text variant="button" tone="ink">
                    {t.change}
                  </Text>
                </Pressable>
              </View>
            )}

            <View style={styles.buttons}>
              <Pressable onPress={onClose} style={styles.btn}>
                <Text variant="button" tone="muted">
                  {t.cancel}
                </Text>
              </Pressable>
              <Pressable onPress={handleSave} style={styles.btn}>
                <Text variant="button" tone="ink">
                  {t.save}
                </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '85%',
    borderRadius: radii.lg,
    padding: 20,
  },
  title: {
    marginBottom: 16,
  },
  input: {
    borderRadius: radii.md,
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
    flex: 1,
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
