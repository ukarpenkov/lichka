import { NativeModules, Platform } from 'react-native';

const { IncomingShareModule } = NativeModules;

export type NativeSharePayload = {
  text?: string;
  imagePath?: string;
  width?: number;
  height?: number;
};

function getShareModule(): typeof IncomingShareModule | null {
  if (Platform.OS !== 'android') return null;
  return IncomingShareModule ?? null;
}

/** Cold-start share extras. No-op on iOS / if native module is not linked. */
export function getInitialShare(): Promise<NativeSharePayload | null> {
  const mod = getShareModule();
  if (!mod?.getInitialShare) return Promise.resolve(null);
  return mod.getInitialShare();
}

export function consumeInitialShare(): void {
  getShareModule()?.consumeInitialShare?.();
}
