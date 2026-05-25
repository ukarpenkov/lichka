import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, View, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Check } from 'lucide-react-native';

import { Screen, Text } from '../../shared/ui';
import { useTheme, DEFAULT_LIGHT, DEFAULT_DARK, THEME_PRESETS, type ThemePreset } from '../../shared/config';
import { getSettings } from '../../entities/settings';

const ALL_THEMES: ThemePreset[] = [DEFAULT_LIGHT, DEFAULT_DARK, ...THEME_PRESETS];

export function ThemePickerScreen() {
  const { text, setTheme } = useTheme();
  const [currentId, setCurrentId] = useState(DEFAULT_LIGHT.id);

  useFocusEffect(
    useCallback(() => {
      const settings = getSettings();
      setCurrentId(settings.themePresetId);
    }, []),
  );

  const handleSelect = useCallback(
    (id: string) => {
      setTheme(id);
      setCurrentId(id);
    },
    [setTheme],
  );

  const renderItem = useCallback(
    ({ item }: { item: ThemePreset }) => {
      const isActive = item.id === currentId;
      return (
        <Pressable
          onPress={() => handleSelect(item.id)}
          style={[
            styles.card,
            {
              backgroundColor: item.background,
              borderColor: isActive ? text : text + '20',
              borderWidth: isActive ? 2 : 1,
            },
          ]}>
          <Text style={{ color: item.text, fontSize: 16, fontWeight: '600' }}>
            {item.name}
          </Text>
          {isActive && (
            <View style={styles.check}>
              <Check size={18} color={item.text} />
            </View>
          )}
        </Pressable>
      );
    },
    [currentId, text, handleSelect],
  );

  return (
    <Screen>
      <FlatList
        data={ALL_THEMES}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  card: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    position: 'relative',
  },
  check: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
});
