import RNFS from 'react-native-fs';
import { exportToJSON } from '../export';

const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD = 'https://www.googleapis.com/upload/drive/v3';
const BACKUP_FILE_NAME = 'licka-backup.json';

export async function uploadBackup(token: string): Promise<void> {
  const filePath = await exportToJSON();
  const jsonContent = await RNFS.readFile(filePath, 'utf8');

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
    `Content-Type: application/json\r\n\r\n` +
    `${jsonContent}\r\n` +
    `--${boundary}--`;

  // Ищем существующий файл, чтобы обновить вместо дублирования
  const existingId = await findExistingFile(token);

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
}

export async function downloadBackup(token: string): Promise<string> {
  const fileId = await findExistingFile(token);

  if (!fileId) {
    throw new Error('NO_BACKUP');
  }

  const response = await fetch(`${DRIVE_API}/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Download failed: ${response.status}`);
  }

  return response.text();
}

async function findExistingFile(token: string): Promise<string | null> {
  const response = await fetch(
    `${DRIVE_API}/files?spaces=appDataFolder&orderBy=modifiedTime desc&pageSize=1&q=name='${BACKUP_FILE_NAME}'`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!response.ok) {
    throw new Error(`List files failed: ${response.status}`);
  }

  const data = await response.json();
  return data.files?.[0]?.id ?? null;
}
