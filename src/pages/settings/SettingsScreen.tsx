import React, { useCallback, useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Palette, Volume2, Vibrate, Languages, Cloud, CloudDownload, FileArchive, FileUp, Info, ChevronRight } from '../../shared/ui/pixel';

import { Screen, Text, AlertDialog, PageHeader, Switch, type AlertButton } from '../../shared/ui';
import { useTheme, getTheme, useLocale, getLocaleBundle, SUPPORTED_LOCALES, type Locale, type LocaleDictionary, spacing } from '../../shared/config';
import { getSettings, updateSettings, type AppSettings } from '../../entities/settings';
import { exportToZIP, importFromJSON, importFromZIP, saveToGoogleDrive, fetchGoogleDriveBackup, classifyDriveError, type ZipImportResult, type DriveBackupDownload } from '../../features';
import { useOnTabVisible } from '../../app/MainTabsContext';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import type { SettingsStackParamList } from '../../app/types';

import { SettingsRow } from './SettingsRow';

type Nav = NativeStackNavigationProp<SettingsStackParamList, 'Settings'>;

const APP_VERSION = '2.0';

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

function driveErrorMessage(t: LocaleDictionary, e: unknown, fallback: string): string {
  switch (classifyDriveError(e)) {
    case 'developer':
      return t.driveAuthDeveloper;
    case 'play_services':
      return t.driveAuthPlayServices;
    case 'denied':
      return t.driveAuthDenied;
    case 'too_large':
      return t.backupTooLarge;
    default:
      return fallback;
  }
}

function importErrorMessage(t: LocaleDictionary, e: unknown): string {
  if (e instanceof Error && e.message === 'NOT_A_BACKUP') {
    return t.notBackupFile;
  }
  return t.importFailed;
}

