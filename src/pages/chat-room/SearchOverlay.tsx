import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, FlatList, TextInput, StyleSheet, Platform } from 'react-native';
import Animated, { FadeOut, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from '../../shared/ui/pixel';

import { Text, IconButton, HighlightedBody, AnimatedPressable } from '../../shared/ui';
import { useTheme, useLocale, spacing, radii, listRow, fonts } from '../../shared/config';
import { searchMessages, type SearchResult } from '../../entities/message';

type Props = {
  chatId: string;
  onClose: () => void;
  onSelect: (messageId: string) => void;
};

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
              fontFamily: fonts.regular,
            },
          ]}
          returnKeyType="search"
          autoCorrect={false}
        />
        <IconButton icon={X} size={24} onPress={onClose} />
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AnimatedPressable
            scaleTo={1}
            pressStyle={{ backgroundColor: colors.surfaceSoft }}
            style={styles.resultItem}
            onPress={() => handleSelect(item)}
            {...(Platform.OS === 'android'
              ? { android_ripple: { color: colors.surfaceSoft } }
              : {})}>
            <HighlightedBody text={item.highlighted} />
            <Text variant="body-sm" tone="mutedSoft" style={styles.resultTime}>
              {formatTime(item.created_at)}
            </Text>
          </AnimatedPressable>
        )}
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
    zIndex: 10,
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
