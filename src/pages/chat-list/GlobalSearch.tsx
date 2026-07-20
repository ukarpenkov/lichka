import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, FlatList, TextInput, StyleSheet, Platform } from 'react-native';
import Animated, { FadeOut, SlideInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { X } from 'lucide-react-native';

import { Text, IconButton, HighlightedBody, AnimatedPressable } from '../../shared/ui';
import { useTheme, useLocale, formatShortMonth, spacing, radii, listRow } from '../../shared/config';
import { searchMessages, type SearchResult } from '../../entities/message';
import type { ChatStackParamList } from '../../app/types';

type Nav = NativeStackNavigationProp<ChatStackParamList, 'ChatList'>;

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function GlobalSearch({ visible, onClose }: Props) {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const { t, locale } = useLocale();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!visible) {
      setQuery('');
      setResults([]);
    }
  }, [visible]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }
    setResults(searchMessages(trimmed));
  }, [query]);

  const handleSelect = useCallback(
    (item: SearchResult) => {
      onClose();
      navigation.navigate('ChatRoom', {
        chatId: item.chat_id,
        messageId: item.id,
      });
    },
    [navigation, onClose],
  );

  const formatTime = useCallback((iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

    if (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    ) {
      return time;
    }

    const month = formatShortMonth(d, locale);
    return `${d.getDate()} ${month}, ${time}`;
  }, [locale]);

  if (!visible) return null;

  return (
    <Animated.View
      entering={SlideInDown.duration(200).springify().damping(20).stiffness(200)}
      exiting={FadeOut.duration(150)}
      style={[styles.container, { backgroundColor: colors.canvas }]}>
      <View style={styles.inputRow}>
        <TextInput
          ref={inputRef}
          autoFocus
          value={query}
          onChangeText={setQuery}
          placeholder={t.searchMessages}
          placeholderTextColor={colors.mutedSoft}
          style={[
            styles.input,
            {
              color: colors.ink,
              backgroundColor: colors.surfaceSoft,
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
            <View style={styles.resultMeta}>
              <Text variant="body-sm" tone="muted" numberOfLines={1} style={styles.metaChat}>
                {item.chat_title}
              </Text>
              <Text variant="body-sm" tone="mutedSoft">
                {formatTime(item.created_at)}
              </Text>
            </View>
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
    gap: 4,
  },
  resultMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  metaChat: {
    flex: 1,
  },
  emptyResult: {
    paddingTop: 40,
    alignItems: 'center',
  },
});
