import React from 'react';
import { Modal, Pressable, View, StyleSheet, Platform } from 'react-native';
import { Pencil, Trash2 } from '../../shared/ui/pixel';
import { Text } from '../../shared/ui';
import {
  useTheme,
  useLocale,
  radii,
  hardShadowOffset,
  hardBorderWidth,
  spacing,
} from '../../shared/config';

export type ChatContextMenuProps = {
  visible: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
};

export function ChatContextMenu({ visible, canDelete, onEdit, onDelete, onClose }: ChatContextMenuProps) {
  const { text, background, colors } = useTheme();
  const { t } = useLocale();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, { backgroundColor: colors.scrim }]} onPress={onClose}>
        <View style={styles.menuShadowWrap}>
          <View
            style={[
              styles.hardShadowLayer,
              { backgroundColor: text, borderRadius: radii.sm },
            ]}
          />
          <View
            style={[
              styles.menu,
              {
                backgroundColor: background,
                borderColor: text,
                borderWidth: hardBorderWidth,
                borderRadius: radii.sm,
              },
            ]}
          >
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
        </View>
      </Pressable>
    </Modal>
  );
}

const MENU_WIDTH = 220;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuShadowWrap: {
    position: 'relative',
    paddingRight: hardShadowOffset,
    paddingBottom: hardShadowOffset,
  },
  hardShadowLayer: {
    ...StyleSheet.absoluteFill,
    top: hardShadowOffset,
    left: hardShadowOffset,
    right: 0,
    bottom: 0,
  },
  menu: {
    width: MENU_WIDTH,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    gap: 12,
    minHeight: 56,
  },
});
