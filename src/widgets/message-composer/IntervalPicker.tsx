import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Pressable, StyleSheet, TextInput } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView, type BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { useTheme } from '../../shared/config';
import { Text } from '../../shared/ui';
import { IconButton } from '../../shared/ui';
import { X } from 'lucide-react-native';

const PRESETS = [
  { label: '15 мин', minutes: 15 },
  { label: '30 мин', minutes: 30 },
  { label: '1 час', minutes: 60 },
  { label: '2 часа', minutes: 120 },
  { label: '6 часов', minutes: 360 },
  { label: '12 часов', minutes: 720 },
  { label: '24 часа', minutes: 1440 },
];

type Props = {
  visible: boolean;
  onConfirm: (minutes: number) => void;
  onCancel: () => void;
};

export function IntervalPicker({ visible, onConfirm, onCancel }: Props) {
  const { text, background } = useTheme();
  const modalRef = useRef<BottomSheetModal>(null);
  const [customValue, setCustomValue] = useState('');
  const snapPoints = useMemo(() => [50], []);

  useEffect(() => {
    if (visible) {
      setCustomValue('');
      modalRef.current?.present();
    } else {
      modalRef.current?.dismiss();
    }
  }, [visible]);

  const dismiss = useCallback(() => {
    modalRef.current?.dismiss();
    onCancel();
  }, [onCancel]);

  const handlePreset = useCallback(
    (minutes: number) => {
      modalRef.current?.dismiss();
      onConfirm(minutes);
    },
    [onConfirm],
  );

  const handleCustom = useCallback(() => {
    const mins = parseInt(customValue, 10);
    if (mins > 0) {
      modalRef.current?.dismiss();
      onConfirm(mins);
    }
  }, [customValue, onConfirm]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={modalRef}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: background }}
      handleIndicatorStyle={{ backgroundColor: `${text}60` }}
      onDismiss={onCancel}>
      <BottomSheetView style={styles.content}>
        <View style={styles.header}>
          <Text variant="body">Периодичность</Text>
          <IconButton icon={X} size={20} onPress={dismiss} />
        </View>

        {PRESETS.map((p) => (
          <Pressable
            key={p.minutes}
            style={[styles.row, { borderBottomColor: `${text}15` }]}
            onPress={() => handlePreset(p.minutes)}>
            <Text variant="body">{p.label}</Text>
          </Pressable>
        ))}

        <View style={styles.customRow}>
          <TextInput
            style={[styles.input, { color: text, borderColor: `${text}33` }]}
            placeholder="Своё значение (мин)"
            placeholderTextColor={`${text}66`}
            keyboardType="numeric"
            value={customValue}
            onChangeText={setCustomValue}
          />
          <Pressable
            style={[styles.btn, { borderColor: `${text}33` }]}
            onPress={handleCustom}>
            <Text variant="body">OK</Text>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  row: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  btn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
});
