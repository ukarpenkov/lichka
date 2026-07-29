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
