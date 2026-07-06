import { getChats } from '../../entities/chat';
import { getMessagesByChatId } from '../../entities/message';
import { getSettings, type AppSettings } from '../../entities/settings';

export interface ExportMessage {
  id: string;
  type: string;
  body: string;
  scheduledAt: string | null;
  intervalMinutes: number | null;
  enabled: boolean;
  payload: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExportChat {
  id: string;
  title: string;
  avatarPath: string | null;
  createdAt: string;
  updatedAt: string;
  messages: ExportMessage[];
}

export interface ExportData {
  schema_version: number;
  exported_at: string;
  chats: ExportChat[];
  settings: AppSettings;
}

export function buildExportData(): ExportData {
  const chats = getChats();
  const settings = getSettings();

  const exportChats: ExportChat[] = chats.map((chat) => {
    const messages = getMessagesByChatId(chat.id);
    return {
      id: chat.id,
      title: chat.title,
      avatarPath: chat.avatarPath,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      messages: messages.map((m) => ({
        id: m.id,
        type: m.type,
        body: m.body,
        scheduledAt: m.scheduledAt,
        intervalMinutes: m.intervalMinutes,
        enabled: m.enabled,
        payload: m.payload,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      })),
    };
  });

  return {
    schema_version: 1,
    exported_at: new Date().toISOString(),
    chats: exportChats,
    settings,
  };
}
