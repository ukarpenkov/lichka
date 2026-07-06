jest.mock('react-native-fs', () => ({
  CachesDirectoryPath: '/mock/cache',
  DownloadDirectoryPath: '/mock/download',
  ExternalDirectoryPath: '/mock/external',
  DocumentDirectoryPath: '/mock/docs',
  mkdir: jest.fn().mockResolvedValue(undefined),
  exists: jest.fn().mockResolvedValue(true),
  writeFile: jest.fn().mockResolvedValue(undefined),
  copyFile: jest.fn().mockResolvedValue(undefined),
  unlink: jest.fn().mockResolvedValue(undefined),
  readDir: jest.fn().mockResolvedValue([]),
}));

jest.mock('react-native-zip-archive', () => ({
  zip: jest.fn().mockResolvedValue('/mock/download/licka-backup.zip'),
  unzip: jest.fn(),
}));

import RNFS from 'react-native-fs';
import { zip } from 'react-native-zip-archive';
import { exportToZIP } from '../exportToZIP';

const mockGetChats = jest.fn();
const mockGetMessagesByChatId = jest.fn();
const mockGetSettings = jest.fn();

jest.mock('../../../entities/chat', () => ({
  getChats: () => mockGetChats(),
}));
jest.mock('../../../entities/message', () => ({
  getMessagesByChatId: (chatId: string) => mockGetMessagesByChatId(chatId),
}));
jest.mock('../../../entities/settings', () => ({
  getSettings: () => mockGetSettings(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  (RNFS.exists as jest.Mock).mockResolvedValue(true);
  (zip as jest.Mock).mockResolvedValue('/mock/download/licka-backup.zip');
  mockGetSettings.mockReturnValue({ locale: 'en', theme: 'light', hapticEnabled: false, soundEnabled: false });
});

const chat = (id: string, avatarPath: string | null) => ({
  id,
  title: id,
  avatarPath,
  isSystem: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

const message = (overrides: Partial<{ id: string; type: string; body: string; payload: string }> = {}) => ({
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

describe('exportToZIP', () => {
  it('writes backup.json and zips staging dir to public Download', async () => {
    mockGetChats.mockReturnValue([chat('chat-1', null)]);
    mockGetMessagesByChatId.mockReturnValue([message()]);

    const path = await exportToZIP();

    expect(path).toMatch(/\/mock\/download\/licka-backup-.*\.zip$/);

    const writeFileCalls = (RNFS.writeFile as jest.Mock).mock.calls;
    const backupCall = writeFileCalls.find((c: string[]) => c[0].endsWith('/backup.json'));
    expect(backupCall).toBeDefined();
    const json = JSON.parse(backupCall![1] as string);
    expect(json.schema_version).toBe(1);
    expect(json.chats).toHaveLength(1);

    expect(zip).toHaveBeenCalledTimes(1);
    const [sourceDir, targetPath] = (zip as jest.Mock).mock.calls[0];
    expect(sourceDir).toMatch(/\/mock\/cache\/lichka-export-staging-/);
    expect(targetPath).toBe(path);
  });

  it('copies referenced avatar, image and voice media into staging', async () => {
    mockGetChats.mockReturnValue([chat('chat-1', 'media/avatars/chat-1.jpg')]);
    mockGetMessagesByChatId.mockReturnValue([
      message({ id: 'img-1', type: 'image', payload: JSON.stringify({ uri: 'media/images/img-1.jpg', width: 800, height: 600 }) }),
      message({ id: 'voc-1', type: 'simple', payload: JSON.stringify({ uri: 'media/voice/voc-1.m4a' }) }),
      message({ id: 'txt-1', type: 'simple', body: 'no media' }),
    ]);

    await exportToZIP();

    const copyCalls = (RNFS.copyFile as jest.Mock).mock.calls;
    const copiedSources = copyCalls.map((c: string[]) => c[0]);
    expect(copiedSources).toContain('/mock/docs/media/avatars/chat-1.jpg');
    expect(copiedSources).toContain('/mock/docs/media/images/img-1.jpg');
    expect(copiedSources).toContain('/mock/docs/media/voice/voc-1.m4a');
  });

  it('skips media files that do not exist on disk', async () => {
    mockGetChats.mockReturnValue([chat('chat-1', null)]);
    mockGetMessagesByChatId.mockReturnValue([
      message({ id: 'img-1', type: 'image', payload: JSON.stringify({ uri: 'media/images/img-1.jpg' }) }),
    ]);
    (RNFS.exists as jest.Mock).mockResolvedValue(false);

    await exportToZIP();

    const copyCalls = (RNFS.copyFile as jest.Mock).mock.calls;
    expect(copyCalls).toHaveLength(0);
  });

  it('ignores payload uri outside media/ namespace', async () => {
    mockGetChats.mockReturnValue([chat('chat-1', null)]);
    mockGetMessagesByChatId.mockReturnValue([
      message({ id: 'm', type: 'image', payload: JSON.stringify({ uri: '/data/absolute/path.jpg' }) }),
    ]);

    await exportToZIP();

    const copyCalls = (RNFS.copyFile as jest.Mock).mock.calls;
    expect(copyCalls).toHaveLength(0);
  });

  it('cleans up staging dir after successful zip', async () => {
    mockGetChats.mockReturnValue([chat('chat-1', null)]);
    mockGetMessagesByChatId.mockReturnValue([message()]);

    await exportToZIP();

    const unlinkCalls = (RNFS.unlink as jest.Mock).mock.calls.map((c: string[]) => c[0]);
    expect(unlinkCalls.some((p) => /lichka-export-staging-/.test(p))).toBe(true);
  });

  it('falls back to ExternalDirectoryPath when Download write fails', async () => {
    mockGetChats.mockReturnValue([chat('chat-1', null)]);
    mockGetMessagesByChatId.mockReturnValue([message()]);
    (zip as jest.Mock)
      .mockRejectedValueOnce(new Error('EACCES'))
      .mockResolvedValueOnce('/mock/external/licka-backup.zip');

    const path = await exportToZIP();

    expect(path).toMatch(/\/mock\/external\/licka-backup-.*\.zip$/);
    expect(zip).toHaveBeenCalledTimes(2);
    expect((zip as jest.Mock).mock.calls[1][1]).toBe(path);
  });
});
