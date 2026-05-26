import React, { useRef, useCallback } from 'react';
import { View, FlatList, Pressable, StyleSheet } from 'react-native';
import { Text } from '../../shared/ui';

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 3;
const LIST_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const SNAP_INTERVAL = ITEM_HEIGHT;
const HALF_PADDING = (LIST_HEIGHT - ITEM_HEIGHT) / 2;

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
};

export function TimeScroller({
  hour,
  minute,
  textColor,
  accentColor,
  onHourChange,
  onMinuteChange,
}: Props) {
  const is24 = useRef(getIs24Hour()).current;
  const hourListRef = useRef<FlatList<number>>(null);
  const minListRef = useRef<FlatList<number>>(null);

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
    (ref: React.RefObject<FlatList<number> | null>, index: number, animated: boolean) => {
      ref.current?.scrollToOffset({
        offset: index * ITEM_HEIGHT,
        animated,
      });
    },
    [],
  );

  const handleHourScrollEnd = useCallback(
    (e: any) => {
      const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(23, idx));
      if (clamped !== hour) onHourChange(clamped);
      // Re-snap in case of slight misalignment
      scrollToIndex(hourListRef, clamped, true);
    },
    [hour, onHourChange, scrollToIndex],
  );

  const handleMinuteScrollEnd = useCallback(
    (e: any) => {
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
      scrollToIndex(hourListRef, idx, true);
    },
    [onHourChange, scrollToIndex],
  );

  const handleMinutePress = useCallback(
    (idx: number) => {
      onMinuteChange(idx);
      scrollToIndex(minListRef, idx, true);
    },
    [onMinuteChange, scrollToIndex],
  );

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
            fontSize: isSelected ? 22 : 15,
            fontWeight: isSelected ? '700' : '400',
            color: isSelected ? accentColor : `${textColor}44`,
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
      {/* Hours column */}
      <FlatList
        ref={hourListRef}
        data={hours}
        keyExtractor={(item) => `h${item}`}
        renderItem={({ item }) =>
          renderItem(item, item === hour, formatHour, handleHourPress)
        }
        showsVerticalScrollIndicator={false}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        disableIntervalMomentum
        contentContainerStyle={{
          paddingVertical: HALF_PADDING,
        }}
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
          fontSize: 22,
          fontWeight: '700',
          color: textColor,
          marginHorizontal: 6,
          lineHeight: LIST_HEIGHT,
          textAlignVertical: 'center',
        }}
      >
        :
      </Text>

      {/* Minutes column */}
      <FlatList
        ref={minListRef}
        data={minutes}
        keyExtractor={(item) => `m${item}`}
        renderItem={({ item }) =>
          renderItem(item, item === minute, formatMinute, handleMinutePress)
        }
        showsVerticalScrollIndicator={false}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        disableIntervalMomentum
        contentContainerStyle={{
          paddingVertical: HALF_PADDING,
        }}
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
            fontSize: 11,
            marginLeft: 4,
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
  },
  list: {
    width: 52,
    height: LIST_HEIGHT,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
  },
});
