import {
  extractTemplateId,
  finishPeriodicMessage,
  isPeriodicDisplayId,
  type Message,
} from '../../entities/message';
import { cancelNotification } from './schedulingService';

export function canStopPeriodicReminder(message: Message | null): boolean {
  return (
    message !== null &&
    message.type === 'periodic' &&
    message.enabled &&
    isPeriodicDisplayId(message.id)
  );
}

export function stopPeriodicReminder(message: Message): Message | null {
  if (!canStopPeriodicReminder(message)) return null;
  const updated = finishPeriodicMessage(extractTemplateId(message.id));
  if (updated) cancelNotification(updated.id);
  return updated;
}
