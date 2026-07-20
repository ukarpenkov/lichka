import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Clock, X } from '../../shared/ui/pixel';
import { Screen, Text, AlarmClockIcon, AnimatedPressable } from '../../shared/ui';
import { useTheme } from '../../shared/config';
import { fonts, spacing, fixedColors } from '../../shared/config/tokens';
import { hapticTap, hapticSuccess } from '../../shared/lib';
import type { RootStackParamList } from '../../app/types';

type AlarmRouteProp = RouteProp<RootStackParamList, 'Alarm'>;

const ICON_WRAPPER = 120;
const ICON_SIZE = 56;
const PULSE_DURATION = 2400;
const PULSE_DELAY = 800;
const SHAKE_DURATION = 600;
const SHAKE_DEG = 3;

export function AlarmScreen() {
  const navigation = useNavigation();
  const route = useRoute<AlarmRouteProp>();
  const { colors } = useTheme();

  const { body, chatTitle } = route.params ?? {};
  const label = body || chatTitle || 'Будильник';

  const [timeStr, setTimeStr] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });

  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date();
      setTimeStr(
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      );
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const pulse1Scale = useSharedValue(1);
  const pulse1Opacity = useSharedValue(1);
  const pulse2Scale = useSharedValue(1);
  const pulse2Opacity = useSharedValue(1);
  const shakeRotation = useSharedValue(0);

  const pulseCfg = useMemo(
    () => ({ duration: PULSE_DURATION, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
    [],
  );

  useEffect(() => {
    pulse1Scale.value = withRepeat(withTiming(1.5, pulseCfg), -1);
    pulse1Opacity.value = withRepeat(withTiming(0, pulseCfg), -1);
    pulse2Scale.value = withDelay(
      PULSE_DELAY,
      withRepeat(withTiming(1.5, pulseCfg), -1),
    );
    pulse2Opacity.value = withDelay(
      PULSE_DELAY,
      withRepeat(withTiming(0, pulseCfg), -1),
    );
    shakeRotation.value = withRepeat(
      withTiming(SHAKE_DEG, { duration: SHAKE_DURATION }),
      -1,
      true,
    );

    return () => {
      cancelAnimation(pulse1Scale);
      cancelAnimation(pulse1Opacity);
      cancelAnimation(pulse2Scale);
      cancelAnimation(pulse2Opacity);
      cancelAnimation(shakeRotation);
    };
  }, [pulse1Scale, pulse1Opacity, pulse2Scale, pulse2Opacity, shakeRotation, pulseCfg]);

  const pulse1AnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse1Scale.value }],
    opacity: pulse1Opacity.value,
  }));

  const pulse2AnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse2Scale.value }],
    opacity: pulse2Opacity.value,
  }));

  const shakeAnimStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${shakeRotation.value}deg` }],
  }));

  const handleDismiss = useCallback(() => {
    hapticSuccess();
    navigation.goBack();
  }, [navigation]);

  const handleSnooze = useCallback(() => {
    hapticTap();
    navigation.goBack();
  }, [navigation]);

  return (
    <Screen style={styles.screen}>
      <View style={styles.topBar}>
        <Text variant="caption" tone="muted">
          БУДИЛЬНИК
        </Text>
        <Text variant="mono-meta" tone="muted">
          {timeStr}
        </Text>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.iconWrapper}>
          <Animated.View
            style={[
              styles.pulseRing,
              { borderColor: colors.surfaceStrong },
              pulse1AnimStyle,
            ]}
          />
          <Animated.View
            style={[
              styles.pulseRing,
              { borderColor: colors.surfaceStrong },
              pulse2AnimStyle,
            ]}
          />
          <View
            style={[
              styles.iconRing,
              { backgroundColor: colors.surfaceStrong },
            ]}
          />
          <Animated.View style={[styles.iconCenter, shakeAnimStyle]}>
            <AlarmClockIcon color={colors.ink} size={ICON_SIZE} />
          </Animated.View>
        </View>

        <View style={styles.alarmInfo}>
          <Text tone="ink" style={styles.alarmTime}>
            {timeStr}
          </Text>
          <Text
            variant="body"
            tone="muted"
            style={styles.alarmLabel}
            numberOfLines={3}>
            {label}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <AnimatedPressable
          style={styles.textAction}
          scaleTo={0.96}
          onPress={handleDismiss}>
          <X color={fixedColors.destructive} size={18} />
          <Text
            variant="button"
            style={[styles.actionLabel, { color: fixedColors.destructive }]}>
            Отключить
          </Text>
        </AnimatedPressable>

        <AnimatedPressable
          style={styles.textAction}
          scaleTo={0.96}
          onPress={handleSnooze}>
          <Clock color={colors.muted} size={18} />
          <Text variant="button" tone="muted" style={styles.actionLabel}>
            Отложить · 5 мин
          </Text>
        </AnimatedPressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xl,
    paddingBottom: spacing.base,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 28,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxl,
  },
  iconWrapper: {
    width: ICON_WRAPPER,
    height: ICON_WRAPPER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: ICON_WRAPPER + 16,
    height: ICON_WRAPPER + 16,
    borderRadius: 9999,
    borderWidth: 1,
  },
  iconRing: {
    position: 'absolute',
    width: ICON_WRAPPER,
    height: ICON_WRAPPER,
    borderRadius: 9999,
  },
  iconCenter: {
    zIndex: 2,
  },
  alarmInfo: {
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.base,
  },
  /** Pixel display clock — Press Start 2P */
  alarmTime: {
    fontFamily: fonts.display,
    fontSize: 40,
    lineHeight: 56,
    letterSpacing: 0,
    textAlign: 'center',
  },
  alarmLabel: {
    textAlign: 'center',
  },
  actions: {
    alignItems: 'center',
    gap: spacing.xl,
    paddingBottom: spacing.lg,
  },
  textAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  actionLabel: {
    letterSpacing: 0,
  },
});
