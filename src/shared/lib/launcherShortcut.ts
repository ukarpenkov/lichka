import { NativeModules, Platform } from 'react-native';

function getShortcutModule(): typeof NativeModules.ShortcutModule | null {
  if (Platform.OS !== 'android') return null;
  return NativeModules.ShortcutModule ?? null;
}

/** Cold-start launcher shortcut extra. No-op on iOS / if native module is not linked. */
export function getInitialShortcutId(): Promise<string | null> {
  const mod = getShortcutModule();
  if (!mod?.getInitialShortcutId) return Promise.resolve(null);
  return mod.getInitialShortcutId();
}

export function consumeInitialShortcut(): void {
  getShortcutModule()?.consumeInitialShortcut?.();
}
