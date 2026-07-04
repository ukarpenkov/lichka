import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  useWindowDimensions,
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
import { Clock } from 'lucide-react-native';
import { useTheme } from '../../shared/config';
import { Screen, Text, AlarmClockIcon, AnimatedPressable } from '../../shared/ui';
import { hapticTap, hapticSuccess } from '../../shared/lib';
import type { RootStackParamList } from '../../app/types';

type AlarmRouteProp = RouteProp<RootStackParamList, 'Alarm'>;

const ALARM_ICON_SIZE = 72;
const PULSE_DURATION = 2000;
const PULSE_DELAY = 600;

export function AlarmScreen() {
  const { text, background } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<AlarmRouteProp>();
  const { width: screenWidth } = useWindowDimensions();

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
  const shakeRotation = useSharedValue(-4);

  const pulseCfg = useMemo(
    () => ({ duration: PULSE_DURATION, easing: Easing.out(Easing.cubic) }),
    [],
  );

  useEffect(() => {
    pulse1Scale.value = withRepeat(withTiming(1.4, pulseCfg), -1);
    pulse1Opacity.value = withRepeat(withTiming(0, pulseCfg), -1);
    pulse2Scale.value = withDelay(
      PULSE_DELAY,
      withRepeat(withTiming(1.4, pulseCfg), -1),
    );
    pulse2Opacity.value = withDelay(
      PULSE_DELAY,
      withRepeat(withTiming(0, pulseCfg), -1),
    );
    shakeRotation.value = withRepeat(
      withTiming(4, { duration: 100 }),
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

  const borderColor = text + '14';
  const borderSubtle = text + '08';
  const iconRingBg = text + '0A';
  const accentDanger = '#FF6B6B';
  const iconColor = text + '88';
  const pulseBorderColor = text + '18';

  const wrapperSize = Math.min(screenWidth * 0.38, 148);

  return (
    <Screen style={styles.screen}>
      <View style={[styles.background, { backgroundColor: background }]} />

      <View style={styles.container}>
        <View style={styles.mainContent}>
          <View style={[styles.iconWrapper, { width: wrapperSize, height: wrapperSize }]}>
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  width: wrapperSize + 8,
                  height: wrapperSize + 8,
                  borderColor: pulseBorderColor,
                },
                pulse1AnimStyle,
              ]}
            />
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  width: wrapperSize + 8,
                  height: wrapperSize + 8,
                  borderColor: pulseBorderColor,
                },
                pulse2AnimStyle,
              ]}
            />
            <View
              style={[
                styles.iconRing,
                {
                  width: wrapperSize,
                  height: wrapperSize,
                  borderColor,
                  backgroundColor: iconRingBg,
                },
              ]}>
              <View
                style={[
                  styles.iconRingInner,
                  {
                    borderColor: borderSubtle,
                  },
                ]}
              />
            </View>
            <Animated.View style={[styles.iconCenter, shakeAnimStyle]}>
              <AlarmClockIcon color={iconColor} size={ALARM_ICON_SIZE} />
            </Animated.View>
          </View>

          <View style={styles.alarmInfo}>
            <Text style={styles.alarmTime}>{timeStr}</Text>
            <Text style={styles.alarmLabel} numberOfLines={2}>{label}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <AnimatedPressable
            style={styles.textAction}
            scaleTo={0.96}
            onPress={handleDismiss}>
            <Text
              style={[styles.actionLabel, { color: accentDanger }]}>
              Отключить
            </Text>
          </AnimatedPressable>

          <View style={[styles.divider, { backgroundColor: borderColor }]} />

          <AnimatedPressable
            style={styles.textAction}
            scaleTo={0.96}
            onPress={handleSnooze}>
            <Clock
              color={text + '99'}
              size={20}
              strokeWidth={2}
            />
            <Text
              style={[styles.actionLabel, { color: text + '99' }]}>
              Отложить · 5 мин
            </Text>
          </AnimatedPressable>
        </View>

        <View style={[styles.homeIndicator, { backgroundColor: text + '66' }]} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFill,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1,
  },
  iconRing: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRingInner: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1,
    width: '75%',
    height: '75%',
  },
  iconCenter: {
    zIndex: 2,
  },
  alarmInfo: {
    alignItems: 'center',
    gap: 8,
  },
  alarmTime: {
    fontSize: 56,
    fontWeight: '300',
    letterSpacing: -1.1,
    fontVariant: ['tabular-nums'],
  },
  alarmLabel: {
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: -0.3,
    lineHeight: 34,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  actions: {
    alignItems: 'center',
    gap: 28,
    paddingBottom: 24,
  },
  textAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100,
  },
  actionLabel: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  divider: {
    width: 40,
    height: 1,
    opacity: 0.6,
  },
  homeIndicator: {
    width: 120,
    height: 4,
    borderRadius: 100,
    alignSelf: 'center',
    marginTop: 8,
  },
});
