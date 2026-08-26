import { Platform } from 'react-native';

import { consumeInitialShare, getInitialShare } from '../shareIntent';

describe('shareIntent', () => {
  const originalOS = Platform.OS;

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => originalOS });
  });

  it('should resolve null on iOS without touching native module', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'ios' });

    await expect(getInitialShare()).resolves.toBeNull();
    expect(() => consumeInitialShare()).not.toThrow();
  });

  it('should resolve null on Android when ShareModule is not linked', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'android' });

    await expect(getInitialShare()).resolves.toBeNull();
    expect(() => consumeInitialShare()).not.toThrow();
  });
});
