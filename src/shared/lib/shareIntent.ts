import { NativeModules, Platform } from 'react-native';

const { ShareModule } = NativeModules;

function requireShareModule(): NonNullable<typeof ShareModule> {
  if (!ShareModule) {
    throw new Error('ShareModule is not linked. Rebuild the native app (android).');
  }
  return ShareModule;
}

export type NativeSharePayload = {
  text?: string;
  imagePath?: string;
  width?: number;
  height?: number;
};

/** Cold-start share extras. No-op on iOS. */
export function getInitialShare(): Promise<NativeSharePayload | null> {
  if (Platform.OS !== 'android') return Promise.resolve(null);
  return requireShareModule().getInitialShare();
}

export function consumeInitialShare(): void {
  if (Platform.OS !== 'android') return;
  requireShareModule().consumeInitialShare();
}
