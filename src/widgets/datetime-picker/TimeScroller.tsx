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

const ITEM_HEIGHT = 46;
const VISIBLE_ITEMS = 3;
const LIST_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const COL_WIDTH = 64;

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
  const hourListRef = useRef<FlatList<number | null>>(null);
  const minListRef = useRef<FlatList<number | null>>(null);
  const lastHourIdx = useRef(hour);
  const lastMinIdx = useRef(minute);

  const PAD = 1;
  const hours = [null, ...Array.from({ length: 24 }, (_, i) => i), null];
  const minutes = [null, ...Array.from({ length: 60 }, (_, i) => i), null];

  const formatHour = useCallback((h: number) => `${h}`.padStart(2, '0'), []);
  const formatMinute = useCallback((m: number) => `${m}`.padStart(2, '0'), []);

  const scrollToIndex = useCallback(
    (ref: React.RefObject<FlatList<number | null> | null>, index: number, animated: boolean) => {
      ref.current?.scrollToOffset({ offset: index * ITEM_HEIGHT, animated });
    },
    [],
  );

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
      if (clamped !== hour) {
        onHourChange(clamped);
        scrollToIndex(hourListRef, clamped, true);
      }
    },
    [hour, onHourChange, scrollToIndex],
  );

  const handleMinuteScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(59, idx));
      if (clamped !== minute) {
        onMinuteChange(clamped);
        scrollToIndex(minListRef, clamped, true);
      }
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
    if (lastHourIdx.current !== hour) {
      lastHourIdx.current = hour;
      scrollToIndex(hourListRef, hour, false);
    }
  }, [hour, scrollToIndex]);

  useEffect(() => {
    if (lastMinIdx.current !== minute) {
      lastMinIdx.current = minute;
      scrollToIndex(minListRef, minute, false);
    }
  }, [minute, scrollToIndex]);

  const renderItem = useCallback(
    (
      item: number | null,
      isSelected: boolean,
      format: (v: number) => string,
      onPress: (v: number) => void,
    ) => {
      if (item === null) {
        return <View style={{ height: ITEM_HEIGHT }} />;
      }
      return (
        <Pressable
          onPress={() => onPress(item)}
          style={[styles.item, { height: ITEM_HEIGHT }]}
        >
          <Text
            style={{
              fontSize: isSelected ? 28 : 22,
              fontWeight: isSelected ? '600' : '400',
              color: isSelected ? accentColor : `${textColor}55`,
              textAlign: 'center',
            }}
          >
            {format(item)}
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
          disableIntervalMomentum
          scrollEventThrottle={16}
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
          disableIntervalMomentum
          scrollEventThrottle={16}
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
