import RNFS from 'react-native-fs';
import { exportToZIP } from '../export';

const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD = 'https://www.googleapis.com/upload/drive/v3';
const BACKUP_FILE_NAME = 'licka-backup.zip';
const LEGACY_BACKUP_FILE_NAME = 'licka-backup.json';
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

export type DriveBackupDownload = {
  path: string;
  kind: 'zip' | 'json';
};

async function safeUnlink(path: string): Promise<void> {
  try {
    await RNFS.unlink(path);
  } catch {
    // temp file cleanup is best-effort
  }
}

export async function uploadBackup(token: string): Promise<void> {
  const zipPath = await exportToZIP({ targetDir: RNFS.CachesDirectoryPath });
  try {
    const stat = await RNFS.stat(zipPath);
    if (stat.size > MAX_UPLOAD_BYTES) {
      throw new Error('BACKUP_TOO_LARGE');
    }

    const zipBase64 = await RNFS.readFile(zipPath, 'base64');

    const metadata = {
      name: BACKUP_FILE_NAME,
      parents: ['appDataFolder'],
    };

    const boundary = '----LichkaBackupBoundary';
    const multipartBody =
      `--${boundary}\r\n` +
      `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
      `${JSON.stringify(metadata)}\r\n` +
      `--${boundary}\r\n` +
      `Content-Type: application/zip\r\n` +
      `Content-Transfer-Encoding: base64\r\n\r\n` +
      `${zipBase64}\r\n` +
      `--${boundary}--`;

    const existingId = await findExistingFile(token, BACKUP_FILE_NAME);

    const url = existingId
      ? `${DRIVE_UPLOAD}/files/${existingId}?uploadType=multipart`
      : `${DRIVE_UPLOAD}/files?uploadType=multipart`;

    const response = await fetch(url, {
      method: existingId ? 'PATCH' : 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartBody,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Upload failed: ${response.status} ${text}`);
    }
  } finally {
    await safeUnlink(zipPath);
  }
}

export async function downloadBackup(token: string): Promise<DriveBackupDownload> {
  const zipId = await findExistingFile(token, BACKUP_FILE_NAME);
  const jsonId = zipId ? null : await findExistingFile(token, LEGACY_BACKUP_FILE_NAME);

  const fileId = zipId ?? jsonId;
  if (!fileId) {
    throw new Error('NO_BACKUP');
  }

  const kind: 'zip' | 'json' = zipId ? 'zip' : 'json';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const destPath = `${RNFS.CachesDirectoryPath}/lichka-drive-restore-${timestamp}.${kind}`;

  const response = await fetch(`${DRIVE_API}/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Download failed: ${response.status}`);
  }

  const content = await response.text();
  await RNFS.writeFile(destPath, content, 'utf8');

  return { path: destPath, kind };
}

async function findExistingFile(token: string, name: string): Promise<string | null> {
  const response = await fetch(
    `${DRIVE_API}/files?spaces=appDataFolder&orderBy=modifiedTime desc&pageSize=1&q=name='${name}'`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!response.ok) {
    throw new Error(`List files failed: ${response.status}`);
  }

  const data = await response.json();
  return data.files?.[0]?.id ?? null;
}
