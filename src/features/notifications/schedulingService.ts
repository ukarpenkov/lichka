import { Platform } from 'react-native';
import {
  scheduleReminder,
  schedulePeriodic,
  cancelAlarm,
} from '../../shared/lib/notificationChannels';
import { getChatById } from '../../entities/chat';
import type { Message } from '../../entities/message';

export function scheduleNotification(message: Message): void {
  if (Platform.OS !== 'android') return;

  const chat = getChatById(message.chatId);
  const chatTitle = chat?.title ?? 'Lichka';

  if (message.type === 'reminder' || message.type === 'alarm') {
    if (!message.scheduledAt) return;
    const triggerAt = new Date(message.scheduledAt).getTime();
    if (triggerAt <= Date.now()) return;
    scheduleReminder(message.id, message.chatId, message.body, chatTitle, triggerAt);
  } else if (message.type === 'periodic') {
    if (!message.intervalMinutes) return;
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

export function cancelNotification(messageId: string): void {
  if (Platform.OS !== 'android') return;
  cancelAlarm(messageId);
}
