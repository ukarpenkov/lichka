import React from 'react';
import {
  Modal,
  Pressable,
  View,
  StyleSheet,
  type AccessibilityRole,
} from 'react-native';
import { useTheme } from '../config/ThemeProvider';
import {
  radii,
  hardShadowOffset,
  hardBorderWidth,
  spacing,
} from '../config/tokens';

type HardMenuProps = {
  visible: boolean;
  onClose: () => void;
  onBackdropPress: () => void;
  presentationKey?: string | number;
  statusBarTranslucent?: boolean;
  backdropAccessibilityRole?: AccessibilityRole;
  /** Keep presses on the panel from reaching the backdrop. */
  absorbContentPresses?: boolean;
  menuAccessibilityRole?: AccessibilityRole;
  children: React.ReactNode;
};

/** Centered hard-shadow menu used by chat and message context menus. */
export function HardMenu({
  visible,
  onClose,
  onBackdropPress,
  presentationKey,
  statusBarTranslucent,
  backdropAccessibilityRole,
  absorbContentPresses,
  menuAccessibilityRole,
  children,
}: HardMenuProps) {
  const { text, background, colors } = useTheme();

  const panel = (
    <>
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
        {children}
      </View>
    </>
  );

  return (
    <Modal
      key={presentationKey}
      visible={visible}
      transparent
      statusBarTranslucent={statusBarTranslucent}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={[styles.backdrop, { backgroundColor: colors.scrim }]}
        onPress={onBackdropPress}
        accessibilityRole={backdropAccessibilityRole}
      >
        {absorbContentPresses ? (
          <Pressable
            accessibilityRole={menuAccessibilityRole}
            onPress={() => {}}
            style={styles.menuShadowWrap}
          >
            {panel}
          </Pressable>
        ) : (
          <View style={styles.menuShadowWrap}>{panel}</View>
        )}
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
});

export const hardMenuStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    gap: 12,
    minHeight: 56,
  },
  itemLabel: {
    flexShrink: 1,
  },
});
