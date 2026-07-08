import React, { useCallback, useState } from 'react';
import { ScrollView, View, Switch, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Palette, Volume2, Vibrate, Languages, Cloud, CloudDownload, FileArchive, FileUp, Info, ChevronRight } from 'lucide-react-native';

import { Screen, Text, AlertDialog, type AlertButton } from '../../shared/ui';
import { useTheme, getTheme, useLocale, type LocaleDictionary } from '../../shared/config';
import { getSettings, updateSettings, type AppSettings } from '../../entities/settings';
import { exportToZIP, importFromJSON, importFromZIP, getGoogleToken, uploadBackup, downloadBackup, type ZipImportResult } from '../../features';
import { useOnTabVisible } from '../../app/MainTabsContext';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import type { SettingsStackParamList } from '../../app/types';

import { SettingsRow } from './SettingsRow';

type Nav = NativeStackNavigationProp<SettingsStackParamList, 'Settings'>;

const APP_VERSION = '0.1';

interface ImportSummary {
  chatsAdded: number;
  chatsUpdated: number;
  messagesAdded: number;
  messagesUpdated: number;
  settingsImported: boolean;
  mediaRestored?: number;
}

function formatImportResult(t: LocaleDictionary, r: ImportSummary): string {
  const parts: string[] = [];
  if (r.chatsAdded > 0) parts.push(t.chatsAdded(r.chatsAdded));
  if (r.chatsUpdated > 0) parts.push(t.chatsUpdated(r.chatsUpdated));
  if (r.messagesAdded > 0) parts.push(t.messagesAdded(r.messagesAdded));
  if (r.messagesUpdated > 0) parts.push(t.messagesUpdated(r.messagesUpdated));
  if (r.settingsImported) parts.push(t.settingsImported);
  if (r.mediaRestored && r.mediaRestored > 0) parts.push(t.mediaRestored(r.mediaRestored));
  return parts.length > 0 ? parts.join('\n') : t.noNewData;
}

export function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const { text, background } = useTheme();
  const { t, setLocale: setAppLocale } = useLocale();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [dialog, setDialog] = useState<{
    title?: string;
    message?: string;
    buttons?: AlertButton[];
  } | null>(null);

  useFocusEffect(
    useCallback(() => {
      setSettings(getSettings());
    }, []),
  );

  useOnTabVisible(2, () => setSettings(getSettings()), []);

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
        const name = (file.name ?? file.uri ?? '').toLowerCase();
        const isZip = name.endsWith('.zip');

        let summary: ImportSummary;
        if (isZip) {
          const tmpZip = `${RNFS.CachesDirectoryPath}/lichka-import-src-${Date.now()}.zip`;
          await RNFS.copyFile(file.uri, tmpZip);
          try {
            const result: ZipImportResult = await importFromZIP(tmpZip, mode);
            summary = result;
          } finally {
            await RNFS.unlink(tmpZip).catch(() => {});
          }
        } else {
          const json = await RNFS.readFile(file.uri, 'utf8');
          summary = importFromJSON(json, mode);
        }

        const message = formatImportResult(t, summary);
        setTimeout(() => {
          setDialog({ title: t.importComplete, message, buttons: [{ text: t.done }] });
        }, 300);
        setSettings(getSettings());
      } catch (e: any) {
        if (e?.code === 'DOCUMENT_PICKER_CANCELED') return;
        const message = e?.message === 'NOT_A_BACKUP' ? t.notBackupFile : t.importFailed;
        setTimeout(() => {
          setDialog({ title: t.error, message, buttons: [{ text: t.done }] });
        }, 300);
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
                setDialog({ title: t.done, message: t.backupSaved, buttons: [{ text: t.done }] });
              } catch (e: any) {
                if (e?.code === 'SIGN_IN_CANCELLED') return;
                setDialog({ title: t.error, message: t.backupFailed, buttons: [{ text: t.done }] });
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

                setDialog({
                  title: t.restoreTitle,
                  message: t.chooseImportMode,
                  buttons: [
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
                        setTimeout(() => {
                          setDialog({ title: t.restoreComplete, message: parts.length > 0 ? parts.join('\n') : t.noNewData, buttons: [{ text: t.done }] });
                        }, 300);
                        setSettings(getSettings());
                      },
                    },
                    {
                      text: t.replaceAll,
                      style: 'destructive',
                      onPress: () => {
                        setTimeout(() => {
                          setDialog({
                            title: t.replaceAllConfirm,
                            message: t.replaceAllWarning,
                            buttons: [
                              { text: t.cancel, style: 'cancel' },
                              {
                                text: t.replace,
                                style: 'destructive',
                                onPress: () => {
                                  const result = importFromJSON(json, 'replace');
                                  setTimeout(() => {
                                    setDialog({
                                      title: t.restoreComplete,
                                      message: `${t.chatsAdded(result.chatsAdded)}, ${t.messagesAdded(result.messagesAdded)}${result.settingsImported ? `, ${t.settingsImported}` : ''}`,
                                      buttons: [{ text: t.done }],
                                    });
                                  }, 300);
                                  setSettings(getSettings());
                                },
                              },
                            ],
                          });
                        }, 300);
                      },
                    },
                  ],
                });
              } catch (e: any) {
                if (e?.code === 'SIGN_IN_CANCELLED') return;
                if (e?.message === 'NO_BACKUP') {
                  setDialog({ title: t.noBackup, message: t.noBackupMessage, buttons: [{ text: t.done }] });
                  return;
                }
                setDialog({ title: t.error, message: t.restoreFailed, buttons: [{ text: t.done }] });
              }
            }}
          />
          <SettingsRow
            label={t.exportToFile}
            icon={FileArchive}
            onPress={async () => {
              try {
                const filePath = await exportToZIP();
                setDialog({ title: t.done, message: t.exportDone(filePath), buttons: [{ text: t.done }] });
              } catch {
                setDialog({ title: t.error, message: t.exportFailed, buttons: [{ text: t.done }] });
              }
            }}
          />
          <SettingsRow
            label={t.importFromFile}
            icon={FileUp}
            onPress={() => {
              setDialog({
                title: t.importFromFile,
                message: t.chooseImportMode,
                buttons: [
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
                      setTimeout(() => {
                        setDialog({
                          title: t.replaceAllConfirm,
                          message: t.replaceAllWarning,
                          buttons: [
                            { text: t.cancel, style: 'cancel' },
                            { text: t.replace, style: 'destructive', onPress: () => handleImport('replace') },
                          ],
                        });
                      }, 300);
                    },
                  },
                ],
              });
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

      <AlertDialog
        visible={dialog !== null}
        title={dialog?.title}
        message={dialog?.message}
        buttons={dialog?.buttons}
        onClose={() => setDialog(null)}
      />
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
