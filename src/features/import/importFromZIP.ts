import RNFS from 'react-native-fs';
import { unzip } from 'react-native-zip-archive';

import { ensureDir, MEDIA_DIR } from '../../shared/lib';
import { importFromJSON, type ImportMode, type ImportResult } from './importFromJSON';

export interface ZipImportResult extends ImportResult {
  mediaRestored: number;
}

async function copyMediaTree(srcDir: string, destDir: string): Promise<number> {
  await ensureDir(destDir);
  let count = 0;

  const items = await RNFS.readDir(srcDir);
  for (const item of items) {
    if (item.isDirectory()) {
      count += await copyMediaTree(item.path, `${destDir}/${item.name}`);
    } else if (item.isFile()) {
      await RNFS.copyFile(item.path, `${destDir}/${item.name}`);
      count++;
    }
  }

  return count;
}

async function safeUnlink(path: string): Promise<void> {
  try {
    await RNFS.unlink(path);
  } catch {
    // best-effort cleanup of temp dir
  }
}

export async function importFromZIP(zipPath: string, mode: ImportMode): Promise<ZipImportResult> {
  const tmpDir = `${RNFS.CachesDirectoryPath}/lichka-import-${Date.now()}`;
  await unzip(zipPath, tmpDir);

  try {
    const backupJsonPath = `${tmpDir}/backup.json`;
    const hasBackup = await RNFS.exists(backupJsonPath);
    if (!hasBackup) {
      throw new Error('NOT_A_BACKUP');
    }

    const json = await RNFS.readFile(backupJsonPath, 'utf8');
    const result = importFromJSON(json, mode);

    let mediaRestored = 0;
    const restoredMediaDir = `${tmpDir}/media`;
    if (await RNFS.exists(restoredMediaDir)) {
      mediaRestored = await copyMediaTree(restoredMediaDir, MEDIA_DIR);
    }

    return { ...result, mediaRestored };
  } finally {
    await safeUnlink(tmpDir);
  }
}
