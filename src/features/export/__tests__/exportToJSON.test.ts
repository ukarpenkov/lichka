jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/docs',
  mkdir: jest.fn(),
  exists: jest.fn().mockResolvedValue(false),
  readDir: jest.fn().mockResolvedValue([]),
  unlink: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn().mockResolvedValue(undefined),
  readFile: jest.fn(),
}));

import { exportToJSON } from '../exportToJSON';

const mockGetChats = jest.fn();
const mockGetMessagesByChatId = jest.fn();
const mockGetSettings = jest.fn();

jest.mock('../../../entities/chat', () => ({
  getChats: () => mockGetChats(),
}));

jest.mock('../../../entities/message', () => ({
  getMessagesByChatId: (chatId: string) => mockGetMessagesByChatId(chatId),
  getAllReadMarkers: () => ({}),
}));

jest.mock('../../../entities/settings', () => ({
  getSettings: () => mockGetSettings(),
}));

const createChat = (id: string, title: string) => ({
  id,
  title,
  avatarPath: null,
  isSystem: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

const createMessage = (overrides: Partial<{
  id: string;
  type: string;
  body: string;
  payload: string;
}> = {}) => ({
  id: overrides.id ?? 'msg-1',
  chatId: 'chat-1',
  type: overrides.type ?? 'simple',
  body: overrides.body ?? 'Hello',
  scheduledAt: null,
  intervalMinutes: null,
  enabled: false,
  payload: overrides.payload ?? null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

describe('exportToJSON with image messages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSettings.mockReturnValue({
      locale: 'en',
      themePresetId: 'light',
      hapticEnabled: false,
      soundEnabled: false,
    });
  });

  it('includes image messages in export', async () => {
    const imageMessage = createMessage({
      type: 'image',
      body: '',
      payload: JSON.stringify({ uri: 'media/images/1.jpg', width: 800, height: 600 }),
    });

    mockGetChats.mockReturnValue([createChat('chat-1', 'Test')]);
    mockGetMessagesByChatId.mockReturnValue([
      createMessage({ type: 'simple', body: 'Text message' }),
      imageMessage,
    ]);

    await exportToJSON();

    const writeFileCalls = require('react-native-fs').writeFile.mock.calls;
    expect(writeFileCalls).toHaveLength(1);
    const exportedJson = JSON.parse(writeFileCalls[0][1]);

    expect(exportedJson.schema_version).toBe(2);
    expect(exportedJson.chats[0].isSystem).toBe(false);

    const messages = exportedJson.chats[0].messages;
    expect(messages).toHaveLength(2);
    const exportedImage = messages.find((m: { type: string }) => m.type === 'image');
    expect(exportedImage).toBeDefined();
    expect(exportedImage.payload).toBe(JSON.stringify({ uri: 'media/images/1.jpg', width: 800, height: 600 }));
  });

  it('preserves image payload as string', async () => {
    const imageMessage = createMessage({
      type: 'image',
      body: 'My screenshot',
      payload: JSON.stringify({ uri: 'media/images/1.jpg', width: 400, height: 300 }),
    });

    mockGetChats.mockReturnValue([createChat('chat-1', 'Test')]);
    mockGetMessagesByChatId.mockReturnValue([imageMessage]);

    await exportToJSON();

    const writeFileCalls = require('react-native-fs').writeFile.mock.calls;
    const exportedJson = JSON.parse(writeFileCalls[0][1]);
    const exportedImage = exportedJson.chats[0].messages[0];

    expect(exportedImage.type).toBe('image');
    expect(exportedImage.body).toBe('My screenshot');
    const parsedPayload = JSON.parse(exportedImage.payload);
    expect(parsedPayload.uri).toBe('media/images/1.jpg');
    expect(parsedPayload.width).toBe(400);
    expect(parsedPayload.height).toBe(300);
  });
});
