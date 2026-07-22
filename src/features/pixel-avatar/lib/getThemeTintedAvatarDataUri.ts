import RNFS from 'react-native-fs';
import { resolveMediaPath } from '../../../shared/lib';
import {
  recolorThemePixelAvatarFromBase64,
  type ThemePixelPaintResult,
} from '../model/createThemePixelAvatar';
import type { PixelAvatarOptions } from '../model/types';

const MAX_CACHE = 48;
/** key → painted data URI */
const tintCache = new Map<string, string>();

function cacheKey(path: string, background: string, text: string): string {
  return `${path}|${background}|${text}`;
}

function remember(key: string, dataUri: string): string {
  if (tintCache.size >= MAX_CACHE) {
    const first = tintCache.keys().next().value;
    if (first !== undefined) tintCache.delete(first);
  }
  tintCache.set(key, dataUri);
  return dataUri;
}

export function clearThemePixelTintCache(): void {
  tintCache.clear();
}

/**
 * Load a persisted avatar PNG (mask or legacy bake) and paint with theme colors.
 * Results are cached by path + theme colors.
 */
export async function getThemeTintedAvatarDataUri(
  relativePath: string,
  options: Pick<PixelAvatarOptions, 'background' | 'text'>,
): Promise<string> {
  const background = options.background ?? '#FAFAFA';
  const text = options.text ?? '#000000';
  const key = cacheKey(relativePath, background, text);
  const hit = tintCache.get(key);
  if (hit) return hit;

  const abs = resolveMediaPath(relativePath);
  const exists = await RNFS.exists(abs);
  if (!exists) {
    throw new Error(`Avatar file missing: ${relativePath}`);
  }

  const b64 = await RNFS.readFile(abs, 'base64');
  const painted: ThemePixelPaintResult = recolorThemePixelAvatarFromBase64(b64, {
    background,
    text,
  });
  return remember(key, painted.dataUri);
}
