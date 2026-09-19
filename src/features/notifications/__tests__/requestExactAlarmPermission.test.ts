const platform = { OS: 'android' };
const mockCanScheduleExactAlarms = jest.fn();
const mockRequestScheduleExactAlarm = jest.fn();
const mockIsIgnoringBatteryOptimizations = jest.fn();
const mockRequestIgnoreBatteryOptimizations = jest.fn();

jest.mock('react-native', () => ({ Platform: platform }));

jest.mock('../../../shared/lib/notificationChannels', () => ({
  canScheduleExactAlarms: () => mockCanScheduleExactAlarms(),
  requestScheduleExactAlarm: () => mockRequestScheduleExactAlarm(),
  isIgnoringBatteryOptimizations: () => mockIsIgnoringBatteryOptimizations(),
  requestIgnoreBatteryOptimizations: () => mockRequestIgnoreBatteryOptimizations(),
}));

/** Свежий инстанс модуля — флаг «уже спрашивали» живёт в его области видимости. */
function loadModule(): typeof import('../requestExactAlarmPermission') {
  let api: typeof import('../requestExactAlarmPermission') | undefined;
  jest.isolateModules(() => {
    api = require('../requestExactAlarmPermission');
  });
  return api!;
}

beforeEach(() => {
  platform.OS = 'android';
  mockCanScheduleExactAlarms.mockReset();
  mockRequestScheduleExactAlarm.mockReset();
  mockIsIgnoringBatteryOptimizations.mockReset();
  mockRequestIgnoreBatteryOptimizations.mockReset();
});

describe('requestBatteryOptimizationExemption', () => {
  it('should skip the system battery screen when restrictions are already disabled', async () => {
    mockIsIgnoringBatteryOptimizations.mockResolvedValue(true);

    await loadModule().requestBatteryOptimizationExemption();

    expect(mockRequestIgnoreBatteryOptimizations).not.toHaveBeenCalled();
  });

  it('should open the system battery screen while the app is still restricted', async () => {
    mockIsIgnoringBatteryOptimizations.mockResolvedValue(false);

    await loadModule().requestBatteryOptimizationExemption();

    expect(mockRequestIgnoreBatteryOptimizations).toHaveBeenCalledTimes(1);
  });

  it('should not reopen the system battery screen twice in one session', async () => {
    mockIsIgnoringBatteryOptimizations.mockResolvedValue(false);
    const { requestBatteryOptimizationExemption } = loadModule();

    await requestBatteryOptimizationExemption();
    await requestBatteryOptimizationExemption();

    expect(mockRequestIgnoreBatteryOptimizations).toHaveBeenCalledTimes(1);
  });

  it('should do nothing on iOS', async () => {
    platform.OS = 'ios';

    await loadModule().requestBatteryOptimizationExemption();

    expect(mockIsIgnoringBatteryOptimizations).not.toHaveBeenCalled();
    expect(mockRequestIgnoreBatteryOptimizations).not.toHaveBeenCalled();
  });
});

describe('ensureExactAlarmPermission', () => {
  it('should report permission granted without opening settings', async () => {
    mockCanScheduleExactAlarms.mockResolvedValue(true);

    await expect(loadModule().ensureExactAlarmPermission()).resolves.toBe(true);
    expect(mockRequestScheduleExactAlarm).not.toHaveBeenCalled();
  });

  it('should open exact alarm settings when permission is missing', async () => {
    mockCanScheduleExactAlarms.mockResolvedValue(false);

    await expect(loadModule().ensureExactAlarmPermission()).resolves.toBe(false);
    expect(mockRequestScheduleExactAlarm).toHaveBeenCalledTimes(1);
  });
});
