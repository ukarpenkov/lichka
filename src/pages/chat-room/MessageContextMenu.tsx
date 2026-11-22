import React, { useEffect, useState } from 'react';
import { Pressable, Platform, type StyleProp, type TextStyle } from 'react-native';
import { CalendarDays, Clock, Copy, Pencil, Stop, Trash2 } from '../../shared/ui/pixel';
import { HardMenu, Text, hardMenuStyles } from '../../shared/ui';
import { useTheme, useLocale } from '../../shared/config';

type MessageContextMenuProps = {
  visible: boolean;
  /** Remount Modal when reopening after blur / stuck native state. */
  presentationKey?: string | number;
  onCopy: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStopReminder?: () => void;
  onSnoozeHour?: () => void;
  onSnoozeDay?: () => void;
  onClose: () => void;
};

type IconComponent = React.ComponentType<{ size?: number; color?: string }>;

/** Ignore presses that arrive from the long-press that opened the menu. */
const MENU_ARM_MS = 350;

function MenuItem({
  armed,
  rippleColor,
  pressedColor,
  icon: Icon,
  iconColor,
  label,
  labelStyle,
  onPress,
}: {
  armed: boolean;
  rippleColor: string;
  pressedColor: string;
  icon: IconComponent;
  iconColor: string;
  label: string;
  labelStyle?: StyleProp<TextStyle>;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={
        Platform.OS === 'android' ? { color: rippleColor } : undefined
      }
      style={({ pressed }) => [
        hardMenuStyles.item,
        pressed && armed && Platform.OS !== 'android'
          ? { backgroundColor: pressedColor }
          : null,
      ]}
      accessibilityRole="menuitem"
      accessibilityState={{ disabled: !armed }}
    >
      <Icon size={18} color={iconColor} />
      <Text variant="body" style={labelStyle}>{label}</Text>
    </Pressable>
  );
}

// RN Pressable: Modal is outside app GestureHandlerRootView; RNGH pressables often miss onPress.
export function MessageContextMenu({
  visible,
  presentationKey,
  onCopy,
  onEdit,
  onDelete,
  onStopReminder,
  onSnoozeHour,
  onSnoozeDay,
  onClose,
}: MessageContextMenuProps) {
  const { colors } = useTheme();
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
    <HardMenu
      visible={visible}
      presentationKey={presentationKey}
      statusBarTranslucent
      onClose={onClose}
      onBackdropPress={() => {
        if (!armed) return;
        onClose();
      }}
      backdropAccessibilityRole="button"
      absorbContentPresses
      menuAccessibilityRole="menu"
    >
      <MenuItem
        armed={armed}
        rippleColor={colors.surfaceSoft}
        pressedColor={colors.surfaceSoft}
        icon={Copy}
        iconColor={colors.ink}
        label={t.copy}
        onPress={() => runWhenArmed(onCopy)}
      />
      <MenuItem
        armed={armed}
        rippleColor={colors.surfaceSoft}
        pressedColor={colors.surfaceSoft}
        icon={Pencil}
        iconColor={colors.ink}
        label={t.edit}
        onPress={() => runWhenArmed(onEdit)}
      />
      {onSnoozeHour ? (
        <MenuItem
          armed={armed}
          rippleColor={colors.surfaceSoft}
          pressedColor={colors.surfaceSoft}
          icon={Clock}
          iconColor={colors.ink}
          label={t.snoozeHour}
          labelStyle={hardMenuStyles.itemLabel}
          onPress={() => runWhenArmed(onSnoozeHour)}
        />
      ) : null}
      {onSnoozeDay ? (
        <MenuItem
          armed={armed}
          rippleColor={colors.surfaceSoft}
          pressedColor={colors.surfaceSoft}
          icon={CalendarDays}
          iconColor={colors.ink}
          label={t.snoozeDay}
          labelStyle={hardMenuStyles.itemLabel}
          onPress={() => runWhenArmed(onSnoozeDay)}
        />
      ) : null}
      {onStopReminder ? (
        <MenuItem
          armed={armed}
          rippleColor={colors.surfaceSoft}
          pressedColor={colors.surfaceSoft}
          icon={Stop}
          iconColor={colors.ink}
          label={t.stopReminder}
          labelStyle={hardMenuStyles.itemLabel}
          onPress={() => runWhenArmed(onStopReminder)}
        />
      ) : null}
      <MenuItem
        armed={armed}
        rippleColor={colors.surfaceSoft}
        pressedColor={colors.surfaceSoft}
        icon={Trash2}
        iconColor={colors.destructive}
        label={t.delete}
        labelStyle={{ color: colors.destructive }}
        onPress={() => runWhenArmed(onDelete)}
      />
    </HardMenu>
  );
}
