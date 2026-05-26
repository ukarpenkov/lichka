import { Alert, Linking, Platform } from 'react-native';
import {
  canScheduleExactAlarms,
  requestIgnoreBatteryOptimizations,
} from '../../shared/lib/notificationChannels';

let batteryOptimizationRequested = false;

export async function ensureExactAlarmPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  const canSchedule = await canScheduleExactAlarms();
  if (canSchedule) return true;

  return new Promise((resolve) => {
    Alert.alert(
      'Точные будильники',
      'Для своевременного срабатывания будильников разрешите приложению планировать точные будильники в настройках.',
      [
        { text: 'Отмена', style: 'cancel', onPress: () => resolve(false) },
        {
          text: 'Настройки',
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
