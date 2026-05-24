import React from 'react';
import { Modal, Pressable, View, StyleSheet } from 'react-native';
import { Text } from '../../shared/ui';
import { useTheme } from '../../shared/config';

export type ChatContextMenuProps = {
  visible: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
};

export function ChatContextMenu({ visible, onEdit, onDelete, onClose }: ChatContextMenuProps) {
  const { background, text } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={[styles.menu, { backgroundColor: background, borderColor: text + '30' }]}>
          <Pressable
            onPress={() => { onClose(); onEdit(); }}
            style={({ pressed }) => [styles.item, { opacity: pressed ? 0.7 : 1 }]}>
            <Text>Редактировать</Text>
          </Pressable>
          <View style={[styles.divider, { backgroundColor: text + '20' }]} />
          <Pressable
            onPress={() => { onClose(); onDelete(); }}
            style={({ pressed }) => [styles.item, { opacity: pressed ? 0.7 : 1 }]}>
            <Text style={{ color: '#FF3B30' }}>Удалить</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    width: 220,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  item: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});
