import React, { useEffect, useState } from 'react';
import { Modal, Pressable, View, StyleSheet, Platform } from 'react-native';
import { Copy, Pencil, Trash2 } from '../../shared/ui/pixel';
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
  /** Remount Modal when reopening after blur / stuck native state. */
  presentationKey?: string | number;
  onCopy: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
};

/** Ignore presses that arrive from the long-press that opened the menu. */
const MENU_ARM_MS = 350;

// RN Pressable: Modal is outside app GestureHandlerRootView; RNGH pressables often miss onPress.
export function MessageContextMenu({
  visible,
  presentationKey,
  onCopy,
  onEdit,
  onDelete,
  onClose,
}: MessageContextMenuProps) {
  const { text, background, colors } = useTheme();
  const { t } = useLocale();
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!visible) {
      setArmed(false);
      return;
    }
    const timer = setTimeout(() => setArmed(true), MENU_ARM_MS);
    return () => clearTimeout(timer);
  }, [visible, presentationKey]);

  const runWhenArmed = (action: () => void) => {
    if (!armed) return;
    onClose();
    action();
  };

  return (
    <Modal
      key={presentationKey}
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={[styles.backdrop, { backgroundColor: colors.scrim }]}
        onPress={() => {
          if (!armed) return;
          onClose();
        }}
        accessibilityRole="button"
      >
        {/* Absorb presses so they never reach the backdrop (esp. while items were disabled). */}
        <Pressable
          accessibilityRole="menu"
          onPress={() => {}}
          style={styles.menuShadowWrap}
        >
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
              onPress={() => runWhenArmed(onCopy)}
              android_ripple={
                Platform.OS === 'android' ? { color: colors.surfaceSoft } : undefined
              }
              style={({ pressed }) => [
                styles.item,
                pressed && armed && Platform.OS !== 'android'
                  ? { backgroundColor: colors.surfaceSoft }
                  : null,
              ]}
              accessibilityRole="menuitem"
              accessibilityState={{ disabled: !armed }}
            >
              <Copy size={18} color={colors.ink} />
              <Text variant="body">{t.copy}</Text>
            </Pressable>
            <Pressable
              onPress={() => runWhenArmed(onEdit)}
              android_ripple={
                Platform.OS === 'android' ? { color: colors.surfaceSoft } : undefined
              }
              style={({ pressed }) => [
                styles.item,
                pressed && armed && Platform.OS !== 'android'
                  ? { backgroundColor: colors.surfaceSoft }
                  : null,
              ]}
              accessibilityRole="menuitem"
              accessibilityState={{ disabled: !armed }}
            >
              <Pencil size={18} color={colors.ink} />
              <Text variant="body">{t.edit}</Text>
            </Pressable>
            <Pressable
              onPress={() => runWhenArmed(onDelete)}
              android_ripple={
                Platform.OS === 'android' ? { color: colors.surfaceSoft } : undefined
              }
              style={({ pressed }) => [
                styles.item,
                pressed && armed && Platform.OS !== 'android'
                  ? { backgroundColor: colors.surfaceSoft }
                  : null,
              ]}
              accessibilityRole="menuitem"
              accessibilityState={{ disabled: !armed }}
            >
              <Trash2 size={18} color={colors.destructive} />
              <Text variant="body" style={{ color: colors.destructive }}>
                {t.delete}
              </Text>
            </Pressable>
          </View>
        </Pressable>
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
