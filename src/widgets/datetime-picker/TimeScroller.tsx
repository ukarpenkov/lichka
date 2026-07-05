import React, { useRef, useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  FlatList,
  Pressable,
  StyleSheet,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
  AccessibilityInfo,
} from 'react-native';
import { Text } from '../../shared/ui';

const ITEM_HEIGHT = 46;
const VISIBLE_ITEMS = 3;
const LIST_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const COL_WIDTH = 64;
const COPIES = 3;
const MIDDLE_COPY = 1;

type Props = {
  hour: number;
  minute: number;
  textColor: string;
  accentColor: string;
  onHourChange: (h: number) => void;
  onMinuteChange: (m: number) => void;
  onTick?: () => void;
};

export function TimeScroller({
  hour,
  minute,
  textColor,
  accentColor,
  onHourChange,
  onMinuteChange,
  onTick,
}: Props) {
  const hourListRef = useRef<FlatList<number>>(null);
  const minListRef = useRef<FlatList<number>>(null);
  const lastHourValue = useRef(hour);
  const lastMinValue = useRef(minute);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (v) => setReduceMotion(v),
    );
    return () => sub.remove();
  }, []);

  const HOUR_COUNT = 24;
  const MIN_COUNT = 60;

  const hours = useMemo(() => {
    const arr: number[] = [];
    for (let c = 0; c < COPIES; c++) {
      for (let i = 0; i < HOUR_COUNT; i++) arr.push(i);
    }
    return arr;
  }, []);

  const minutes = useMemo(() => {
    const arr: number[] = [];
    for (let c = 0; c < COPIES; c++) {
      for (let i = 0; i < MIN_COUNT; i++) arr.push(i);
    }
    return arr;
  }, []);

  const formatHour = useCallback((h: number) => `${h}`.padStart(2, '0'), []);
  const formatMinute = useCallback((m: number) => `${m}`.padStart(2, '0'), []);

  const dataIdxForHour = useCallback(
    (h: number) => MIDDLE_COPY * HOUR_COUNT + h - 1,
    [],
  );
  const dataIdxForMinute = useCallback(
    (m: number) => MIDDLE_COPY * MIN_COUNT + m - 1,
    [],
  );

  const normalizeHour = useCallback(
    (dataIdx: number) =>
      ((Math.round(dataIdx + 1) % HOUR_COUNT) + HOUR_COUNT) % HOUR_COUNT,
    [],
  );

  const normalizeMinute = useCallback(
    (dataIdx: number) =>
      ((Math.round(dataIdx + 1) % MIN_COUNT) + MIN_COUNT) % MIN_COUNT,
    [],
  );

  const scrollToDataIndex = useCallback(
    (
      ref: React.RefObject<FlatList<number> | null>,
      dataIdx: number,
      animated: boolean,
    ) => {
      ref.current?.scrollToOffset({
        offset: (dataIdx - 1) * ITEM_HEIGHT,
        animated: reduceMotion ? false : animated,
      });
    },
    [reduceMotion],
  );

  const recenterHours = useCallback(
    (dataIdx: number) => {
      const real = normalizeHour(dataIdx);
      const centered = dataIdxForHour(real);
      if (centered !== dataIdx) {
        hourListRef.current?.scrollToOffset({
          offset: (centered - 1) * ITEM_HEIGHT,
          animated: false,
        });
      }
    },
    [normalizeHour, dataIdxForHour],
  );

  const recenterMinutes = useCallback(
    (dataIdx: number) => {
      const real = normalizeMinute(dataIdx);
      const centered = dataIdxForMinute(real);
      if (centered !== dataIdx) {
        minListRef.current?.scrollToOffset({
          offset: (centered - 1) * ITEM_HEIGHT,
          animated: false,
        });
      }
    },
    [normalizeMinute, dataIdxForMinute],
  );

  const handleHourScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
      const clamped = normalizeHour(idx);
      if (clamped !== lastHourValue.current) {
        lastHourValue.current = clamped;
        onTick?.();
      }
    },
    [onTick, normalizeHour],
  );

  const handleMinuteScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
      const clamped = normalizeMinute(idx);
      if (clamped !== lastMinValue.current) {
        lastMinValue.current = clamped;
        onTick?.();
      }
    },
    [onTick, normalizeMinute],
  );

  const handleHourScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
      const real = normalizeHour(idx);
      if (real !== hour) {
        onHourChange(real);
      }
      recenterHours(idx);
    },
    [hour, onHourChange, normalizeHour, recenterHours],
  );

  const handleMinuteScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
      const real = normalizeMinute(idx);
      if (real !== minute) {
        onMinuteChange(real);
      }
      recenterMinutes(idx);
    },
    [minute, onMinuteChange, normalizeMinute, recenterMinutes],
  );

  const handleHourDragEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const vy = e.nativeEvent.velocity?.y ?? 0;
      if (Math.abs(vy) < 0.01) {
        handleHourScrollEnd(e);
      }
    },
    [handleHourScrollEnd],
  );

  const handleMinuteDragEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const vy = e.nativeEvent.velocity?.y ?? 0;
      if (Math.abs(vy) < 0.01) {
        handleMinuteScrollEnd(e);
      }
    },
    [handleMinuteScrollEnd],
  );

  const handleHourPress = useCallback(
    (real: number) => {
      onHourChange(real);
      onTick?.();
      lastHourValue.current = real;
      scrollToDataIndex(hourListRef, dataIdxForHour(real), true);
    },
    [onHourChange, onTick, scrollToDataIndex, dataIdxForHour],
  );

  const handleMinutePress = useCallback(
    (real: number) => {
      onMinuteChange(real);
      onTick?.();
      lastMinValue.current = real;
      scrollToDataIndex(minListRef, dataIdxForMinute(real), true);
    },
    [onMinuteChange, onTick, scrollToDataIndex, dataIdxForMinute],
  );

  useEffect(() => {
    if (lastHourValue.current !== hour) {
      lastHourValue.current = hour;
      scrollToDataIndex(hourListRef, dataIdxForHour(hour), !reduceMotion);
    }
  }, [hour, scrollToDataIndex, dataIdxForHour, reduceMotion]);

  useEffect(() => {
    if (lastMinValue.current !== minute) {
      lastMinValue.current = minute;
      scrollToDataIndex(minListRef, dataIdxForMinute(minute), !reduceMotion);
    }
  }, [minute, scrollToDataIndex, dataIdxForMinute, reduceMotion]);

  const renderItem = useCallback(
    (
      v: number,
      isSelected: boolean,
      format: (val: number) => string,
      onPress: (val: number) => void,
    ) => {
      return (
        <Pressable
          onPress={() => onPress(v)}
          style={[styles.item, { height: ITEM_HEIGHT }]}
        >
          <Text
            style={{
              fontSize: 24,
              lineHeight: ITEM_HEIGHT,
              fontWeight: isSelected ? '700' : '400',
              color: isSelected ? accentColor : `${textColor}55`,
              textAlign: 'center',
            }}
          >
            {format(v)}
          </Text>
        </Pressable>
      );
    },
    [accentColor, textColor],
  );

  return (
    <View style={styles.container}>
      <View style={styles.column}>
        <View style={[styles.highlight, { borderColor: `${accentColor}33`, backgroundColor: `${accentColor}18` }]} />
        <FlatList
          ref={hourListRef}
          data={hours}
          keyExtractor={(_item, index) => `h-${index}`}
          renderItem={({ item }) =>
            renderItem(item, item === hour, formatHour, handleHourPress)
          }
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          scrollEventThrottle={16}
          onScroll={handleHourScroll}
          onScrollEndDrag={handleHourDragEnd}
          onMomentumScrollEnd={handleHourScrollEnd}
          getItemLayout={(_, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          })}
          style={styles.list}
          onLayout={() => scrollToDataIndex(hourListRef, dataIdxForHour(hour), false)}
        />
      </View>

      <Text style={[styles.colon, { color: accentColor }]}>:</Text>

      <View style={styles.column}>
        <View style={[styles.highlight, { borderColor: `${accentColor}33`, backgroundColor: `${accentColor}18` }]} />
        <FlatList
          ref={minListRef}
          data={minutes}
          keyExtractor={(_item, index) => `m-${index}`}
          renderItem={({ item }) =>
            renderItem(item, item === minute, formatMinute, handleMinutePress)
          }
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          scrollEventThrottle={16}
          onScroll={handleMinuteScroll}
          onScrollEndDrag={handleMinuteDragEnd}
          onMomentumScrollEnd={handleMinuteScrollEnd}
          getItemLayout={(_, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          })}
          style={styles.list}
          onLayout={() => scrollToDataIndex(minListRef, dataIdxForMinute(minute), false)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: LIST_HEIGHT,
    alignSelf: 'center',
  },
  column: {
    width: COL_WIDTH,
    height: LIST_HEIGHT,
    overflow: 'hidden',
  },
  list: {
    width: COL_WIDTH,
    height: LIST_HEIGHT,
    flexGrow: 0,
    flexShrink: 0,
    overflow: 'hidden',
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    width: COL_WIDTH,
  },
  highlight: {
    position: 'absolute',
    top: ITEM_HEIGHT * 1,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderRadius: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    zIndex: 0,
  },
  colon: {
    fontSize: 28,
    fontWeight: '600',
    paddingHorizontal: 6,
  },
});
