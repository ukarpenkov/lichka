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
import { Clock, X } from 'lucide-react-native';
import { Screen, Text, AlarmClockIcon, AnimatedPressable } from '../../shared/ui';
import { hapticTap, hapticSuccess } from '../../shared/lib';
import type { RootStackParamList } from '../../app/types';

type AlarmRouteProp = RouteProp<RootStackParamList, 'Alarm'>;

const ICON_WRAPPER = 128;
const ICON_SIZE = 56;
const PULSE_DURATION = 2400;
const PULSE_DELAY = 800;
const SHAKE_DURATION = 600;
const SHAKE_DEG = 3;
const DESTRUCTIVE = '#ff5c5c';

export function AlarmScreen() {
  const navigation = useNavigation();
  const route = useRoute<AlarmRouteProp>();

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

  const dimmed = '#666666';
  const ringBorder = '#1e1e1e';
  const ringBg = '#0f0f0f';
  const pulseBorder = '#0AFFFFFF';
  const snoozeColor = '#555555';
  const dividerColor = '#1e1e1e';
  const homeIndicatorColor = '#333333';

  return (
    <Screen style={styles.screen}>
      <View style={styles.topBar}>
        <Text style={[styles.topBarLabel, { color: dimmed }]}>Будильник</Text>
        <Text style={[styles.statusTime, { color: dimmed }]}>{timeStr}</Text>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.iconWrapper}>
          <Animated.View
            style={[
              styles.pulseRing,
              { borderColor: pulseBorder },
              pulse1AnimStyle,
            ]}
          />
          <Animated.View
            style={[
              styles.pulseRing,
              { borderColor: pulseBorder },
              pulse2AnimStyle,
            ]}
          />
          <View
            style={[
              styles.iconRing,
              {
                borderColor: ringBorder,
                backgroundColor: ringBg,
              },
            ]}
          />
          <Animated.View style={[styles.iconCenter, shakeAnimStyle]}>
            <AlarmClockIcon color={text} size={ICON_SIZE} />
          </Animated.View>
        </View>

        <View style={styles.alarmInfo}>
          <Text style={styles.alarmTime}>{timeStr}</Text>
          <Text
            style={[styles.alarmLabel, { color: '#888888' }]}
            numberOfLines={2}>
            {label}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <AnimatedPressable
          style={styles.textAction}
          scaleTo={0.96}
          onPress={handleDismiss}>
          <X color={DESTRUCTIVE} size={18} strokeWidth={2.5} />
          <Text style={[styles.actionLabel, { color: DESTRUCTIVE }]}>
            Отключить
          </Text>
        </AnimatedPressable>

        <View style={[styles.divider, { backgroundColor: dividerColor }]} />

        <AnimatedPressable
          style={styles.textAction}
          scaleTo={0.96}
          onPress={handleSnooze}>
          <Clock color={snoozeColor} size={18} strokeWidth={2.5} />
          <Text style={[styles.actionLabel, { color: snoozeColor }]}>
            Отложить · 5 мин
          </Text>
        </AnimatedPressable>
      </View>

      <View style={[styles.homeIndicator, { backgroundColor: homeIndicatorColor }]} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 8,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  topBarLabel: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  statusTime: {
    fontSize: 13,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.3,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
  },
  iconWrapper: {
    width: ICON_WRAPPER,
    height: ICON_WRAPPER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: ICON_WRAPPER + 12,
    height: ICON_WRAPPER + 12,
    borderRadius: 9999,
    borderWidth: 1,
  },
  iconRing: {
    position: 'absolute',
    width: ICON_WRAPPER,
    height: ICON_WRAPPER,
    borderRadius: 9999,
    borderWidth: 1,
  },
  iconCenter: {
    zIndex: 2,
  },
  alarmInfo: {
    alignItems: 'center',
    gap: 10,
  },
  alarmTime: {
    fontSize: 64,
    fontWeight: '200',
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
  },
  alarmLabel: {
    fontSize: 20,
    fontWeight: '500',
    letterSpacing: -0.2,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  actions: {
    alignItems: 'center',
    gap: 24,
    paddingBottom: 20,
  },
  textAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 100,
  },
  actionLabel: {
    fontSize: 17,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  divider: {
    width: 32,
    height: 1,
  },
  homeIndicator: {
    width: 120,
    height: 4,
    borderRadius: 100,
    alignSelf: 'center',
  },
});
