jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/docs',
  mkdir: jest.fn().mockResolvedValue(undefined),
  exists: jest.fn().mockResolvedValue(true),
  readDir: jest.fn().mockResolvedValue([]),
  unlink: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn().mockResolvedValue(undefined),
  copyFile: jest.fn().mockResolvedValue(undefined),
  readFile: jest.fn().mockResolvedValue('{}'),
}));

import { createMessage, getVisibleMessagesByChatId, getScheduledMessages, deleteMessage } from '../entities/message';
import { exportToJSON } from '../features/export';
import { importFromJSON } from '../features/import';
import type { Message } from '../entities/message';

const mockExecuteSync = jest.fn();
const mockGetChats = jest.fn();
const mockGetMessagesByChatId = jest.fn();
const mockGetSettings = jest.fn();
const mockGetChatById = jest.fn();
const mockGetMessageById = jest.fn();
const mockUpdateSettings = jest.fn();

jest.mock('../shared/db', () => ({
  getDatabase: () => ({
    executeSync: mockExecuteSync,
  }),
}));

jest.mock('../entities/chat', () => ({
  getChats: () => mockGetChats(),
  getChatById: (id: string) => mockGetChatById(id),
}));

jest.mock('../entities/message/model/messageRepository', () => {
  const actual = jest.requireActual('../entities/message/model/messageRepository');
  return {
    ...actual,
    getMessageById: (id: string) => mockGetMessageById(id),
  };
});

jest.mock('../entities/message', () => {
  const actual = jest.requireActual('../entities/message');
  return {
    ...actual,
    getMessagesByChatId: (chatId: string) => mockGetMessagesByChatId(chatId),
    getMessageById: (id: string) => mockGetMessageById(id),
  };
});

jest.mock('../entities/settings', () => ({
  getSettings: () => mockGetSettings(),
  updateSettings: (...args: unknown[]) => mockUpdateSettings(...args),
}));

const sampleDbRow = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 'msg-1',
  chat_id: 'chat-1',
  type: 'image',
  body: '',
  scheduled_at: null,
  interval_minutes: null,
  enabled: 0,
  payload: '{"uri":"media/images/1.jpg","width":800,"height":600}',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockExecuteSync.mockReturnValue({ rows: [] });
  mockGetSettings.mockReturnValue({ locale: 'en', theme: 'light', hapticEnabled: false, soundEnabled: false });
});

describe('Image Messages Integration', () => {
  describe('Scenario 1: Send image without caption', () => {
    it('creates message with type=image and payload', () => {
      mockExecuteSync.mockReturnValue({ rows: [] });

      const msg = createMessage('chat-1', 'image', '[image:800x600]', null, null, '{"uri":"media/images/1.jpg","width":800,"height":600}');

      expect(msg.type).toBe('image');
      expect(msg.body).toBe('[image:800x600]');
      expect(msg.enabled).toBe(false);
      expect(msg.payload).toBe('{"uri":"media/images/1.jpg","width":800,"height":600}');
    });

    it('returns image message in getVisibleMessagesByChatId', () => {
      mockExecuteSync.mockReturnValue({ rows: [sampleDbRow()] });

      const messages = getVisibleMessagesByChatId('chat-1');

      expect(messages).toHaveLength(1);
      expect(messages[0].type).toBe('image');
    });
  });

  describe('Scenario 2: Send image with caption', () => {
    it('creates message with body as caption', () => {
      mockExecuteSync.mockReturnValue({ rows: [] });

      const msg = createMessage('chat-1', 'image', 'My screenshot', null, null, '{"uri":"media/images/1.jpg","width":800,"height":600}');

      expect(msg.type).toBe('image');
      expect(msg.body).toBe('My screenshot');
      expect(msg.enabled).toBe(false);
    });
  });

  describe('Scenario 3: Delete image message', () => {
    it('deletes image message and cleans up media file', () => {
      mockExecuteSync
        .mockReturnValueOnce({ rows: [sampleDbRow()] })
        .mockReturnValueOnce({ rows: [] });

      const result = deleteMessage('msg-1');

      expect(result).toBe(true);
      expect(mockExecuteSync).toHaveBeenCalledWith(
        'DELETE FROM messages WHERE id = ?',
        ['msg-1'],
      );
    });
  });

  describe('Scenario 4: Export - Import image message', () => {
    it('exports image message with payload', async () => {
      mockGetChats.mockReturnValue([{
        id: 'chat-1', title: 'Test', avatarPath: null,
        createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
      }]);
      mockGetMessagesByChatId.mockReturnValue([{
        id: 'msg-img', chatId: 'chat-1', type: 'image', body: '',
        scheduledAt: null, intervalMinutes: null, enabled: false,
        payload: '{"uri":"media/images/1.jpg","width":800,"height":600}',
        createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
      }] as Message[]);

      await exportToJSON();

      const writeFileCalls = require('react-native-fs').writeFile.mock.calls;
      const json = JSON.parse(writeFileCalls[0][1]);

      expect(json.chats[0].messages).toHaveLength(1);
      expect(json.chats[0].messages[0].type).toBe('image');
      expect(json.chats[0].messages[0].payload).toBeTruthy();
    });

    it('imports image message back correctly', () => {
      mockGetChatById.mockReturnValue(null);
      mockGetMessageById.mockReturnValue(null);
      mockExecuteSync.mockReturnValue({ rows: [] });

      const exportData = {
        schema_version: 1,
        exported_at: '2026-01-01T00:00:00.000Z',
        chats: [{
          id: 'chat-1', title: 'Test', avatarPath: null,
          createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
          messages: [{
            id: 'msg-img', type: 'image', body: 'My pic',
            scheduledAt: null, intervalMinutes: null, enabled: false,
            payload: '{"uri":"media/images/1.jpg","width":800,"height":600}',
            createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
          }],
        }],
        settings: { locale: 'en', theme: 'light', hapticEnabled: false, soundEnabled: false },
      };

      const result = importFromJSON(JSON.stringify(exportData), 'merge');

      expect(result.messagesAdded).toBe(1);
      expect(mockExecuteSync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO messages'),
        expect.arrayContaining(['msg-img', 'chat-1', 'image', 'My pic']),
      );
    });
  });

  describe('Scenario 5: Image message not in scheduled', () => {
    it('excludes image from getScheduledMessages', () => {
      mockExecuteSync.mockReturnValue({ rows: [] });
      getScheduledMessages();

      const [sql] = mockExecuteSync.mock.calls[0];
      expect(sql).toContain("type IN ('reminder', 'alarm', 'periodic')");
      expect(sql).not.toContain('image');
    });
  });

  describe('Scenario 6: Image message enabled=false', () => {
    it('creates image message with enabled=false', () => {
      mockExecuteSync.mockReturnValue({ rows: [] });

      const msg = createMessage('chat-1', 'image', '', null, null, '{"uri":"media/images/1.jpg"}');

      expect(msg.enabled).toBe(false);
    });
  });
});
