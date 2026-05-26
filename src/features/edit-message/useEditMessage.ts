import { useCallback } from 'react';
import { updateMessage, type Message } from '../../entities/message';
import { cancelNotification, scheduleNotification } from '../notifications';

export type EditFields = {
  body?: string;
  scheduledAt?: string | null;
  intervalMinutes?: number | null;
};

export function useEditMessage(): {
  saveEdit: (message: Message, fields: EditFields) => Message | null;
} {
  const saveEdit = useCallback((message: Message, fields: EditFields): Message | null => {
    cancelNotification(message.id);

    const updated = updateMessage(message.id, fields);
    if (!updated) return null;

    if (
      (updated.type === 'reminder' || updated.type === 'alarm') &&
      updated.scheduledAt
    ) {
      scheduleNotification(updated);
    } else if (
      updated.type === 'periodic' &&
      updated.intervalMinutes
    ) {
      scheduleNotification(updated);
    }

    return updated;
  }, []);

  return { saveEdit };
}
