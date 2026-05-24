import RNFS from 'react-native-fs';

const BASE_DIR = RNFS.DocumentDirectoryPath;

export const MEDIA_DIR = `${BASE_DIR}/media`;
export const AVATARS_DIR = `${MEDIA_DIR}/avatars`;

export function resolveMediaPath(relative: string): string {
  return `${BASE_DIR}/${relative}`;
}

export async function ensureDir(dir: string): Promise<void> {
  const exists = await RNFS.exists(dir);
  if (!exists) {
    await RNFS.mkdir(dir);
  }
}

export async function saveAvatar(
  sourceUri: string,
  chatId: string,
): Promise<string> {
  await ensureDir(AVATARS_DIR);
  const dest = `${AVATARS_DIR}/${chatId}.jpg`;

  const exists = await RNFS.exists(dest);
  if (exists) {
    await RNFS.unlink(dest);
  }

  await RNFS.copyFile(sourceUri.replace('file://', ''), dest);
  return `media/avatars/${chatId}.jpg`;
}
