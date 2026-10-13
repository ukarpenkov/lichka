import {
  extractTemplateId,
  isPeriodicDisplayId,
  toggleMessageChecklistItem,
} from '../../../entities/message';

export function toggleChecklistItem(messageId: string, itemId: string) {
  const id = isPeriodicDisplayId(messageId) ? extractTemplateId(messageId) : messageId;
  return toggleMessageChecklistItem(id, itemId);
}
