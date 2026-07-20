import React from 'react';
import { Modal, Pressable, View, StyleSheet, Platform } from 'react-native';
import { Pencil, Trash2 } from '../../shared/ui/pixel';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Text, AnimatedPressable } from '../../shared/ui';
import { useTheme, useLocale, radii } from '../../shared/config';

type MessageContextMenuProps = {
  visible: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
};

export function MessageContextMenu({ visible, onEdit, onDelete, onClose }: MessageContextMenuProps) {
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <Modal visible={visible} transparent statusBarTranslucent onRequestClose={onClose}>
      <Animated.View
        entering={FadeIn.duration(150)}
        exiting={FadeOut.duration(100)}
        style={[styles.backdrop, { backgroundColor: colors.scrim }]}>
        <Pressable style={styles.backdropTouch} onPress={onClose}>
          <View style={[styles.menu, { backgroundColor: colors.canvas }]}>
            <AnimatedPressable
              scaleTo={1}
              onPress={() => {
                onClose();
                onEdit();
              }}
              pressStyle={{ backgroundColor: colors.surfaceSoft }}
              {...(Platform.OS === 'android'
                ? { android_ripple: { color: colors.surfaceSoft } }
                : {})}>
              <View style={styles.item}>
                <Pencil size={18} color={colors.ink} />
                <Text variant="body">{t.edit}</Text>
              </View>
            </AnimatedPressable>
            <AnimatedPressable
              scaleTo={1}
              onPress={() => {
                onClose();
                onDelete();
              }}
              pressStyle={{ backgroundColor: colors.surfaceSoft }}
              {...(Platform.OS === 'android'
                ? { android_ripple: { color: colors.surfaceSoft } }
                : {})}>
              <View style={styles.item}>
                <Trash2 size={18} color={colors.destructive} />
                <Text variant="body" style={{ color: colors.destructive }}>
                  {t.delete}
                </Text>
              </View>
            </AnimatedPressable>
          </View>
        </Pressable>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropTouch: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
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
