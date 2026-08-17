jest.mock('react-native-fs', () => ({
  CachesDirectoryPath: '/mock/caches',
  stat: jest.fn().mockResolvedValue({ size: 1024 }),
  readFile: jest.fn().mockResolvedValue('base64-zip-content'),
  writeFile: jest.fn().mockResolvedValue(undefined),
  unlink: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../export', () => ({
  exportToZIP: jest.fn(),
}));

import RNFS from 'react-native-fs';
import { exportToZIP } from '../../export';
import { uploadBackup, downloadBackup } from '../googleDrive';

const mockFetch = jest.fn();

function okJson(body: unknown) {
  return {
    ok: true,
    status: 200,
    json: jest.fn().mockResolvedValue(body),
    text: jest.fn().mockResolvedValue(JSON.stringify(body)),
  };
}

function okText(content: string) {
  return {
    ok: true,
    status: 200,
    json: jest.fn().mockResolvedValue(null),
    text: jest.fn().mockResolvedValue(content),
  };
}

function failResponse(status: number, text = 'boom') {
  return {
    ok: false,
    status,
    json: jest.fn().mockResolvedValue(null),
    text: jest.fn().mockResolvedValue(text),
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  (global as any).fetch = mockFetch;
  (exportToZIP as jest.Mock).mockResolvedValue('/mock/caches/licka-backup-tmp.zip');
  (RNFS.stat as jest.Mock).mockResolvedValue({ size: 1024 });
  (RNFS.readFile as jest.Mock).mockResolvedValue('base64-zip-content');
});

describe('uploadBackup', () => {
  it('exports ZIP to cache and POSTs multipart with licka-backup.zip metadata', async () => {
    mockFetch
      .mockResolvedValueOnce(okJson({ files: [] }))
      .mockResolvedValueOnce(okJson({ id: 'new-id' }));

    await uploadBackup('token-1');

    expect(exportToZIP).toHaveBeenCalledWith({ targetDir: '/mock/caches' });
    expect(RNFS.readFile).toHaveBeenCalledWith('/mock/caches/licka-backup-tmp.zip', 'base64');

    const [url, init] = mockFetch.mock.calls[1];
    expect(url).toContain('/upload/drive/v3/files?uploadType=multipart');
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer token-1');
    expect(init.body).toContain('"name":"licka-backup.zip"');
    expect(init.body).toContain('parents');
    expect(init.body).toContain('appDataFolder');
    expect(init.body).toContain('Content-Type: application/zip');
    expect(init.body).toContain('base64-zip-content');

    expect(RNFS.unlink).toHaveBeenCalledWith('/mock/caches/licka-backup-tmp.zip');
  });

  it('PATCHes existing file when licka-backup.zip already in Drive', async () => {
    mockFetch
      .mockResolvedValueOnce(okJson({ files: [{ id: 'existing-id' }] }))
      .mockResolvedValueOnce(okJson({ id: 'existing-id' }));

    await uploadBackup('token-1');

    const [url, init] = mockFetch.mock.calls[1];
    expect(url).toContain('/upload/drive/v3/files/existing-id?uploadType=multipart');
    expect(init.method).toBe('PATCH');
  });

  it('throws BACKUP_TOO_LARGE and cleans temp ZIP when archive exceeds limit', async () => {
    (RNFS.stat as jest.Mock).mockResolvedValue({ size: 26 * 1024 * 1024 });

    await expect(uploadBackup('token-1')).rejects.toThrow('BACKUP_TOO_LARGE');

    expect(mockFetch).not.toHaveBeenCalled();
    expect(RNFS.unlink).toHaveBeenCalledWith('/mock/caches/licka-backup-tmp.zip');
  });

  it('cleans temp ZIP when upload fails', async () => {
    mockFetch
      .mockResolvedValueOnce(okJson({ files: [] }))
      .mockResolvedValueOnce(failResponse(500, 'server error'));

    await expect(uploadBackup('token-1')).rejects.toThrow('Upload failed: 500');

    expect(RNFS.unlink).toHaveBeenCalledWith('/mock/caches/licka-backup-tmp.zip');
  });
});

describe('downloadBackup', () => {
  it('returns kind zip and writes downloaded file to cache when zip exists', async () => {
    mockFetch
      .mockResolvedValueOnce(okJson({ files: [{ id: 'zip-id' }] }))
      .mockResolvedValueOnce(okText('zip-bytes'));

    const result = await downloadBackup('token-1');

    expect(result.kind).toBe('zip');
    expect(result.path).toMatch(/\/mock\/caches\/lichka-drive-restore-.*\.zip$/);

    const [listUrl] = mockFetch.mock.calls[0];
    expect(listUrl).toContain("name='licka-backup.zip'");

    const [mediaUrl, mediaInit] = mockFetch.mock.calls[1];
    expect(mediaUrl).toContain('/drive/v3/files/zip-id?alt=media');
    expect(mediaInit.headers.Authorization).toBe('Bearer token-1');

    expect(RNFS.writeFile).toHaveBeenCalledWith(result.path, 'zip-bytes', 'utf8');
  });

  it('falls back to legacy JSON when only licka-backup.json exists', async () => {
    mockFetch
      .mockResolvedValueOnce(okJson({ files: [] }))
      .mockResolvedValueOnce(okJson({ files: [{ id: 'json-id' }] }))
      .mockResolvedValueOnce(okText('{"schema_version":2}'));

    const result = await downloadBackup('token-1');

    expect(result.kind).toBe('json');
    expect(result.path).toMatch(/\/mock\/caches\/lichka-drive-restore-.*\.json$/);

    const [jsonListUrl] = mockFetch.mock.calls[1];
    expect(jsonListUrl).toContain("name='licka-backup.json'");
  });

  it('throws NO_BACKUP when neither zip nor json present', async () => {
    mockFetch
      .mockResolvedValueOnce(okJson({ files: [] }))
      .mockResolvedValueOnce(okJson({ files: [] }));

    await expect(downloadBackup('token-1')).rejects.toThrow('NO_BACKUP');
    expect(RNFS.writeFile).not.toHaveBeenCalled();
  });

  it('throws Download failed on non-ok media response', async () => {
    mockFetch
      .mockResolvedValueOnce(okJson({ files: [{ id: 'zip-id' }] }))
      .mockResolvedValueOnce(failResponse(404));

    await expect(downloadBackup('token-1')).rejects.toThrow('Download failed: 404');
  });

  it('throws List files failed when search request fails', async () => {
    mockFetch.mockResolvedValueOnce(failResponse(403));

    await expect(downloadBackup('token-1')).rejects.toThrow('List files failed: 403');
  });
});
