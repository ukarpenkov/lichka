import { Alert, Linking, Platform } from 'react-native';
import {
  canScheduleExactAlarms,
  requestIgnoreBatteryOptimizations,
} from '../../shared/lib/notificationChannels';
import { getDictionary } from '../../shared/config/locale';
import { getSettings } from '../../entities/settings';

let batteryOptimizationRequested = false;

export async function ensureExactAlarmPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  const canSchedule = await canScheduleExactAlarms();
  if (canSchedule) return true;

  return new Promise((resolve) => {
    const t = getDictionary(getSettings().locale);
    Alert.alert(
      t.exactAlarms,
      t.exactAlarmsMessage,
      [
        { text: t.cancel, style: 'cancel', onPress: () => resolve(false) },
        {
          text: t.openSettings,
          onPress: () => {
            Linking.openSettings();
            resolve(false);
          },
        },
      ],
    );
  });
}

export function requestBatteryOptimizationExemption(): void {
  if (Platform.OS !== 'android' || batteryOptimizationRequested) return;
  batteryOptimizationRequested = true;
  requestIgnoreBatteryOptimizations();
}
