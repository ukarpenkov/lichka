import { Platform } from 'react-native';
import {
  canScheduleExactAlarms,
  requestScheduleExactAlarm,
  isIgnoringBatteryOptimizations,
  requestIgnoreBatteryOptimizations,
} from '../../shared/lib/notificationChannels';

let batteryOptimizationRequested = false;

export async function ensureExactAlarmPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  const canSchedule = await canScheduleExactAlarms();
  if (canSchedule) return true;

  requestScheduleExactAlarm();
  return false;
}

/**
 * Открывает системный экран отключения оптимизации батареи только когда
 * приложение ещё под ограничениями, и не более одного раза за сессию.
 */
export async function requestBatteryOptimizationExemption(): Promise<void> {
  if (Platform.OS !== 'android') return;

  if (await isIgnoringBatteryOptimizations()) return;
  if (batteryOptimizationRequested) return;

  batteryOptimizationRequested = true;
  requestIgnoreBatteryOptimizations();
}
