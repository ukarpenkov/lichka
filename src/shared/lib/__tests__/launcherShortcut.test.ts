import { NativeModules, Platform } from 'react-native';
import { consumeInitialShortcut, getInitialShortcutId } from '../launcherShortcut';

describe('launcherShortcut', () => {
  const originalOS = Platform.OS;
  const getInitialShortcutIdNative = jest.fn();
  const consumeInitialShortcutNative = jest.fn();

  beforeEach(() => {
    getInitialShortcutIdNative.mockReset();
    consumeInitialShortcutNative.mockReset();
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'android' });
    NativeModules.ShortcutModule = {
      getInitialShortcutId: getInitialShortcutIdNative,
      consumeInitialShortcut: consumeInitialShortcutNative,
    };
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => originalOS });
    delete NativeModules.ShortcutModule;
  });

  it('should read the cold-start shortcut id from ShortcutModule on Android', async () => {
    getInitialShortcutIdNative.mockResolvedValue('write_saved');

    await expect(getInitialShortcutId()).resolves.toBe('write_saved');
  });

  it('should consume the pending shortcut extra', () => {
    consumeInitialShortcut();

    expect(consumeInitialShortcutNative).toHaveBeenCalledTimes(1);
  });

  it('should no-op on iOS', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'ios' });

    await expect(getInitialShortcutId()).resolves.toBeNull();
    consumeInitialShortcut();
    expect(consumeInitialShortcutNative).not.toHaveBeenCalled();
  });

  it('should resolve null when ShortcutModule is missing', async () => {
    delete NativeModules.ShortcutModule;

    await expect(getInitialShortcutId()).resolves.toBeNull();
    expect(() => consumeInitialShortcut()).not.toThrow();
  });
});
