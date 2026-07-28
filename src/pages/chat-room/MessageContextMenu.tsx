import React from 'react';
import { Modal, Pressable, View, StyleSheet, Platform } from 'react-native';
import { Pencil, Trash2 } from '../../shared/ui/pixel';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Text, AnimatedPressable } from '../../shared/ui';
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

export function MessageContextMenu({ visible, onEdit, onDelete, onClose }: MessageContextMenuProps) {
  const { text, background, colors } = useTheme();
  const { t } = useLocale();

  return (
    <Modal visible={visible} transparent statusBarTranslucent onRequestClose={onClose}>
      <Animated.View
        entering={FadeIn.duration(150)}
        exiting={FadeOut.duration(100)}
        style={[styles.backdrop, { backgroundColor: colors.scrim }]}>
        <Pressable style={styles.backdropTouch} onPress={onClose}>
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
          </View>
        </Pressable>
      </Animated.View>
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
  backdropTouch: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
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
