const mockExecuteSync = jest.fn();
const mockGetChatById = jest.fn();
const mockGetMessageById = jest.fn();
const mockUpdateSettings = jest.fn();
const mockGetSettings = jest.fn();

jest.mock('../../../shared/db', () => ({
  getDatabase: () => ({ executeSync: mockExecuteSync }),
}));

jest.mock('../../../shared/db/normalizeSearchText', () => ({
  normalizeSearchText: (t: string) => t.toLocaleLowerCase(),
}));

jest.mock('../../../entities/chat', () => ({
  getChatById: (id: string) => mockGetChatById(id),
}));

jest.mock('../../../entities/message', () => ({
  getMessageById: (id: string) => mockGetMessageById(id),
}));

jest.mock('../../../entities/settings', () => ({
  updateSettings: (s: unknown) => mockUpdateSettings(s),
  getSettings: () => mockGetSettings(),
}));

jest.mock('../../../shared/config/locale', () => ({
  getDictionary: () => ({ invalidFormat: 'Invalid file format' }),
}));

import { importFromJSON } from '../importFromJSON';

const baseBackup = {
  schema_version: 2,
  exported_at: '2026-01-01T00:00:00.000Z',
  chats: [
    {
      id: 'saved-messages',
      title: 'Saved',
      avatarPath: null,
      isSystem: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      messages: [
        {
          id: 'msg-1',
          type: 'simple',
          body: 'Hello',
          scheduledAt: null,
          intervalMinutes: null,
          enabled: false,
          payload: null,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    },
  ],
  settings: {
    locale: 'en',
    themePresetId: 'light',
    hapticEnabled: false,
    soundEnabled: false,
  },
  readMarkers: { 'saved-messages': '2026-01-01T12:00:00.000Z' },
};

describe('importFromJSON', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSettings.mockReturnValue({ locale: 'en' });
    mockGetChatById.mockReturnValue(null);
    mockGetMessageById.mockReturnValue(null);
    mockExecuteSync.mockReturnValue({ rows: [] });
  });

  it('rejects unsupported schema_version', () => {
    expect(() =>
      importFromJSON(JSON.stringify({ ...baseBackup, schema_version: 99 }), 'merge'),
    ).toThrow('Invalid file format');
  });

  it('wraps replace import in a transaction and clears read markers', () => {
    importFromJSON(JSON.stringify(baseBackup), 'replace');

    const sqls = mockExecuteSync.mock.calls.map((c) => c[0] as string);
    expect(sqls[0]).toBe('BEGIN TRANSACTION');
    expect(sqls).toContain('DELETE FROM chat_read_markers');
    expect(sqls).toContain('DELETE FROM chats');
    expect(sqls[sqls.length - 1]).toBe('COMMIT');
  });

  it('writes is_system and forces saved-messages protection', () => {
    importFromJSON(JSON.stringify(baseBackup), 'replace');

    const insertChat = mockExecuteSync.mock.calls.find(
      (c) =>
        typeof c[0] === 'string' &&
        (c[0] as string).includes('INSERT INTO chats') &&
        (c[0] as string).includes('is_system'),
    );
    expect(insertChat).toBeDefined();
    expect(insertChat![1][3]).toBe(1);

    const forceSystem = mockExecuteSync.mock.calls.find(
      (c) =>
        typeof c[0] === 'string' &&
        (c[0] as string) === 'UPDATE chats SET is_system = 1 WHERE id = ?',
    );
    expect(forceSystem![1][0]).toBe('saved-messages');
  });

  it('accepts legacy schema_version 1 without isSystem', () => {
    const legacy = {
      ...baseBackup,
      schema_version: 1,
      chats: [
        {
          id: 'saved-messages',
          title: 'Saved',
          avatarPath: null,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
          messages: baseBackup.chats[0].messages,
        },
      ],
      readMarkers: undefined,
    };

    const result = importFromJSON(JSON.stringify(legacy), 'replace');
    expect(result.chatsAdded).toBe(1);
    expect(result.messagesAdded).toBe(1);
  });

  it('rejects invalid message types', () => {
    const bad = {
      ...baseBackup,
      chats: [
        {
          ...baseBackup.chats[0],
          messages: [{ ...baseBackup.chats[0].messages[0], type: 'video' }],
        },
      ],
    };

    expect(() => importFromJSON(JSON.stringify(bad), 'merge')).toThrow(
      'Invalid file format',
    );
    const sqls = mockExecuteSync.mock.calls.map((c) => c[0] as string);
    expect(sqls).toContain('ROLLBACK');
  });
});
