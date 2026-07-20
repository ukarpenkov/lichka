import React from 'react';
import { Modal, Pressable, View, StyleSheet, Platform } from 'react-native';
import { Pencil, Trash2 } from 'lucide-react-native';
import { Text } from '../../shared/ui';
import { useTheme, useLocale, radii } from '../../shared/config';

export type ChatContextMenuProps = {
  visible: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
};

export function ChatContextMenu({ visible, canDelete, onEdit, onDelete, onClose }: ChatContextMenuProps) {
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, { backgroundColor: colors.scrim }]} onPress={onClose}>
        <View style={[styles.menu, { backgroundColor: colors.canvas }]}>
          <Pressable
            onPress={() => {
              onClose();
              onEdit();
            }}
            android_ripple={
              Platform.OS === 'android' ? { color: colors.surfaceSoft } : undefined
            }
            style={({ pressed }) => [
              styles.item,
              pressed && Platform.OS !== 'android'
                ? { backgroundColor: colors.surfaceSoft }
                : null,
            ]}>
            <Pencil size={18} color={colors.ink} />
            <Text variant="body">{t.edit}</Text>
          </Pressable>
          {canDelete ? (
            <Pressable
              onPress={() => {
                onClose();
                onDelete();
              }}
              android_ripple={
                Platform.OS === 'android' ? { color: colors.surfaceSoft } : undefined
              }
              style={({ pressed }) => [
                styles.item,
                pressed && Platform.OS !== 'android'
                  ? { backgroundColor: colors.surfaceSoft }
                  : null,
              ]}>
              <Trash2 size={18} color={colors.destructive} />
              <Text variant="body" style={{ color: colors.destructive }}>
                {t.delete}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    width: 220,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 12,
    minHeight: 56,
  },
});
