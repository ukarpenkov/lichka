import { useEffect } from 'react';
import { AppState, Platform, type AppStateStatus } from 'react-native';

/** Re-run when the Android app leaves the foreground (background or inactive). */
export function useAndroidBackgroundEffect(effect: () => void): void {
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const onChange = (state: AppStateStatus) => {
      if (state === 'background' || state === 'inactive') {
        effect();
      }
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => {
      sub.remove();
    };
  }, [effect]);
}
