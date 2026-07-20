import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, FlatList, TextInput, StyleSheet, Platform } from 'react-native';
import Animated, { FadeOut, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from '../../shared/ui/pixel';

import { Text, IconButton, HighlightedBody, AnimatedPressable } from '../../shared/ui';
import { useTheme, useLocale, spacing, radii, listRow } from '../../shared/config';
import { searchMessages, type SearchResult } from '../../entities/message';
import { DateSeparator } from './DateSeparator';

type Props = {
  chatId: string;
  onClose: () => void;
  onSelect: (messageId: string) => void;
};

export type SearchListItem =
  | { kind: 'date'; date: string; key: string }
  | { kind: 'result'; result: SearchResult; key: string };

/** Group search hits by local calendar day with descending created_at order. */
export function buildSearchListItems(results: SearchResult[]): SearchListItem[] {
  const sorted = [...results].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  );

  const items: SearchListItem[] = [];
  let lastDayKey = '';

  for (const result of sorted) {
    const dayKey = toLocalDayKey(result.created_at);
    if (dayKey !== lastDayKey) {
      lastDayKey = dayKey;
      items.push({
        kind: 'date',
        date: result.created_at,
        key: `date-${dayKey}`,
      });
    }
    items.push({ kind: 'result', result, key: result.id });
  }

  return items;
}

function toLocalDayKey(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function SearchOverlay({ chatId, onClose, onSelect }: Props) {
  const { colors } = useTheme();
  const { t } = useLocale();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }
    setResults(searchMessages(trimmed, chatId));
  }, [query, chatId]);

  const listItems = useMemo(() => buildSearchListItems(results), [results]);

  const handleSelect = useCallback(
    (item: SearchResult) => {
      onSelect(item.id);
      onClose();
    },
    [onSelect, onClose],
  );

  const formatTime = useCallback((iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }, []);

  return (
    <Animated.View
      entering={SlideInDown.duration(200).springify().damping(20).stiffness(200)}
      exiting={FadeOut.duration(150)}
      style={[
        styles.container,
        { backgroundColor: colors.canvas, paddingTop: insets.top },
      ]}>
      <View style={styles.inputRow}>
        <TextInput
          ref={inputRef}
          value={query}
          onChangeText={setQuery}
          placeholder={t.searchInChat}
          placeholderTextColor={colors.mutedSoft}
          style={[
            styles.input,
            {
              color: colors.ink,
              backgroundColor: colors.surfaceSoft,
              fontFamily: Platform.OS === 'android' ? 'sans-serif' : undefined,
            },
          ]}
          returnKeyType="search"
          autoCorrect={false}
        />
        <IconButton icon={X} size={24} onPress={onClose} />
      </View>

      <FlatList
        data={listItems}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => {
          if (item.kind === 'date') {
            return <DateSeparator date={item.date} />;
          }
          const result = item.result;
          return (
            <AnimatedPressable
              scaleTo={1}
              pressStyle={{ backgroundColor: colors.surfaceSoft }}
              style={styles.resultItem}
              onPress={() => handleSelect(result)}
              {...(Platform.OS === 'android'
                ? { android_ripple: { color: colors.surfaceSoft } }
                : {})}>
              <HighlightedBody text={result.highlighted} />
              <Text variant="body-sm" tone="mutedSoft" style={styles.resultTime}>
                {formatTime(result.created_at)}
              </Text>
            </AnimatedPressable>
          );
        }}
        ListEmptyComponent={
          query.trim() ? (
            <View style={styles.emptyResult}>
              <Text variant="body-sm" tone="muted">
                {t.nothingFound}
              </Text>
            </View>
          ) : null
        }
        keyboardShouldPersistTaps="handled"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: spacing.gutter,
    gap: 8,
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    fontSize: 16,
    lineHeight: 20,
  },
  resultItem: {
    paddingHorizontal: listRow.chat.paddingHorizontal,
    paddingVertical: listRow.chat.paddingVertical,
  },
  resultTime: {
    marginTop: 2,
  },
  emptyResult: {
    paddingTop: 40,
    alignItems: 'center',
  },
});
