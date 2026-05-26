import { Platform, PermissionsAndroid } from 'react-native';

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  if (typeof Platform.Version === 'number' && Platform.Version < 33) return true;

  const result = await PermissionsAndroid.request(
    'android.permission.POST_NOTIFICATIONS' as never,
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
}
