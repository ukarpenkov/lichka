import React, { useRef, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Text } from '../../shared/ui';

const ITEM_WIDTH = 48;
const VISIBLE_ITEMS = 5;
const PICKER_WIDTH = ITEM_WIDTH * VISIBLE_ITEMS;
const PICKER_PADDING = (PICKER_WIDTH - ITEM_WIDTH) / 2;

function getIs24Hour(): boolean {
  try {
    const fmt = new Intl.DateTimeFormat(undefined, { hour: 'numeric' });
    return !fmt.resolvedOptions().hour12;
  } catch {
    return true;
  }
}

type Props = {
  hour: number; // 0–23
  minute: number; // 0–59
  textColor: string;
  accentColor: string;
  onHourChange: (h: number) => void;
  onMinuteChange: (m: number) => void;
};

export function TimeScroller({ hour, minute, textColor, accentColor, onHourChange, onMinuteChange }: Props) {
  const is24 = useRef(getIs24Hour()).current;
  const hourListRef = useRef<FlatList>(null);
  const minListRef = useRef<FlatList>(null);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const formatHour = useCallback(
    (h: number) => {
      if (!is24) {
        const h12 = h % 12 || 12;
        return `${h12}`;
      }
      return `${h}`.padStart(2, '0');
    },
    [is24],
  );

  const formatMinute = useCallback((m: number) => `${m}`.padStart(2, '0'), []);

  const scrollToHour = useCallback(
    (h: number) => {
      hourListRef.current?.scrollToOffset({ offset: h * ITEM_WIDTH, animated: false });
    },
    [],
  );

  const scrollToMinute = useCallback(
    (m: number) => {
      minListRef.current?.scrollToOffset({ offset: m * ITEM_WIDTH, animated: false });
    },
    [],
  );

  useEffect(() => {
    scrollToHour(hour);
  }, [hour, scrollToHour]);

  useEffect(() => {
    scrollToMinute(minute);
  }, [minute, scrollToMinute]);

  const handleHourScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.x / ITEM_WIDTH);
      const clamped = Math.max(0, Math.min(23, idx));
      if (clamped !== hour) onHourChange(clamped);
    },
    [hour, onHourChange],
  );

  const handleMinuteScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.x / ITEM_WIDTH);
      const clamped = Math.max(0, Math.min(59, idx));
      if (clamped !== minute) onMinuteChange(clamped);
    },
    [minute, onMinuteChange],
  );

  const renderHourItem = useCallback(
    ({ item }: { item: number }) => {
      const isSelected = item === hour;
      return (
        <View style={[styles.item, { width: ITEM_WIDTH }]}>
          <Text
            variant="body"
            style={{
              fontSize: isSelected ? 22 : 16,
              fontWeight: isSelected ? '700' : '400',
              color: isSelected ? accentColor : `${textColor}66`,
              textAlign: 'center',
            }}
          >
            {formatHour(item)}
          </Text>
        </View>
      );
    },
    [hour, accentColor, textColor, formatHour],
  );

  const renderMinuteItem = useCallback(
    ({ item }: { item: number }) => {
      const isSelected = item === minute;
      return (
        <View style={[styles.item, { width: ITEM_WIDTH }]}>
          <Text
            variant="body"
            style={{
              fontSize: isSelected ? 22 : 16,
              fontWeight: isSelected ? '700' : '400',
              color: isSelected ? accentColor : `${textColor}66`,
              textAlign: 'center',
            }}
          >
            {formatMinute(item)}
          </Text>
        </View>
      );
    },
    [minute, accentColor, textColor, formatMinute],
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={hourListRef}
        data={hours}
        keyExtractor={(item) => `h${item}`}
        renderItem={renderHourItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: PICKER_PADDING }}
        onMomentumScrollEnd={handleHourScrollEnd}
        getItemLayout={(_, index) => ({
          length: ITEM_WIDTH,
          offset: ITEM_WIDTH * index,
          index,
        })}
      />
      <Text variant="body" style={{ fontSize: 22, fontWeight: '700', color: textColor, marginHorizontal: 4 }}>:</Text>
      <FlatList
        ref={minListRef}
        data={minutes}
        keyExtractor={(item) => `m${item}`}
        renderItem={renderMinuteItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: PICKER_PADDING }}
        onMomentumScrollEnd={handleMinuteScrollEnd}
        getItemLayout={(_, index) => ({
          length: ITEM_WIDTH,
          offset: ITEM_WIDTH * index,
          index,
        })}
      />
      {!is24 && (
        <Text variant="caption" style={{ color: `${textColor}66`, marginLeft: 4, alignSelf: 'center' }}>
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
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
});
