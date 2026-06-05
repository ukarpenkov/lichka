import { Alert, Linking, Platform } from 'react-native';
import {
  canScheduleExactAlarms,
  requestIgnoreBatteryOptimizations,
  requestScheduleExactAlarm,
} from '../../shared/lib/notificationChannels';
import { getDictionary } from '../../shared/config/locale';
import { getSettings } from '../../entities/settings';

let batteryOptimizationRequested = false;

export async function ensureExactAlarmPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  const canSchedule = await canScheduleExactAlarms();
  if (canSchedule) return true;

  // На Android 12 — открываем экран запроса SCHEDULE_EXACT_ALARM
  // На Android 13+ USE_EXACT_ALARM выдаётся автоматически, сюда не попадём
  requestScheduleExactAlarm();

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
            // Фоллбэк — если нативный метод не сработал, открываем общие настройки
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
