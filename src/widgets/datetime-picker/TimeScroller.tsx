import React, { useRef, useCallback, useEffect } from 'react';
import {
  View,
  FlatList,
  Pressable,
  StyleSheet,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { Text } from '../../shared/ui';

const ITEM_HEIGHT = 28;
const VISIBLE_ITEMS = 3;
const LIST_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const HALF_PADDING = (LIST_HEIGHT - ITEM_HEIGHT) / 2;
const COL_WIDTH = 38;

function getIs24Hour(): boolean {
  try {
    const fmt = new Intl.DateTimeFormat(undefined, { hour: 'numeric' });
    return !fmt.resolvedOptions().hour12;
  } catch {
    return true;
  }
}

type Props = {
  hour: number;
  minute: number;
  textColor: string;
  accentColor: string;
  onHourChange: (h: number) => void;
  onMinuteChange: (m: number) => void;
  /** Лёгкий тик на каждое изменение значения */
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
  const is24 = useRef(getIs24Hour()).current;
  const hourListRef = useRef<FlatList<number>>(null);
  const minListRef = useRef<FlatList<number>>(null);
  const lastHourIdx = useRef(hour);
  const lastMinIdx = useRef(minute);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const formatHour = useCallback(
    (h: number) => {
      if (is24) return `${h}`.padStart(2, '0');
      const h12 = h % 12 || 12;
      return `${h12}`.padStart(2, '0');
    },
    [is24],
  );

  const formatMinute = useCallback((m: number) => `${m}`.padStart(2, '0'), []);

  const scrollToIndex = useCallback(
    (
      ref: React.RefObject<FlatList<number> | null>,
      index: number,
      animated: boolean,
    ) => {
      ref.current?.scrollToOffset({ offset: index * ITEM_HEIGHT, animated });
    },
    [],
  );

  // Тики во время прокрутки — на каждое пересечение значения
  const handleHourScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(23, idx));
      if (clamped !== lastHourIdx.current) {
        lastHourIdx.current = clamped;
        onTick?.();
      }
    },
    [onTick],
  );

  const handleMinuteScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(59, idx));
      if (clamped !== lastMinIdx.current) {
        lastMinIdx.current = clamped;
        onTick?.();
      }
    },
    [onTick],
  );

  const handleHourScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(23, idx));
      if (clamped !== hour) onHourChange(clamped);
      scrollToIndex(hourListRef, clamped, true);
    },
    [hour, onHourChange, scrollToIndex],
  );

  const handleMinuteScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(59, idx));
      if (clamped !== minute) onMinuteChange(clamped);
      scrollToIndex(minListRef, clamped, true);
    },
    [minute, onMinuteChange, scrollToIndex],
  );

  const handleHourPress = useCallback(
    (idx: number) => {
      onHourChange(idx);
      onTick?.();
      scrollToIndex(hourListRef, idx, true);
    },
    [onHourChange, onTick, scrollToIndex],
  );

  const handleMinutePress = useCallback(
    (idx: number) => {
      onMinuteChange(idx);
      onTick?.();
      scrollToIndex(minListRef, idx, true);
    },
    [onMinuteChange, onTick, scrollToIndex],
  );

  useEffect(() => {
    lastHourIdx.current = hour;
    scrollToIndex(hourListRef, hour, false);
  }, [hour, scrollToIndex]);

  useEffect(() => {
    lastMinIdx.current = minute;
    scrollToIndex(minListRef, minute, false);
  }, [minute, scrollToIndex]);

  const renderItem = useCallback(
    (
      item: number,
      isSelected: boolean,
      format: (v: number) => string,
      onPress: (v: number) => void,
    ) => (
      <Pressable
        onPress={() => onPress(item)}
        style={[styles.item, { height: ITEM_HEIGHT }]}
      >
        <Text
          style={{
            fontSize: isSelected ? 22 : 11,
            fontWeight: isSelected ? '700' : '500',
            color: isSelected ? accentColor : `${textColor}40`,
            textAlign: 'center',
            lineHeight: ITEM_HEIGHT,
          }}
        >
          {format(item)}
        </Text>
      </Pressable>
    ),
    [accentColor, textColor],
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={hourListRef}
        data={hours}
        keyExtractor={(item) => `h${item}`}
        renderItem={({ item }) =>
          renderItem(item, item === hour, formatHour, handleHourPress)
        }
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        disableIntervalMomentum
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingVertical: HALF_PADDING }}
        onScroll={handleHourScroll}
        onMomentumScrollEnd={handleHourScrollEnd}
        onScrollEndDrag={handleHourScrollEnd}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        style={styles.list}
        onLayout={() => scrollToIndex(hourListRef, hour, false)}
      />

      <Text
        style={{
          fontSize: 20,
          fontWeight: '700',
          color: accentColor,
          marginHorizontal: 2,
          lineHeight: LIST_HEIGHT,
        }}
      >
        :
      </Text>

      <FlatList
        ref={minListRef}
        data={minutes}
        keyExtractor={(item) => `m${item}`}
        renderItem={({ item }) =>
          renderItem(item, item === minute, formatMinute, handleMinutePress)
        }
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        disableIntervalMomentum
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingVertical: HALF_PADDING }}
        onScroll={handleMinuteScroll}
        onMomentumScrollEnd={handleMinuteScrollEnd}
        onScrollEndDrag={handleMinuteScrollEnd}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        style={styles.list}
        onLayout={() => scrollToIndex(minListRef, minute, false)}
      />

      {!is24 && (
        <Text
          style={{
            color: `${textColor}66`,
            fontSize: 10,
            marginLeft: 3,
            alignSelf: 'center',
          }}
        >
          {hour < 12 ? 'AM' : 'PM'}
        </Text>
      )}
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
});
