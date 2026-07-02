import React from 'react';
import { Modal, View, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useTheme } from '../config';
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

export function AlertDialog({
  visible,
  title,
  message,
  buttons = [],
  onClose,
}: AlertDialogProps) {
  const { text, background } = useTheme();

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
        <Animated.View entering={FadeIn.duration(200)} style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          entering={ZoomIn.duration(200).springify().damping(18).stiffness(220)}
          style={[styles.card, { backgroundColor: background }]}
        >
          {title ? (
            <Text
              variant="body"
              style={[styles.title, { color: text }]}
            >
              {title}
            </Text>
          ) : null}

          {message ? (
            <Text
              variant="body"
              style={[styles.message, { color: text + 'CC' }]}
            >
              {message}
            </Text>
          ) : null}

          {buttons.length > 0 ? (
            <View
              style={[
                styles.buttonRow,
                { borderTopColor: text + '20' },
              ]}
            >
              {buttons.map((btn, i) => {
                const isLast = i === buttons.length - 1;
                return (
                  <Pressable
                    key={i}
                    style={[
                      styles.button,
                      !isLast && {
                        borderRightWidth: StyleSheet.hairlineWidth,
                        borderRightColor: text + '20',
                      },
                      buttons.length >= 3 && styles.buttonTall,
                    ]}
                    onPress={() => handlePress(btn)}
                  >
                    <Text
                      variant="body"
                      style={[
                        styles.buttonText,
                        {
                          color:
                            btn.style === 'destructive'
                              ? '#FF453A'
                              : btn.style === 'cancel'
                                ? text + '99'
                                : text,
                          fontWeight:
                            btn.style === 'cancel' ? '400' : '600',
                        },
                      ]}
                    >
                      {btn.text}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </Animated.View>
      </View>
    </Modal>
  );
}

const CARD_BORDER_RADIUS = 14;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  card: {
    width: 280,
    borderRadius: CARD_BORDER_RADIUS,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    marginHorizontal: -20,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  buttonTall: {
    paddingVertical: 12,
  },
  buttonText: {
    fontSize: 15,
  },
});
