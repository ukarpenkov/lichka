import { getScheduledMessages } from '../../entities/message';
import { getChatById } from '../../entities/chat';
import {
  updateScheduledWidgetSnapshot,
  type ScheduledWidgetSnapshotItem,
} from '../../shared/lib/scheduledWidget';

export const SCHEDULED_WIDGET_SNAPSHOT_LIMIT = 25;

export function buildScheduledWidgetSnapshot(
  limit: number = SCHEDULED_WIDGET_SNAPSHOT_LIMIT,
): ScheduledWidgetSnapshotItem[] {
  const messages = getScheduledMessages();
  const items: ScheduledWidgetSnapshotItem[] = [];
  for (const msg of messages) {
    if (items.length >= limit) break;
    const chat = getChatById(msg.chatId);
    items.push({
      messageId: msg.id,
      chatId: msg.chatId,
      type: msg.type,
      body: msg.body,
      chatTitle: chat?.title ?? '—',
      scheduledAt: msg.scheduledAt ? new Date(msg.scheduledAt).getTime() : 0,
    });
  }
  return items;
}

/** Push current scheduled list to the Android widget snapshot. */
export function syncScheduledWidgetSnapshot(): void {
  updateScheduledWidgetSnapshot(buildScheduledWidgetSnapshot());
}
