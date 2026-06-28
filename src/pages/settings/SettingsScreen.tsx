import React, { useCallback, useState } from 'react';
import { ScrollView, View, Switch, Pressable, Alert, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Palette, Volume2, Vibrate, Languages, Cloud, CloudDownload, FileJson, FileUp, Info, ChevronRight } from 'lucide-react-native';

import { Screen, Text } from '../../shared/ui';
import { useTheme, getTheme, useLocale } from '../../shared/config';
import { getSettings, updateSettings, type AppSettings } from '../../entities/settings';
import { exportToJSON, importFromJSON, getGoogleToken, uploadBackup, downloadBackup } from '../../features';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import type { SettingsStackParamList } from '../../app/types';

import { SettingsRow } from './SettingsRow';

type Nav = NativeStackNavigationProp<SettingsStackParamList, 'Settings'>;

const APP_VERSION = '0.1';

export function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const { text, background } = useTheme();
  const { t, setLocale: setAppLocale } = useLocale();
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
    (newLocale: string) => {
      updateSettings({ locale: newLocale });
      setAppLocale(newLocale as any);
      setSettings(getSettings());
    },
    [setAppLocale],
  );

  const handleImport = useCallback(
    async (mode: 'merge' | 'replace') => {
      try {
        const file = await DocumentPicker.pickSingle({
          type: [DocumentPicker.types.allFiles],
        });
        const json = await RNFS.readFile(file.uri, 'utf8');
        const result = importFromJSON(json, mode);

        const parts: string[] = [];
        if (result.chatsAdded > 0) parts.push(t.chatsAdded(result.chatsAdded));
        if (result.chatsUpdated > 0) parts.push(t.chatsUpdated(result.chatsUpdated));
        if (result.messagesAdded > 0) parts.push(t.messagesAdded(result.messagesAdded));
        if (result.messagesUpdated > 0) parts.push(t.messagesUpdated(result.messagesUpdated));
        if (result.settingsImported) parts.push(t.settingsImported);

        Alert.alert(t.importComplete, parts.length > 0 ? parts.join('\n') : t.noNewData);
        setSettings(getSettings());
      } catch (e: any) {
        if (e?.code === 'DOCUMENT_PICKER_CANCELED') return;
        Alert.alert(t.error, t.exportFailed);
      }
    },
    [t],
  );

  if (!settings) {
    return (
      <Screen>
        <Text variant="body">{t.loading}</Text>
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
          {t.settings}
        </Text>

        {/* Theme */}
        <Text variant="caption" style={[styles.sectionLabel, { color: text + '60' }]}>
          {t.sectionTheme}
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
          {t.sectionSound}
        </Text>
        <View style={[styles.section, { borderColor: text + '20' }]}>
          <SettingsRow label={t.sound} icon={Volume2}>
            <Switch
              value={settings.soundEnabled}
              onValueChange={(v) => handleToggle('soundEnabled', v)}
              trackColor={{ false: text + '20', true: text + '80' }}
              thumbColor={settings.soundEnabled ? text : text + '60'}
            />
          </SettingsRow>
          <SettingsRow label={t.hapticFeedback} icon={Vibrate}>
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
          {t.sectionLanguage}
        </Text>
        <View style={[styles.section, { borderColor: text + '20' }]}>
          <SettingsRow label={t.interfaceLanguage} icon={Languages}>
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
          {t.sectionBackup}
        </Text>
        <View style={[styles.section, { borderColor: text + '20' }]}>
          <SettingsRow
            label={t.backupToGoogleDrive}
            icon={Cloud}
            onPress={async () => {
              try {
                const token = await getGoogleToken();
                await uploadBackup(token);
                Alert.alert(t.done, t.backupSaved);
              } catch (e: any) {
                if (e?.code === 'SIGN_IN_CANCELLED') return;
                Alert.alert(t.error, t.backupFailed);
              }
            }}
          />
          <SettingsRow
            label={t.restoreFromGoogleDrive}
            icon={CloudDownload}
            onPress={async () => {
              try {
                const token = await getGoogleToken();
                const json = await downloadBackup(token);

                Alert.alert(
                  t.restoreTitle,
                  t.chooseImportMode,
                  [
                    { text: t.cancel, style: 'cancel' },
                    {
                      text: t.merge,
                      onPress: () => {
                        const result = importFromJSON(json, 'merge');
                        const parts: string[] = [];
                        if (result.chatsAdded > 0) parts.push(t.chatsAdded(result.chatsAdded));
                        if (result.chatsUpdated > 0) parts.push(t.chatsUpdated(result.chatsUpdated));
                        if (result.messagesAdded > 0) parts.push(t.messagesAdded(result.messagesAdded));
                        if (result.messagesUpdated > 0) parts.push(t.messagesUpdated(result.messagesUpdated));
                        if (result.settingsImported) parts.push(t.settingsImported);
                        Alert.alert(t.restoreComplete, parts.length > 0 ? parts.join('\n') : t.noNewData);
                        setSettings(getSettings());
                      },
                    },
                    {
                      text: t.replaceAll,
                      style: 'destructive',
                      onPress: () => {
                        Alert.alert(
                          t.replaceAllConfirm,
                          t.replaceAllWarning,
                          [
                            { text: t.cancel, style: 'cancel' },
                            {
                              text: t.replace,
                              style: 'destructive',
                              onPress: () => {
                                const result = importFromJSON(json, 'replace');
                                Alert.alert(t.restoreComplete,
                                  `${t.chatsAdded(result.chatsAdded)}, ${t.messagesAdded(result.messagesAdded)}${result.settingsImported ? `, ${t.settingsImported}` : ''}`);
                                setSettings(getSettings());
                              },
                            },
                          ],
                        );
                      },
                    },
                  ],
                );
              } catch (e: any) {
                if (e?.code === 'SIGN_IN_CANCELLED') return;
                if (e?.message === 'NO_BACKUP') {
                  Alert.alert(t.noBackup, t.noBackupMessage);
                  return;
                }
                Alert.alert(t.error, t.restoreFailed);
              }
            }}
          />
          <SettingsRow
            label={t.exportToFile}
            icon={FileJson}
            onPress={async () => {
              try {
                const filePath = await exportToJSON();
                Alert.alert(t.done, t.exportDone(filePath));
              } catch {
                Alert.alert(t.error, t.exportFailed);
              }
            }}
          />
          <SettingsRow
            label={t.importFromFile}
            icon={FileUp}
            onPress={() => {
              Alert.alert(
                t.importFromFile,
                t.chooseImportMode,
                [
                  {
                    text: t.cancel,
                    style: 'cancel',
                  },
                  {
                    text: t.merge,
                    onPress: () => handleImport('merge'),
                  },
                  {
                    text: t.replaceAll,
                    style: 'destructive',
                    onPress: () => {
                      Alert.alert(
                        t.replaceAllConfirm,
                        t.replaceAllWarning,
                        [
                          { text: t.cancel, style: 'cancel' },
                          { text: t.replace, style: 'destructive', onPress: () => handleImport('replace') },
                        ],
                      );
                    },
                  },
                ],
              );
            }}
          />
        </View>

        {/* About */}
        <Text variant="caption" style={[styles.sectionLabel, { color: text + '60' }]}>
          {t.sectionAbout}
        </Text>
        <View style={[styles.section, { borderColor: text + '20' }]}>
          <SettingsRow label={t.version} icon={Info}>
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
