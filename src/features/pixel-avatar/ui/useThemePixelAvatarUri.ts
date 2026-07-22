import { useEffect, useState } from 'react';
import { useTheme } from '../../../shared/config';
import { getThemeTintedAvatarDataUri } from '../lib/getThemeTintedAvatarDataUri';

function isThemePixelFileAvatar(path: string): boolean {
  const isFile =
    path.includes('/') || path.includes('\\') || path.startsWith('file:');
  return isFile && path.toLowerCase().endsWith('.png');
}

/**
 * Live-tint a persisted theme-pixel avatar PNG with the active theme.
 * Returns null while loading / for non-PNG file avatars.
 */
export function useThemePixelAvatarUri(
  avatarPath: string | null | undefined,
): string | null {
  const { background, text } = useTheme();
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    if (!avatarPath || !isThemePixelFileAvatar(avatarPath)) {
      setUri(null);
      return;
    }

    let alive = true;
    setUri(null);
    getThemeTintedAvatarDataUri(avatarPath, { background, text })
      .then((next) => {
        if (alive) setUri(next);
      })
      .catch(() => {
        if (alive) setUri(null);
      });

    return () => {
      alive = false;
    };
  }, [avatarPath, background, text]);

  return uri;
}

export { isThemePixelFileAvatar };
