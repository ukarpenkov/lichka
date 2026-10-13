export type MessageType = 'simple' | 'reminder' | 'alarm' | 'periodic' | 'image';

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface Message {
  id: string;
  chatId: string;
  type: MessageType;
  body: string;
  scheduledAt: string | null;
  intervalMinutes: number | null;
  enabled: boolean;
  payload: string | null;
  /** Null/absent for ordinary messages, ordered items for a checklist. */
  checklist?: ChecklistItem[] | null;
  createdAt: string;
  updatedAt: string;
}
