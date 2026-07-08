import { NativeModules, Platform } from 'react-native';

const { NotificationModule } = NativeModules;

function requireNotificationModule(): NonNullable<typeof NotificationModule> {
  if (!NotificationModule) {
    throw new Error(
      'NotificationModule is not linked. Rebuild the native app (android).',
    );
  }
  return NotificationModule;
}

/** Register Android notification channels (reminders + alarms). No-op on iOS. */
export function registerNotificationChannels(): void {
  if (Platform.OS === 'android') {
    requireNotificationModule().registerChannels();
  }
}

export function scheduleReminder(
  messageId: string,
  chatId: string,
  body: string,
  chatTitle: string,
  triggerAtMillis: number,
): void {
  requireNotificationModule().scheduleReminder(
    messageId,
    chatId,
    body,
    chatTitle,
    triggerAtMillis,
  );
}

export function schedulePeriodic(
  messageId: string,
  chatId: string,
  body: string,
  chatTitle: string,
  intervalMinutes: number,
  triggerAtMillis: number,
): void {
  requireNotificationModule().schedulePeriodic(
    messageId,
    chatId,
    body,
    chatTitle,
    intervalMinutes,
    triggerAtMillis,
  );
}

export function cancelAlarm(messageId: string): void {
  requireNotificationModule().cancelAlarm(messageId);
}

export function scheduleAlarm(
  messageId: string,
  chatId: string,
  body: string,
  chatTitle: string,
  triggerAtMillis: number,
): void {
  requireNotificationModule().scheduleAlarm(
    messageId,
    chatId,
    body,
    chatTitle,
    triggerAtMillis,
  );
}

export function canScheduleExactAlarms(): Promise<boolean> {
  return requireNotificationModule().canScheduleExactAlarms();
}

export function requestIgnoreBatteryOptimizations(): void {
  requireNotificationModule().requestIgnoreBatteryOptimizations();
}

/** Открывает системный экран запроса разрешения SCHEDULE_EXACT_ALARM (Android 12). */
export function requestScheduleExactAlarm(): void {
  requireNotificationModule().requestScheduleExactAlarm();
}

export function getInitialChatId(): Promise<string | null> {
  return requireNotificationModule().getInitialChatId();
}

export function getInitialMessageId(): Promise<string | null> {
  return requireNotificationModule().getInitialMessageId();
}

export function consumeInitialChatId(): void {
  requireNotificationModule().consumeInitialChatId();
}

export const CHANNEL_REMINDERS = 'reminders';
export const CHANNEL_ALARMS = 'alarms';
