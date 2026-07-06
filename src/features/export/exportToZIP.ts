import RNFS from 'react-native-fs';
import { zip } from 'react-native-zip-archive';

import { resolveMediaPath, ensureDir } from '../../shared/lib';
import { buildExportData, type ExportData } from './buildExportData';

function collectReferencedMedia(data: ExportData): string[] {
  const refs = new Set<string>();

  for (const chat of data.chats) {
    if (chat.avatarPath && chat.avatarPath.startsWith('media/')) {
      refs.add(chat.avatarPath);
    }
    for (const msg of chat.messages) {
      if (!msg.payload) continue;
      try {
        const parsed = JSON.parse(msg.payload);
        const uri = parsed?.uri;
        if (typeof uri === 'string' && uri.startsWith('media/')) {
          refs.add(uri);
        }
      } catch {
        // skip non-JSON payloads
      }
    }
  }

  return Array.from(refs);
}

function dirOf(filePath: string): string {
  const idx = filePath.lastIndexOf('/');
  return idx >= 0 ? filePath.slice(0, idx) : filePath;
}

async function safeUnlink(path: string): Promise<void> {
  try {
    await RNFS.unlink(path);
  } catch {
    // ignore — staging cleanup is best-effort
  }
}

export async function exportToZIP(): Promise<string> {
  const data = buildExportData();

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const stagingDir = `${RNFS.CachesDirectoryPath}/lichka-export-staging-${timestamp}`;

  await ensureDir(stagingDir);
  await RNFS.writeFile(`${stagingDir}/backup.json`, JSON.stringify(data, null, 2), 'utf8');

  const referenced = collectReferencedMedia(data);
  for (const relPath of referenced) {
    const src = resolveMediaPath(relPath);
    const exists = await RNFS.exists(src);
    if (!exists) continue;

    const dest = `${stagingDir}/${relPath}`;
    await ensureDir(dirOf(dest));
    await RNFS.copyFile(src, dest);
  }

  const fileName = `licka-backup-${timestamp}.zip`;
  const downloadDir = RNFS.DownloadDirectoryPath;
  const externalDir = RNFS.ExternalDirectoryPath;

  let targetPath: string;
  if (downloadDir) {
    targetPath = `${downloadDir}/${fileName}`;
    try {
      await zip(stagingDir, targetPath);
      await safeUnlink(stagingDir);
      return targetPath;
    } catch {
      // scoped storage (Android 11+) blocks public Download writes — fall back
      targetPath = `${externalDir}/${fileName}`;
    }
  } else {
    targetPath = `${externalDir}/${fileName}`;
  }

  await zip(stagingDir, targetPath);
  await safeUnlink(stagingDir);
  return targetPath;
}
