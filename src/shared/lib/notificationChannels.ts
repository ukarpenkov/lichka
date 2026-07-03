import { NativeModules, Platform } from 'react-native';

const { NotificationModule } = NativeModules;

/** Register Android notification channels (reminders + alarms). No-op on iOS. */
export function registerNotificationChannels(): void {
  if (Platform.OS === 'android') {
    NotificationModule.registerChannels();
  }
}

export function scheduleReminder(
  messageId: string,
  chatId: string,
  body: string,
  chatTitle: string,
  triggerAtMillis: number,
): void {
  NotificationModule.scheduleReminder(messageId, chatId, body, chatTitle, triggerAtMillis);
}

export function schedulePeriodic(
  messageId: string,
  chatId: string,
  body: string,
  chatTitle: string,
  intervalMinutes: number,
  triggerAtMillis: number,
): void {
  NotificationModule.schedulePeriodic(
    messageId,
    chatId,
    body,
    chatTitle,
    intervalMinutes,
    triggerAtMillis,
  );
}

export function cancelAlarm(messageId: string): void {
  NotificationModule.cancelAlarm(messageId);
}

export function scheduleAlarm(
  messageId: string,
  chatId: string,
  body: string,
  chatTitle: string,
  triggerAtMillis: number,
): void {
  NotificationModule.scheduleAlarm(messageId, chatId, body, chatTitle, triggerAtMillis);
}

export function canScheduleExactAlarms(): Promise<boolean> {
  return NotificationModule.canScheduleExactAlarms();
}

export function requestIgnoreBatteryOptimizations(): void {
  NotificationModule.requestIgnoreBatteryOptimizations();
}

/** Открывает системный экран запроса разрешения SCHEDULE_EXACT_ALARM (Android 12). */
export function requestScheduleExactAlarm(): void {
  NotificationModule.requestScheduleExactAlarm();
}

export function getInitialChatId(): Promise<string | null> {
  return NotificationModule.getInitialChatId();
}

export function getInitialMessageId(): Promise<string | null> {
  return NotificationModule.getInitialMessageId();
}

export function consumeInitialChatId(): void {
  NotificationModule.consumeInitialChatId();
}

export const CHANNEL_REMINDERS = 'reminders';
export const CHANNEL_ALARMS = 'alarms';
