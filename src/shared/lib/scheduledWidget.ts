import { NativeModules, Platform } from 'react-native';

const { WidgetModule } = NativeModules;

function requireWidgetModule(): NonNullable<typeof WidgetModule> {
  if (!WidgetModule) {
    throw new Error('WidgetModule is not linked. Rebuild the native app (android).');
  }
  return WidgetModule;
}

export type ScheduledWidgetSnapshotItem = {
  messageId: string;
  chatId: string;
  type: string;
  body: string;
  chatTitle: string;
  scheduledAt: number;
};

/** Persist snapshot for the Android home-screen widget. No-op on iOS. */
export function updateScheduledWidgetSnapshot(
  items: ScheduledWidgetSnapshotItem[],
): void {
  if (Platform.OS !== 'android') return;
  requireWidgetModule().updateScheduledWidgetSnapshot(JSON.stringify(items));
}

/** Push in-app locale copy so the Android widget is not stuck on Russian strings.xml. */
export function updateScheduledWidgetLocale(
  emptyText: string,
  untitledText: string,
): void {
  if (Platform.OS !== 'android') return;
  const module = NativeModules.WidgetModule;
  if (!module?.setWidgetLocaleStrings) return;
  module.setWidgetLocaleStrings(emptyText, untitledText);
}

export function getInitialWidgetOpenTarget(): Promise<string | null> {
  if (Platform.OS !== 'android') return Promise.resolve(null);
  return requireWidgetModule().getInitialOpenTarget();
}

export function getInitialWidgetMessageId(): Promise<string | null> {
  if (Platform.OS !== 'android') return Promise.resolve(null);
  return requireWidgetModule().getInitialWidgetMessageId();
}

export function consumeInitialWidgetOpen(): void {
  if (Platform.OS !== 'android') return;
  requireWidgetModule().consumeInitialWidgetOpen();
}