export function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const { t, setLocale: setAppLocale, locale } = useLocale();
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
    (newLocale: Locale) => {
      updateSettings({ locale: newLocale });
      setAppLocale(newLocale);
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
      } catch (e: unknown) {
        if (e && typeof e === 'object' && 'code' in e && e.code === 'DOCUMENT_PICKER_CANCELED') {
          return;
        }
        setTimeout(() => {
          setDialog({
            title: t.error,
            message: importErrorMessage(t, e),
            buttons: [{ text: t.done }],
          });
        }, 300);
      }
    },
    [t],
  );

  const performDriveImport = useCallback(
    async (backup: DriveBackupDownload, mode: 'merge' | 'replace') => {
      try {
        let summary: ImportSummary;
        if (backup.kind === 'zip') {
          const result: ZipImportResult = await importFromZIP(backup.path, mode);
          summary = result;
        } else {
          const json = await RNFS.readFile(backup.path, 'utf8');
          summary = importFromJSON(json, mode);
        }

        const message = formatImportResult(t, summary);
        setTimeout(() => {
          setDialog({ title: t.restoreComplete, message, buttons: [{ text: t.done }] });
        }, 300);
        setSettings(getSettings());
      } catch (e: unknown) {
        console.error('[google-drive] performDriveImport failed:', e instanceof Error ? e.message : String(e));
        setTimeout(() => {
          setDialog({
            title: t.error,
            message: importErrorMessage(t, e),
            buttons: [{ text: t.done }],
          });
        }, 300);
      } finally {
        await RNFS.unlink(backup.path).catch(() => {});
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
        <PageHeader title={t.settings} />

        {/* Theme */}
        <Text variant="caption" style={[styles.sectionLabel, styles.firstSectionLabel]}>
          {t.sectionTheme.toUpperCase()}
        </Text>
        <View>
          <SettingsRow
            label={currentTheme.name}
            icon={Palette}
            onPress={() => navigation.navigate('ThemePicker')}>
            <ChevronRight size={18} color={colors.muted} />
          </SettingsRow>
        </View>

        {/* Sound & Haptics */}
        <Text variant="caption" style={styles.sectionLabel}>
          {t.sectionSound.toUpperCase()}
        </Text>
        <View>
          <SettingsRow label={t.sound} icon={Volume2}>
            <Switch
              value={settings.soundEnabled}
              onValueChange={(v) => handleToggle('soundEnabled', v)}
            />
          </SettingsRow>
          <SettingsRow label={t.hapticFeedback} icon={Vibrate}>
            <Switch
              value={settings.hapticEnabled}
              onValueChange={(v) => handleToggle('hapticEnabled', v)}
            />
          </SettingsRow>
        </View>

        {/* Language */}
        <Text variant="caption" style={styles.sectionLabel}>
          {t.sectionLanguage.toUpperCase()}
        </Text>
        <View>
          <SettingsRow
            label={t.interfaceLanguage}
            icon={Languages}
            onPress={() => {
              setDialog({
                title: t.interfaceLanguage,
                buttons: [
                  { text: t.cancel, style: 'cancel' },
                  ...SUPPORTED_LOCALES.map((loc) => ({
                    text:
                      (loc === locale ? '✓ ' : '') + getLocaleBundle(loc).nativeName,
                    onPress: () => handleLocaleChange(loc),
                  })),
                ],
              });
            }}>
            <View style={styles.localeValue}>
              <Text variant="body" tone="muted">
                {locale.toUpperCase()}
              </Text>
              <ChevronRight size={18} color={colors.muted} />
            </View>
          </SettingsRow>
        </View>

        {/* Backup */}
        <Text variant="caption" style={styles.sectionLabel}>
          {t.sectionBackup.toUpperCase()}
        </Text>
        <View>
          <SettingsRow
            label={t.backupToGoogleDrive}
            icon={Cloud}
            onPress={async () => {
              try {
                await saveToGoogleDrive();
                setDialog({ title: t.done, message: t.backupSaved, buttons: [{ text: t.done }] });
              } catch (e: unknown) {
                const kind = classifyDriveError(e);
                if (kind === 'cancelled') return;
                console.error('[google-drive] save backup error:', kind, e instanceof Error ? e.message : e);
                setDialog({
                  title: t.error,
                  message: driveErrorMessage(t, e, t.backupFailed),
                  buttons: [{ text: t.done }],
                });
              }
            }}
          />
          <SettingsRow
            label={t.restoreFromGoogleDrive}
            icon={CloudDownload}
            onPress={async () => {
              try {
                const backup = await fetchGoogleDriveBackup();

                const modeDialog = (mode: 'merge' | 'replace') =>
                  setTimeout(() => {
                    setDialog({
                      title: t.replaceAllConfirm,
                      message: t.replaceAllWarning,
                      buttons: [
                        { text: t.cancel, style: 'cancel' },
                        {
                          text: t.replace,
                          style: 'destructive',
                          onPress: () => performDriveImport(backup, mode),
                        },
                      ],
                    });
                  }, 300);

                setDialog({
                  title: t.restoreTitle,
                  message:
                    backup.kind === 'json'
                      ? `${t.driveRestoreNoMedia}\n\n${t.chooseImportMode}`
                      : t.chooseImportMode,
                  buttons: [
                    { text: t.cancel, style: 'cancel' },
                    {
                      text: t.merge,
                      onPress: () => performDriveImport(backup, 'merge'),
                    },
                    {
                      text: t.replaceAll,
                      style: 'destructive',
                      onPress: () => modeDialog('replace'),
                    },
                  ],
                });
              } catch (e: unknown) {
                const kind = classifyDriveError(e);
                if (kind === 'cancelled') return;
                if (kind === 'no_backup') {
                  setDialog({ title: t.noBackup, message: t.noBackupMessage, buttons: [{ text: t.done }] });
                  return;
                }
                console.error('[google-drive] restore backup error:', kind, e instanceof Error ? e.message : e);
                setDialog({
                  title: t.error,
                  message: driveErrorMessage(t, e, t.restoreFailed),
                  buttons: [{ text: t.done }],
                });
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
        <Text variant="caption" style={styles.sectionLabel}>
          {t.sectionAbout.toUpperCase()}
        </Text>
        <View>
          <SettingsRow label={t.version} icon={Info}>
            <Text variant="body" tone="muted">
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
  sectionLabel: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sectionGap,
    paddingBottom: spacing.sm,
  },
  firstSectionLabel: {
    paddingTop: spacing.sm,
  },
  localeValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
