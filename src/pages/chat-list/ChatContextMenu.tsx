import React from 'react';
import { Pressable, Platform } from 'react-native';
import { Pencil, Trash2 } from '../../shared/ui/pixel';
import { HardMenu, Text, hardMenuStyles } from '../../shared/ui';
import { useTheme, useLocale } from '../../shared/config';
import { hapticTap } from '../../shared/lib';

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
    <HardMenu visible={visible} onClose={onClose} onBackdropPress={onClose}>
      <Pressable
        onPress={() => {
          hapticTap();
          onClose();
          onEdit();
        }}
        android_ripple={
          Platform.OS === 'android' ? { color: colors.surfaceSoft } : undefined
        }
        style={({ pressed }) => [
          hardMenuStyles.item,
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
            hapticTap();
            onClose();
            onDelete();
          }}
          android_ripple={
            Platform.OS === 'android' ? { color: colors.surfaceSoft } : undefined
          }
          style={({ pressed }) => [
            hardMenuStyles.item,
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
    </HardMenu>
  );
}
