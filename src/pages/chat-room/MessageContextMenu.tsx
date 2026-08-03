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

type MessageContextMenuProps = {
  visible: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
};

// RN Pressable: Modal is outside app GestureHandlerRootView; RNGH pressables often miss onPress.
export function MessageContextMenu({ visible, onEdit, onDelete, onClose }: MessageContextMenuProps) {
  const { text, background, colors } = useTheme();
  const { t } = useLocale();

  return (
    <Modal visible={visible} transparent statusBarTranslucent onRequestClose={onClose}>
      <View style={[styles.backdrop, { backgroundColor: colors.scrim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" />
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
          </View>
        </View>
      </View>
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
