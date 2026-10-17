import React, { forwardRef, useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  StyleSheet,
  View,
  type ViewProps,
} from 'react-native';

import { InsetsProbe, type OverlapEvent } from './KeyboardInsetsNative';

type Props = ViewProps & {
  /** Preserve the chat's existing visual gap, only while it actually overlaps the IME. */
  keyboardGap?: number;
  onKeyboardInsetChange?: (inset: number) => void;
};

/** The outer bounds never shrink from our spacer, so measurement cannot feed back on itself. */
export const KeyboardAwareView = forwardRef<View, Props>(function KeyboardAwareViewComponent(
  { children, keyboardGap = 0, onKeyboardInsetChange, ...props }, ref,
) {
  const [overlap, setOverlap] = useState(0);
  const onOverlap = useCallback(({ nativeEvent }: OverlapEvent) => {
    const next = Number.isFinite(nativeEvent.overlap) ? Math.max(0, nativeEvent.overlap) : 0;
    setOverlap(next);
    onKeyboardInsetChange?.(next > 0 ? next + keyboardGap : 0);
  }, [keyboardGap, onKeyboardInsetChange]);
  const keyboardInset = overlap > 0 ? overlap + keyboardGap : 0;

  if (!InsetsProbe) {
    return <KeyboardAvoidingView {...props} behavior="padding">{children}</KeyboardAvoidingView>;
  }

  return (
    <View {...props} ref={ref} collapsable={false}>
      <InsetsProbe
        testID="keyboard-insets-probe"
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        onKeyboardOverlap={onOverlap}
      />
      <View style={styles.content}>{children}</View>
      <View
        testID="keyboard-inset-spacer"
        style={[styles.spacer, { height: keyboardInset }]}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  content: { flex: 1, minHeight: 0 },
  spacer: { flexShrink: 0 },
});
