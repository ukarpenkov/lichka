import RNFS from 'react-native-fs';

const BASE_DIR = RNFS.DocumentDirectoryPath;

export const MEDIA_DIR = `${BASE_DIR}/media`;
export const AVATARS_DIR = `${MEDIA_DIR}/avatars`;
export const VOICE_DIR = `${MEDIA_DIR}/voice`;
export const IMAGES_DIR = `${MEDIA_DIR}/images`;

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

/** Persist pixel-contour avatar PNG (alpha). Removes prior jpg/png for the chat. */
export async function saveAvatarPng(
  pngBase64: string,
  chatId: string,
): Promise<string> {
  await ensureDir(AVATARS_DIR);
  const dest = `${AVATARS_DIR}/${chatId}.png`;
  const legacyJpg = `${AVATARS_DIR}/${chatId}.jpg`;

  const clean = pngBase64.replace(/^data:image\/png;base64,/, '');

  for (const path of [dest, legacyJpg]) {
    if (await RNFS.exists(path)) {
      await RNFS.unlink(path);
    }
  }

  await RNFS.writeFile(dest, clean, 'base64');
  return `media/avatars/${chatId}.png`;
}

export async function saveImage(
  sourceUri: string,
  messageId: string,
): Promise<string> {
  await ensureDir(IMAGES_DIR);
  const dest = `${IMAGES_DIR}/${messageId}.jpg`;

  const exists = await RNFS.exists(dest);
  if (exists) {
    await RNFS.unlink(dest);
  }

  await RNFS.copyFile(sourceUri.replace('file://', ''), dest);
  return `media/images/${messageId}.jpg`;
}
