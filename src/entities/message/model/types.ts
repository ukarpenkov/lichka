export type MessageType = 'simple' | 'reminder' | 'alarm' | 'periodic' | 'image';

export interface Message {
  id: string;
  chatId: string;
  type: MessageType;
  body: string;
  scheduledAt: string | null;
  intervalMinutes: number | null;
  enabled: boolean;
  payload: string | null;
  createdAt: string;
  updatedAt: string;
}
