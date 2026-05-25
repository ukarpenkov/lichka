import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { X } from 'lucide-react-native';
import { IconButton, Text } from '../../shared/ui';
import { useTheme } from '../../shared/config';

type SearchOverlayProps = {
  query: string;
  onChangeQuery: (q: string) => void;
  onClose: () => void;
  resultCount: number;
};

export function SearchOverlay({ query, onChangeQuery, onClose, resultCount }: SearchOverlayProps) {
  const { text, background } = useTheme();
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: background, borderBottomColor: text + '20' }]}>
      <TextInput
        ref={inputRef}
        value={query}
        onChangeText={onChangeQuery}
        placeholder="Поиск по чату..."
        placeholderTextColor={text + '55'}
        style={[styles.input, { color: text, borderColor: text + '33' }]}
        returnKeyType="search"
        autoCorrect={false}
      />
      {query.length > 0 && (
        <Text variant="caption" style={{ color: text + '60' }}>
          {resultCount}
        </Text>
      )}
      <IconButton icon={X} size={22} onPress={onClose} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
});
