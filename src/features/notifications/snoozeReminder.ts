import RNFS from 'react-native-fs';
import { createMessage, deleteMessage, type Message } from '../../entities/message';
import { generateId, resolveMediaPath } from '../../shared/lib';
import { scheduleNotification } from './schedulingService';

export type SnoozeDelay = 'hour' | 'day';

export function canSnoozeReminder(message: Message | null): boolean {
  return message !== null && message.type === 'reminder' &&
    message.scheduledAt !== null && new Date(message.scheduledAt).getTime() <= Date.now();
}

/** Create an independent reminder; the delivered message stays in history. */
export async function snoozeReminder(message: Message, delay: SnoozeDelay): Promise<Message | null> {
  if (!canSnoozeReminder(message)) return null;
  const scheduledAt = new Date(Date.now() + (delay === 'hour' ? 60 : 1440) * 60_000).toISOString();
  const id = generateId();
  let payload = message.payload;
  let copiedPath: string | null = null;
  let copy: Message | null = null;

  try {
    if (payload) {
      const media = JSON.parse(payload);
      if (typeof media?.uri === 'string') {
        const uri = media.uri.replace(/^file:\/\//, '');
        const slash = uri.lastIndexOf('/');
        const extension = uri.slice(slash + 1).match(/\.[^.]+$/)?.[0] ?? '';
        const copyUri = `${uri.slice(0, slash + 1)}${id}${extension}`;
        const sourcePath = uri.startsWith('media/') ? resolveMediaPath(uri) : uri;
        copiedPath = copyUri.startsWith('media/') ? resolveMediaPath(copyUri) : copyUri;
        await RNFS.copyFile(sourcePath, copiedPath);
        payload = JSON.stringify({ ...media, uri: copyUri });
      }
    }

    copy = createMessage(message.chatId, 'reminder', message.body, scheduledAt,
      null, payload, id, message.checklist);
    scheduleNotification(copy);
    return copy;
  } catch (error) {
    if (copy) deleteMessage(copy.id);
    if (copiedPath) await RNFS.unlink(copiedPath).catch(() => {});
    throw error;
  }
}
