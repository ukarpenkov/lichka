import React, { useCallback } from 'react';
import {
  Modal,
  View,
  Pressable,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Text } from '../../shared/ui';
import { monoWeight } from '../../shared/config';

const YEAR_START = 2020;
const YEAR_END = 2035;
const YEARS: number[] = [];
for (let y = YEAR_START; y <= YEAR_END; y++) YEARS.push(y);

type Props = {
  visible: boolean;
  selected: number;
  textColor: string;
  accentColor: string;
  background: string;
  onSelect: (year: number) => void;
  onClose: () => void;
};

export function YearGridModal({
  visible,
  selected,
  textColor,
  accentColor,
  background,
  onSelect,
  onClose,
}: Props) {
  const handleSelect = useCallback(
    (y: number) => {
      onSelect(y);
      onClose();
    },
    [onSelect, onClose],
  );

  const renderItem = useCallback(
    ({ item }: { item: number }) => {
      const active = item === selected;
      return (
        <Pressable
          style={[
            styles.yearBtn,
            { backgroundColor: active ? accentColor : `${textColor}11` },
          ]}
          onPress={() => handleSelect(item)}
        >
          <Text
            style={{
              color: active ? '#FFFFFF' : textColor,
              fontSize: 16,
              ...monoWeight(active ? 'bold' : 'medium'),
              textAlign: 'center',
            }}
          >
            {item}
          </Text>
        </Pressable>
      );
    },
    [selected, accentColor, textColor, handleSelect],
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.card, { backgroundColor: background }]}>
          <Text
            style={{
              fontSize: 18,
              ...monoWeight('bold'),
              color: textColor,
              textAlign: 'center',
              marginBottom: 16,
            }}
          >
            Select Year
          </Text>
          <FlatList
            data={YEARS}
            keyExtractor={(item) => `${item}`}
            renderItem={renderItem}
            numColumns={3}
            scrollEnabled={false}
            columnWrapperStyle={styles.row}
          />
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 16,
  },
  row: {
    gap: 8,
    marginBottom: 8,
    justifyContent: 'space-evenly',
  },
  yearBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
});
