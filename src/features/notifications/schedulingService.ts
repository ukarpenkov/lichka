import { Platform } from 'react-native';
import {
  scheduleReminder,
  schedulePeriodic,
  scheduleAlarm,
  cancelAlarm,
} from '../../shared/lib/notificationChannels';
import { getChatById } from '../../entities/chat';
import type { Message } from '../../entities/message';
import { syncScheduledWidgetSnapshot } from '../scheduled-widget';

export function scheduleNotification(message: Message): void {
  if (Platform.OS !== 'android') return;

  const chat = getChatById(message.chatId);
  const chatTitle = chat?.title ?? 'Lichka';

  if (message.type === 'alarm') {
    if (message.scheduledAt) {
      const triggerAt = new Date(message.scheduledAt).getTime();
      if (triggerAt > Date.now()) {
        scheduleAlarm(message.id, message.chatId, message.body, chatTitle, triggerAt);
      }
    }
  } else if (message.type === 'reminder') {
    if (message.scheduledAt) {
      const triggerAt = new Date(message.scheduledAt).getTime();
      if (triggerAt > Date.now()) {
        scheduleReminder(message.id, message.chatId, message.body, chatTitle, triggerAt);
      }
    }
  } else if (message.type === 'periodic') {
    if (message.intervalMinutes) {
      const triggerAt = Date.now() + message.intervalMinutes * 60_000;
      schedulePeriodic(
        message.id,
        message.chatId,
        message.body,
        chatTitle,
        message.intervalMinutes,
        triggerAt,
      );
    }
  }

  syncScheduledWidgetSnapshot();
}

export function cancelNotification(messageId: string): void {
  if (Platform.OS !== 'android') return;
  cancelAlarm(messageId);
  syncScheduledWidgetSnapshot();
}
