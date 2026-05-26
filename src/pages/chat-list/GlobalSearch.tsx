import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  Pressable,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { X } from 'lucide-react-native';

import { Text, IconButton, HighlightedBody } from '../../shared/ui';
import { useTheme } from '../../shared/config';
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
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      inputRef.current?.focus();
    } else {
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

    const month = d.toLocaleString('ru-RU', { month: 'short' });
    return `${d.getDate()} ${month}, ${time}`;
  }, []);

  if (!visible) return null;

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      {/* Search input */}
      <View
        style={[
          styles.inputRow,
          { borderBottomColor: text + '20' },
        ]}>
        <TextInput
          ref={inputRef}
          value={query}
          onChangeText={setQuery}
          placeholder="Поиск по сообщениям..."
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
          <Pressable
            style={({ pressed }) => [
              styles.resultItem,
              {
                backgroundColor: pressed ? text + '10' : 'transparent',
                borderBottomColor: text + '10',
              },
            ]}
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
          </Pressable>
        )}
        ListEmptyComponent={
          query.trim() ? (
            <View style={styles.emptyResult}>
              <Text variant="body" style={{ color: text + '60' }}>
                Ничего не найдено
              </Text>
            </View>
          ) : null
        }
        keyboardShouldPersistTaps="handled"
      />
    </View>
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
