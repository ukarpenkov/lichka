import React from 'react';
import { Modal, Pressable, View, StyleSheet } from 'react-native';
import { Pencil, Trash2 } from 'lucide-react-native';
import { Text } from '../../shared/ui';
import { useTheme, useLocale } from '../../shared/config';

type MessageContextMenuProps = {
  visible: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
};

export function MessageContextMenu({ visible, onEdit, onDelete, onClose }: MessageContextMenuProps) {
  const { background, text } = useTheme();
  const { t } = useLocale();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={[styles.menu, { backgroundColor: background, borderColor: text + '30' }]}>
          <Pressable
            onPress={() => { onClose(); onEdit(); }}
            style={({ pressed }) => [styles.item, { opacity: pressed ? 0.7 : 1 }]}>
            <Pencil size={18} color={text} />
            <Text>{t.edit}</Text>
          </Pressable>
          <View style={[styles.divider, { backgroundColor: text + '20' }]} />
          <Pressable
            onPress={() => { onClose(); onDelete(); }}
            style={({ pressed }) => [styles.item, { opacity: pressed ? 0.7 : 1 }]}>
            <Trash2 size={18} color="#FF3B30" />
            <Text style={{ color: '#FF3B30' }}>{t.delete}</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});
