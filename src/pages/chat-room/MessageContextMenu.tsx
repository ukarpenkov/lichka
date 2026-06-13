import React from 'react';
import { Modal, Pressable, View, StyleSheet } from 'react-native';
import { Pencil, Trash2 } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Text } from '../../shared/ui';
import { AnimatedPressable } from '../../shared/ui';
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
    <Modal visible={visible} transparent statusBarTranslucent onRequestClose={onClose}>
      <Animated.View
        entering={FadeIn.duration(150)}
        exiting={FadeOut.duration(100)}
        style={styles.backdrop}>
        <Pressable style={styles.backdropTouch} onPress={onClose}>
          <View style={[styles.menu, { backgroundColor: background, borderColor: text + '30' }]}>
            <AnimatedPressable
              onPress={() => { onClose(); onEdit(); }}
              pressStyle={{ opacity: 0.7 }}>
              <View style={styles.item}>
                <Pencil size={18} color={text} />
                <Text>{t.edit}</Text>
              </View>
            </AnimatedPressable>
            <View style={[styles.divider, { backgroundColor: text + '20' }]} />
            <AnimatedPressable
              onPress={() => { onClose(); onDelete(); }}
              pressStyle={{ opacity: 0.7 }}>
              <View style={styles.item}>
                <Trash2 size={18} color="#FF3B30" />
                <Text style={{ color: '#FF3B30' }}>{t.delete}</Text>
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
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropTouch: {
    flex: 1,
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
