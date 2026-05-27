import RNFS from 'react-native-fs';

import { getChats } from '../../entities/chat';
import { getMessagesByChatId } from '../../entities/message';
import { getSettings, type AppSettings } from '../../entities/settings';

interface ExportMessage {
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

interface ExportChat {
  id: string;
  title: string;
  avatarPath: string | null;
  createdAt: string;
  updatedAt: string;
  messages: ExportMessage[];
}

interface ExportData {
  schema_version: number;
  exported_at: string;
  chats: ExportChat[];
  settings: AppSettings;
}

export async function exportToJSON(): Promise<string> {
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

  const data: ExportData = {
    schema_version: 1,
    exported_at: new Date().toISOString(),
    chats: exportChats,
    settings,
  };

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fileName = `licka-backup-${timestamp}.json`;
  const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

  await RNFS.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');

  return filePath;
}
