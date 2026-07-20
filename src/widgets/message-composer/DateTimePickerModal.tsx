import React, { useState } from 'react';
import { Modal, View, Pressable, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme, useLocale } from '../../shared/config';
import { Text } from '../../shared/ui';
import { IconButton } from '../../shared/ui';
import { X } from '../../shared/ui/pixel';

type Props = {
  visible: boolean;
  value: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
};

export function DateTimePickerModal({ visible, value, onConfirm, onCancel }: Props) {
  const { text, background } = useTheme();
  const { t } = useLocale();
  const [step, setStep] = useState<'date' | 'time'>('date');
  const [selected, setSelected] = useState(value);

  const handleChange = (_event: unknown, date?: Date) => {
    if (date) setSelected(date);
  };

  const handleNext = () => {
    if (step === 'date') {
      setStep('time');
    }
  };

  const handleConfirm = () => {
    onConfirm(selected);
    setStep('date');
  };

  const handleCancel = () => {
    setSelected(value);
    setStep('date');
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <Pressable style={styles.overlay} onPress={handleCancel}>
        <Pressable style={[styles.card, { backgroundColor: background }]} onPress={() => {}}>
          <View style={styles.header}>
            <Text variant="body">
              {step === 'date' ? t.selectDate : t.selectTime}
            </Text>
            <IconButton icon={X} size={20} onPress={handleCancel} />
          </View>

          <DateTimePicker
            value={selected}
            mode={step}
            is24Hour
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleChange}
            textColor={text}
            themeVariant={background === '#000000' ? 'dark' : 'light'}
          />

          <View style={styles.buttons}>
            {step === 'date' ? (
              <Pressable style={[styles.btn, { borderColor: `${text}33` }]} onPress={handleNext}>
                <Text variant="body">{t.next}</Text>
              </Pressable>
            ) : (
              <>
                <Pressable
                  style={[styles.btn, { borderColor: `${text}33` }]}
                  onPress={() => setStep('date')}>
                  <Text variant="body">{t.back}</Text>
                </Pressable>
                <Pressable
                  style={[styles.btn, { borderColor: `${text}33`, marginLeft: 8 }]}
                  onPress={handleConfirm}>
                  <Text variant="body">{t.done}</Text>
                </Pressable>
              </>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '85%',
    borderRadius: 16,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  btn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
});
