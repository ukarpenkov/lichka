jest.mock('react-native-fs', () => ({
  CachesDirectoryPath: '/mock/cache',
  DocumentDirectoryPath: '/mock/docs',
  mkdir: jest.fn().mockResolvedValue(undefined),
  exists: jest.fn().mockResolvedValue(true),
  readFile: jest.fn(),
  readDir: jest.fn(),
  copyFile: jest.fn().mockResolvedValue(undefined),
  unlink: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('react-native-zip-archive', () => ({
  unzip: jest.fn(),
  zip: jest.fn(),
}));

import RNFS from 'react-native-fs';
import { unzip } from 'react-native-zip-archive';
import { importFromZIP } from '../importFromZIP';
import { importFromJSON } from '../importFromJSON';

jest.mock('../importFromJSON', () => ({
  importFromJSON: jest.fn(),
}));

const exportData = {
  schema_version: 1,
  exported_at: '2026-01-01T00:00:00.000Z',
  chats: [{
    id: 'chat-1', title: 'Test', avatarPath: 'media/avatars/chat-1.jpg',
    createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    messages: [{
      id: 'msg-1', type: 'image', body: '',
      scheduledAt: null, intervalMinutes: null, enabled: false,
      payload: '{"uri":"media/images/msg-1.jpg","width":800,"height":600}',
      createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    }],
  }],
  settings: { locale: 'en', theme: 'light', hapticEnabled: false, soundEnabled: false },
};

beforeEach(() => {
  jest.clearAllMocks();
  (unzip as jest.Mock).mockImplementation((_src: string, target: string) => Promise.resolve(target));
  (RNFS.exists as jest.Mock).mockResolvedValue(true);
  (RNFS.readFile as jest.Mock).mockImplementation((path: string) => {
    if (path.endsWith('/backup.json')) return Promise.resolve(JSON.stringify(exportData));
    return Promise.resolve('');
  });
  (RNFS.readDir as jest.Mock).mockImplementation((dir: string) => {
    if (dir.endsWith('/media')) {
      return Promise.resolve([
        { isDirectory: () => true, isFile: () => false, path: `${dir}/images`, name: 'images' },
      ]);
    }
    if (dir.endsWith('/media/images')) {
      return Promise.resolve([
        { isDirectory: () => false, isFile: () => true, path: `${dir}/msg-1.jpg`, name: 'msg-1.jpg' },
      ]);
    }
    return Promise.resolve([]);
  });
  (importFromJSON as jest.Mock).mockReturnValue({
    chatsAdded: 1, chatsUpdated: 0, messagesAdded: 1, messagesUpdated: 0, settingsImported: true,
  });
});

describe('importFromZIP', () => {
  it('unzips, imports backup.json into DB and restores media files', async () => {
    const result = await importFromZIP('/input/licka-backup.zip', 'merge');

    expect(unzip).toHaveBeenCalledTimes(1);
    const [, tmpDir] = (unzip as jest.Mock).mock.calls[0];
    expect(tmpDir).toMatch(/\/mock\/cache\/lichka-import-\d+$/);

    expect(importFromJSON).toHaveBeenCalledWith(JSON.stringify(exportData), 'merge');

    expect(result).toEqual({
      chatsAdded: 1, chatsUpdated: 0, messagesAdded: 1, messagesUpdated: 0,
      settingsImported: true, mediaRestored: 1,
    });

    const copyCalls = (RNFS.copyFile as jest.Mock).mock.calls;
    const mediaCopies = copyCalls.filter((c: string[]) => c[1].includes('/mock/docs/media/'));
    expect(mediaCopies).toHaveLength(1);
    expect(mediaCopies[0][1]).toBe('/mock/docs/media/images/msg-1.jpg');
  });

  it('throws NOT_A_BACKUP when zip has no backup.json', async () => {
    (RNFS.exists as jest.Mock).mockImplementation((path: string) =>
      Promise.resolve(!path.endsWith('/backup.json')),
    );

    await expect(importFromZIP('/input/not-a-backup.zip', 'merge')).rejects.toThrow('NOT_A_BACKUP');
    expect(importFromJSON).not.toHaveBeenCalled();
  });

  it('cleans up the temp dir even on error', async () => {
    (RNFS.exists as jest.Mock).mockImplementation((path: string) =>
      Promise.resolve(!path.endsWith('/backup.json')),
    );

    await expect(importFromZIP('/input/bad.zip', 'merge')).rejects.toThrow('NOT_A_BACKUP');

    const unlinkCalls = (RNFS.unlink as jest.Mock).mock.calls.map((c: string[]) => c[0]);
    expect(unlinkCalls.some((p) => /lichka-import-\d+$/.test(p))).toBe(true);
  });

  it('reports zero media restored when archive has no media folder', async () => {
    (RNFS.exists as jest.Mock).mockImplementation((path: string) => {
      if (path.endsWith('/backup.json')) return Promise.resolve(true);
      if (path.endsWith('/media')) return Promise.resolve(false);
      return Promise.resolve(true);
    });

    const result = await importFromZIP('/input/no-media.zip', 'replace');

    expect(result.mediaRestored).toBe(0);
    expect(importFromJSON).toHaveBeenCalledWith(JSON.stringify(exportData), 'replace');
  });
});
