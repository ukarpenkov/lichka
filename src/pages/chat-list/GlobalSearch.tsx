import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, FlatList, TextInput, StyleSheet } from 'react-native';
import Animated, { FadeOut, SlideInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { X } from 'lucide-react-native';

import { Text, IconButton, HighlightedBody, AnimatedPressable } from '../../shared/ui';
import { useTheme, useLocale, formatShortMonth } from '../../shared/config';
import { searchMessages, type SearchResult } from '../../entities/message';
import type { ChatStackParamList } from '../../app/types';

type Nav = NativeStackNavigationProp<ChatStackParamList, 'ChatList'>;

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function GlobalSearch({ visible, onClose }: Props) {
  const navigation = useNavigation<Nav>();
  const { text, background } = useTheme();
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
      style={[styles.container, { backgroundColor: background }]}>
      {/* Search input */}
      <View
        style={[
          styles.inputRow,
          { borderBottomColor: text + '20' },
        ]}>
        <TextInput
          ref={inputRef}
          autoFocus
          value={query}
          onChangeText={setQuery}
          placeholder={t.searchMessages}
          placeholderTextColor={text + '55'}
          style={[styles.input, { color: text, borderColor: text + '33' }]}
          returnKeyType="search"
          autoCorrect={false}
        />
        <IconButton icon={X} size={22} onPress={onClose} />
      </View>

      {/* Results */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AnimatedPressable
            style={[styles.resultItem, { borderBottomColor: text + '10' }]}
            onPress={() => handleSelect(item)}>
            <HighlightedBody
              text={item.highlighted}
              style={{ color: text }}
            />
            <View style={styles.resultMeta}>
              <Text
                variant="caption"
                style={{ color: text + '60' }}
                numberOfLines={1}>
                {item.chat_title}
              </Text>
              <Text variant="caption" style={{ color: text + '40' }}>
                {formatTime(item.created_at)}
              </Text>
            </View>
          </AnimatedPressable>
        )}
        ListEmptyComponent={
          query.trim() ? (
            <View style={styles.emptyResult}>
              <Text variant="body" style={{ color: text + '60' }}>
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 15,
  },
  resultItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  resultMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyResult: {
    paddingTop: 40,
    alignItems: 'center',
  },
});
