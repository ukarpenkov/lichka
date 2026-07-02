import { Platform } from 'react-native';
import {
  canScheduleExactAlarms,
  requestScheduleExactAlarm,
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

export function requestBatteryOptimizationExemption(): void {
  if (Platform.OS !== 'android' || batteryOptimizationRequested) return;
  batteryOptimizationRequested = true;
  requestIgnoreBatteryOptimizations();
}
