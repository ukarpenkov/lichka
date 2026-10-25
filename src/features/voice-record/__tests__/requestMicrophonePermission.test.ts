import { PermissionsAndroid, Platform } from 'react-native';
import { requestMicrophonePermission } from '../requestMicrophonePermission';

describe('requestMicrophonePermission', () => {
  const originalPlatform = Platform.OS;

  beforeEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    jest.restoreAllMocks();
  });

  afterAll(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatform });
  });

  it('should reuse an already granted microphone permission', async () => {
    jest.spyOn(PermissionsAndroid, 'check').mockResolvedValue(true);
    const request = jest.spyOn(PermissionsAndroid, 'request');

    await expect(requestMicrophonePermission()).resolves.toBe(true);
    expect(request).not.toHaveBeenCalled();
  });

  it('should request microphone permission when it has not been granted yet', async () => {
    jest.spyOn(PermissionsAndroid, 'check').mockResolvedValue(false);
    jest.spyOn(PermissionsAndroid, 'request').mockResolvedValue(PermissionsAndroid.RESULTS.GRANTED);

    await expect(requestMicrophonePermission()).resolves.toBe(true);
    expect(PermissionsAndroid.request).toHaveBeenCalledWith(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    );
  });

  it('should report permission API failures as a denied permission', async () => {
    jest.spyOn(PermissionsAndroid, 'check').mockRejectedValue(new Error('permission API failed'));

    await expect(requestMicrophonePermission()).resolves.toBe(false);
  });

  it('should not call the Android permission API on other platforms', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
    const check = jest.spyOn(PermissionsAndroid, 'check');

    await expect(requestMicrophonePermission()).resolves.toBe(true);
    expect(check).not.toHaveBeenCalled();
  });
});
