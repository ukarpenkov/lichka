import React from 'react';
import { Modal, View, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import {
  useTheme,
} from '../config';
import {
  radii,
  hardShadowOffset,
  hardBorderWidth,
  spacing,
} from '../config/tokens';
import { Text } from './Text';

export type AlertButton = {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
};

type AlertDialogProps = {
  visible: boolean;
  title?: string;
  message?: string;
  buttons?: AlertButton[];
  onClose: () => void;
};

const PRESS_TRANSLATE = 3;

function HardShadowButton({
  btn,
  fill,
  shadowColor,
  stretch,
  onPress,
}: {
  btn: AlertButton;
  fill: string;
  shadowColor: string;
  stretch: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const isDestructive = btn.style === 'destructive';
  const borderColor = isDestructive ? colors.destructive : shadowColor;
  const labelColor =
    btn.style === 'destructive'
      ? colors.destructive
      : btn.style === 'cancel'
        ? colors.muted
        : colors.ink;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.buttonSlot, stretch && styles.buttonSlotStretch]}
    >
      {({ pressed }) => (
        <View style={styles.hardShadowWrap}>
          <View
            style={[
              styles.hardShadowLayer,
              {
                backgroundColor: shadowColor,
                borderRadius: radii.sm,
                opacity: pressed ? 0 : 1,
              },
            ]}
          />
          <View
            style={[
              styles.hardShadowFace,
              {
                backgroundColor: fill,
                borderColor,
                borderWidth: hardBorderWidth,
                borderRadius: radii.sm,
                transform: pressed
                  ? [{ translateX: PRESS_TRANSLATE }, { translateY: PRESS_TRANSLATE }]
                  : undefined,
              },
            ]}
          >
            <Text
              variant={btn.style === 'cancel' ? 'body' : 'button'}
              style={{ color: labelColor, textAlign: 'center' }}
            >
              {btn.text}
            </Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

export function AlertDialog({
  visible,
  title,
  message,
  buttons = [],
  onClose,
}: AlertDialogProps) {
  const { text, background, colors } = useTheme();
  const stacked = buttons.length >= 3;

  const handlePress = (btn: AlertButton) => {
    btn.onPress?.();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          entering={FadeIn.duration(200)}
          style={[styles.backdrop, { backgroundColor: colors.scrim }]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          entering={ZoomIn.duration(200).springify().damping(18).stiffness(220)}
          style={styles.cardStack}
        >
          <View style={styles.hardShadowWrap}>
            <View
              style={[
                styles.hardShadowLayer,
                {
                  backgroundColor: text,
                  borderRadius: radii.sm,
                },
              ]}
            />
            <View
              style={[
                styles.card,
                {
                  backgroundColor: background,
                  borderColor: text,
                  borderWidth: hardBorderWidth,
                  borderRadius: radii.sm,
                },
              ]}
            >
              {title ? (
                <Text variant="title" tone="ink" style={styles.title}>
                  {title}
                </Text>
              ) : null}

              {message ? (
                <Text variant="body-sm" tone="muted" style={styles.message}>
                  {message}
                </Text>
              ) : null}

              {buttons.length > 0 ? (
                <View
                  style={[
                    styles.buttonRow,
                    stacked && styles.buttonColumn,
                  ]}
                >
                  {buttons.map((btn, i) => (
                    <HardShadowButton
                      key={i}
                      btn={btn}
                      fill={background}
                      shadowColor={text}
                      stretch={!stacked}
                      onPress={() => handlePress(btn)}
                    />
                  ))}
                </View>
              ) : null}
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const CARD_WIDTH = 280;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  cardStack: {
    width: CARD_WIDTH + hardShadowOffset,
  },
  card: {
    width: CARD_WIDTH,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    textAlign: 'center',
    marginBottom: spacing.base,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  buttonColumn: {
    flexDirection: 'column',
  },
  buttonSlot: {
    minHeight: 44,
  },
  buttonSlotStretch: {
    flex: 1,
  },
  hardShadowWrap: {
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
  hardShadowFace: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.sm,
    minHeight: 44,
  },
});
