import React, { useCallback, useState } from 'react';
import { ScrollView, View, Switch, Pressable, Alert, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Palette, Volume2, Vibrate, Languages, Cloud, CloudDownload, FileJson, Info, ChevronRight } from 'lucide-react-native';

import { Screen, Text } from '../../shared/ui';
import { useTheme, getTheme } from '../../shared/config';
import { getSettings, updateSettings, type AppSettings } from '../../entities/settings';
import type { SettingsStackParamList } from '../../app/types';

import { SettingsRow } from './SettingsRow';

type Nav = NativeStackNavigationProp<SettingsStackParamList, 'Settings'>;

const APP_VERSION = '0.1';

export function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const { text, background } = useTheme();
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useFocusEffect(
    useCallback(() => {
      setSettings(getSettings());
    }, []),
  );

  const handleToggle = useCallback(
    (key: 'hapticEnabled' | 'soundEnabled', value: boolean) => {
      updateSettings({ [key]: value });
      setSettings(getSettings());
    },
    [],
  );

  const handleLocaleChange = useCallback(
    (locale: string) => {
      updateSettings({ locale });
      setSettings(getSettings());
    },
    [],
  );

  if (!settings) {
    return (
      <Screen>
        <Text variant="body">Загрузка...</Text>
      </Screen>
    );
  }

  const currentTheme = getTheme(settings.themePresetId);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text
          variant="body"
          style={[styles.title, { color: text }]}>
          Настройки
        </Text>

        {/* Theme */}
        <Text variant="caption" style={[styles.sectionLabel, { color: text + '60' }]}>
          ТЕМА
        </Text>
        <View style={[styles.section, { borderColor: text + '20' }]}>
          <SettingsRow
            label={currentTheme.name}
            icon={Palette}
            onPress={() => navigation.navigate('ThemePicker')}>
            <ChevronRight size={18} color={text + '60'} />
          </SettingsRow>
        </View>

        {/* Sound & Haptics */}
        <Text variant="caption" style={[styles.sectionLabel, { color: text + '60' }]}>
          ЗВУК И ТАКТИЛЬНОСТЬ
        </Text>
        <View style={[styles.section, { borderColor: text + '20' }]}>
          <SettingsRow label="Звук" icon={Volume2}>
            <Switch
              value={settings.soundEnabled}
              onValueChange={(v) => handleToggle('soundEnabled', v)}
              trackColor={{ false: text + '20', true: text + '80' }}
              thumbColor={settings.soundEnabled ? text : text + '60'}
            />
          </SettingsRow>
          <SettingsRow label="Тактильная отдача" icon={Vibrate}>
            <Switch
              value={settings.hapticEnabled}
              onValueChange={(v) => handleToggle('hapticEnabled', v)}
              trackColor={{ false: text + '20', true: text + '80' }}
              thumbColor={settings.hapticEnabled ? text : text + '60'}
            />
          </SettingsRow>
        </View>

        {/* Language */}
        <Text variant="caption" style={[styles.sectionLabel, { color: text + '60' }]}>
          ЯЗЫК
        </Text>
        <View style={[styles.section, { borderColor: text + '20' }]}>
          <SettingsRow label="Язык интерфейса" icon={Languages}>
            <View style={styles.localeToggle}>
              {['ru', 'en'].map((loc) => (
                <Pressable
                  key={loc}
                  onPress={() => handleLocaleChange(loc)}
                  style={[
                    styles.localePill,
                    {
                      backgroundColor: settings.locale === loc ? text : 'transparent',
                      borderColor: text,
                    },
                  ]}>
                  <Text
                    style={{
                      color: settings.locale === loc ? background : text,
                      fontSize: 13,
                      fontWeight: '600',
                    }}>
                    {loc.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>
          </SettingsRow>
        </View>

        {/* Backup */}
        <Text variant="caption" style={[styles.sectionLabel, { color: text + '60' }]}>
          РЕЗЕРВНАЯ КОПИЯ
        </Text>
        <View style={[styles.section, { borderColor: text + '20' }]}>
          <SettingsRow
            label="Сохранить в Google Drive"
            icon={Cloud}
            onPress={() => Alert.alert('Скоро', 'Функция будет доступна в следующих версиях')}
          />
          <SettingsRow
            label="Восстановить из Google Drive"
            icon={CloudDownload}
            onPress={() => Alert.alert('Скоро', 'Функция будет доступна в следующих версиях')}
          />
          <SettingsRow
            label="Экспорт в файл"
            icon={FileJson}
            onPress={() => Alert.alert('Скоро', 'Функция будет доступна в следующих версиях')}
          />
        </View>

        {/* About */}
        <Text variant="caption" style={[styles.sectionLabel, { color: text + '60' }]}>
          О ПРИЛОЖЕНИИ
        </Text>
        <View style={[styles.section, { borderColor: text + '20' }]}>
          <SettingsRow label="Версия" icon={Info}>
            <Text variant="body" style={{ color: text + '60' }}>
              {APP_VERSION}
            </Text>
          </SettingsRow>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  section: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  localeToggle: {
    flexDirection: 'row',
    gap: 6,
  },
  localePill: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
});
