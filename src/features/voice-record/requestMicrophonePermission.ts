import { PermissionsAndroid } from 'react-native';

export async function requestMicrophonePermission(): Promise<boolean> {
  const result = await PermissionsAndroid.request(
    'android.permission.RECORD_AUDIO' as never,
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
}
