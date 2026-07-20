import { getChats } from '../../entities/chat';
import {
  getMessagesByChatId,
  getAllReadMarkers,
} from '../../entities/message';
import { getSettings, type AppSettings } from '../../entities/settings';

/** Current export format version (independent of DB migration versions). */
export const EXPORT_SCHEMA_VERSION = 2;
export const MIN_SUPPORTED_EXPORT_SCHEMA = 1;
export const MAX_SUPPORTED_EXPORT_SCHEMA = 2;

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
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  messages: ExportMessage[];
}

export interface ExportData {
  schema_version: number;
  exported_at: string;
  chats: ExportChat[];
  settings: AppSettings;
  /** chatId → last_read_at ISO */
  readMarkers: Record<string, string>;
}

export function buildExportData(): ExportData {
  const chats = getChats();
  const settings = getSettings();
  const readMarkers = getAllReadMarkers();

  const exportChats: ExportChat[] = chats.map((chat) => {
    const messages = getMessagesByChatId(chat.id);
    return {
      id: chat.id,
      title: chat.title,
      avatarPath: chat.avatarPath,
      isSystem: chat.isSystem,
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
    schema_version: EXPORT_SCHEMA_VERSION,
    exported_at: new Date().toISOString(),
    chats: exportChats,
    settings,
    readMarkers,
  };
}
