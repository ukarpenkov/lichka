import { NativeModules, Platform } from 'react-native';

const { NotificationModule } = NativeModules;

/** Register Android notification channels (reminders + alarms). No-op on iOS. */
export function registerNotificationChannels(): void {
  if (Platform.OS === 'android') {
    NotificationModule.registerChannels();
  }
}

export const CHANNEL_REMINDERS = 'reminders';
export const CHANNEL_ALARMS = 'alarms';
