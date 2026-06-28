import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Modal,
  View,
  Pressable,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme, useLocale } from '../../shared/config';
import { Text } from '../../shared/ui';

const ACCENT = '#4A9EFF';

type Props = {
  visible: boolean;
  value?: number;
  onConfirm: (intervalMinutes: number) => void;
  onCancel: () => void;
};

export function PeriodPicker({ visible, value, onConfirm, onCancel }: Props) {
  const { text, background } = useTheme();
  const { t } = useLocale();

  const PRESETS = useMemo(() => [
    { label: t.every5Min, value: 5 },
    { label: t.every10Min, value: 10 },
    { label: t.every15Min, value: 15 },
    { label: t.everyHour, value: 60 },
    { label: t.everyDay, value: 1440 },
  ] as const, [t]);

  const [selected, setSelected] = useState<number | null>(value ?? null);
  const [customText, setCustomText] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      if (value && PRESETS.some((p) => p.value === value)) {
        setSelected(value);
        setCustomText('');
      } else if (value) {
        setSelected(null);
        setCustomText(String(value));
      } else {
        setSelected(null);
        setCustomText('');
      }
    }
  }, [visible, value, PRESETS]);

  const handlePresetPress = useCallback((minutes: number) => {
    setSelected(minutes);
    setCustomText('');
  }, []);

  const handleCustomChange = useCallback((text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setCustomText(cleaned);
    setSelected(null);
  }, []);

  const customMinutes = customText ? parseInt(customText, 10) : 0;
  const canConfirm = selected !== null || (customMinutes > 0);

  const handleConfirm = useCallback(() => {
    const minutes = selected ?? customMinutes;
    if (minutes > 0) {
      onConfirm(minutes);
    }
  }, [selected, customMinutes, onConfirm]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.overlay} onPress={onCancel}>
          <Pressable style={[styles.card, { backgroundColor: background }]} onPress={() => {}}>
            <Text variant="body" style={[styles.title, { color: text }]}>
              {t.periodicity}
            </Text>

            {/* Presets */}
            <View style={styles.presets}>
              {PRESETS.map((preset) => {
                const isActive = selected === preset.value;
                return (
                  <Pressable
                    key={preset.value}
                    onPress={() => handlePresetPress(preset.value)}
                    style={[
                      styles.presetBtn,
                      {
                        borderColor: isActive ? ACCENT : text + '33',
                        backgroundColor: isActive ? ACCENT + '15' : 'transparent',
                      },
                    ]}
                  >
                    <Text
                      variant="body"
                      style={{ color: isActive ? ACCENT : text, fontWeight: isActive ? '700' : '400' }}
                    >
                      {preset.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Custom interval */}
            <View style={styles.customRow}>
              <Text variant="body" style={{ color: `${text}99` }}>
                {t.customInterval}
              </Text>
              <View style={styles.inputWrap}>
                <TextInput
                  ref={inputRef}
                  value={customText}
                  onChangeText={handleCustomChange}
                  placeholder={t.minutes}
                  placeholderTextColor={`${text}40`}
                  keyboardType="number-pad"
                  style={[styles.input, { color: text, borderColor: customText ? ACCENT : text + '33' }]}
                  maxLength={4}
                />
                <Text variant="caption" style={{ color: `${text}66`, marginLeft: 6 }}>{t.minutes}</Text>
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttons}>
              <Pressable onPress={onCancel} style={styles.btn}>
                <Text variant="body" style={{ color: `${text}99` }}>{t.cancel}</Text>
              </Pressable>
              <Pressable
                onPress={handleConfirm}
                style={[styles.btn, { opacity: canConfirm ? 1 : 0.4 }]}
                disabled={!canConfirm}
              >
                <Text variant="body" style={{ color: ACCENT, fontWeight: '700' }}>{t.done}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 16,
  },
  presets: {
    gap: 8,
    marginBottom: 20,
  },
  presetBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 70,
    textAlign: 'center',
    fontSize: 16,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    gap: 24,
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
});
