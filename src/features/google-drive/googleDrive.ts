import RNFS from 'react-native-fs';
import { Buffer } from 'buffer';
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
  console.log('[google-drive] uploadBackup: token length', token?.length);
  const zipPath = await exportToZIP({ targetDir: RNFS.CachesDirectoryPath });
  console.log('[google-drive] zip exported to', zipPath);
  try {
    const stat = await RNFS.stat(zipPath);
    console.log('[google-drive] zip size', stat.size);
    if (stat.size > MAX_UPLOAD_BYTES) {
      throw new Error('BACKUP_TOO_LARGE');
    }

    const zipBase64 = await RNFS.readFile(zipPath, 'base64');

    const existingId = await findExistingFile(token, BACKUP_FILE_NAME);
    console.log('[google-drive] existing backup file id:', existingId);

    const metadata = existingId
      ? { name: BACKUP_FILE_NAME }
      : { name: BACKUP_FILE_NAME, parents: ['appDataFolder'] };

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

    const url = existingId
      ? `${DRIVE_UPLOAD}/files/${existingId}?uploadType=multipart`
      : `${DRIVE_UPLOAD}/files?uploadType=multipart`;

    console.log('[google-drive] upload request:', existingId ? 'PATCH' : 'POST', url);

    const response = await fetch(url, {
      method: existingId ? 'PATCH' : 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartBody,
    });

    console.log('[google-drive] upload response status:', response.status);

    if (!response.ok) {
      const text = await response.text();
      console.error('[google-drive] upload failed body:', text);
      throw new Error(`Upload failed: ${response.status} ${text}`);
    }
  } catch (e: any) {
    console.error('[google-drive] uploadBackup failed:', e?.message, e?.code ?? '');
    throw e;
  } finally {
    await safeUnlink(zipPath);
  }
}

export async function downloadBackup(token: string): Promise<DriveBackupDownload> {
  console.log('[google-drive] downloadBackup: token length', token?.length);
  const zipId = await findExistingFile(token, BACKUP_FILE_NAME);
  console.log('[google-drive] downloadBackup: zip id:', zipId);
  const jsonId = zipId ? null : await findExistingFile(token, LEGACY_BACKUP_FILE_NAME);
  console.log('[google-drive] downloadBackup: legacy json id:', jsonId);

  const fileId = zipId ?? jsonId;
  if (!fileId) {
    throw new Error('NO_BACKUP');
  }

  const kind: 'zip' | 'json' = zipId ? 'zip' : 'json';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const destPath = `${RNFS.CachesDirectoryPath}/lichka-drive-restore-${timestamp}.${kind}`;

  const mediaUrl = `${DRIVE_API}/files/${fileId}?alt=media`;
  console.log('[google-drive] downloadBackup: fetch media:', mediaUrl);

  const response = await fetch(mediaUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log('[google-drive] downloadBackup: response status:', response.status);

  if (!response.ok) {
    const text = await response.text();
    console.error('[google-drive] downloadBackup: failed body:', text);
    throw new Error(`Download failed: ${response.status}`);
  }

  const content = await response.arrayBuffer();
  console.log('[google-drive] downloadBackup: content bytes', content?.byteLength);
  const base64 = Buffer.from(content).toString('base64');
  await RNFS.writeFile(destPath, base64, 'base64');
  console.log('[google-drive] downloadBackup: saved to', destPath);

  return { path: destPath, kind };
}

async function findExistingFile(token: string, name: string): Promise<string | null> {
  const q = encodeURIComponent(`name='${name}'`);
  const listUrl = `${DRIVE_API}/files?spaces=appDataFolder&orderBy=modifiedTime%20desc&pageSize=1&q=${q}`;
  console.log('[google-drive] list files:', listUrl);

  const response = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log('[google-drive] list files response status:', response.status);

  if (!response.ok) {
    const text = await response.text();
    console.error('[google-drive] list files failed body:', text);
    throw new Error(`List files failed: ${response.status}`);
  }

  const data = await response.json();
  return data.files?.[0]?.id ?? null;
}
