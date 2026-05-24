import { getSettings, updateSettings } from '../model/settingsRepository';

const mockExecuteSync = jest.fn();

jest.mock('../../../shared/db', () => ({
  getDatabase: () => ({
    executeSync: mockExecuteSync,
  }),
}));

describe('settingsRepository', () => {
  beforeEach(() => {
    mockExecuteSync.mockReset();
  });

  describe('getSettings', () => {
    it('should return defaults when settings table is empty', () => {
      mockExecuteSync.mockReturnValue({ rows: [] });

      const settings = getSettings();

      expect(settings).toEqual({
        themePresetId: 'light',
        hapticEnabled: true,
        soundEnabled: true,
        locale: 'en',
      });
    });

    it('should return stored values from settings table', () => {
      mockExecuteSync.mockReturnValue({
        rows: [
          { key: 'theme_preset_id', value: 'green-on-black' },
          { key: 'haptic_enabled', value: '0' },
          { key: 'sound_enabled', value: '1' },
          { key: 'locale', value: 'ru' },
        ],
      });

      const settings = getSettings();

      expect(settings).toEqual({
        themePresetId: 'green-on-black',
        hapticEnabled: false,
        soundEnabled: true,
        locale: 'ru',
      });
    });

    it('should use defaults for missing keys', () => {
      mockExecuteSync.mockReturnValue({
        rows: [{ key: 'locale', value: 'ru' }],
      });

      const settings = getSettings();

      expect(settings.locale).toBe('ru');
      expect(settings.themePresetId).toBe('light');
      expect(settings.hapticEnabled).toBe(true);
      expect(settings.soundEnabled).toBe(true);
    });

    it('should query all settings from settings table', () => {
      mockExecuteSync.mockReturnValue({ rows: [] });

      getSettings();

      expect(mockExecuteSync).toHaveBeenCalledWith('SELECT key, value FROM settings');
    });
  });

  describe('updateSettings', () => {
    it('should update a single boolean field', () => {
      mockExecuteSync
        .mockReturnValueOnce({ rows: [] }) // INSERT/UPDATE
        .mockReturnValue({
          rows: [
            { key: 'theme_preset_id', value: 'light' },
            { key: 'haptic_enabled', value: '0' },
            { key: 'sound_enabled', value: '1' },
            { key: 'locale', value: 'en' },
          ],
        }); // getSettings

      const settings = updateSettings({ hapticEnabled: false });

      expect(mockExecuteSync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO settings'),
        ['haptic_enabled', '0', '0'],
      );
      expect(settings.hapticEnabled).toBe(false);
    });

    it('should update a string field', () => {
      mockExecuteSync
        .mockReturnValueOnce({ rows: [] })
        .mockReturnValue({
          rows: [
            { key: 'theme_preset_id', value: 'amber' },
            { key: 'haptic_enabled', value: '1' },
            { key: 'sound_enabled', value: '1' },
            { key: 'locale', value: 'en' },
          ],
        });

      const settings = updateSettings({ themePresetId: 'amber' });

      expect(mockExecuteSync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO settings'),
        ['theme_preset_id', 'amber', 'amber'],
      );
      expect(settings.themePresetId).toBe('amber');
    });

    it('should update multiple fields at once', () => {
      mockExecuteSync
        .mockReturnValueOnce({ rows: [] }) // theme
        .mockReturnValueOnce({ rows: [] }) // haptic
        .mockReturnValue({ rows: [] }); // getSettings

      updateSettings({ themePresetId: 'cyan', hapticEnabled: true });

      expect(mockExecuteSync).toHaveBeenCalledTimes(3);
    });

    it('should use ON CONFLICT for upsert', () => {
      mockExecuteSync
        .mockReturnValueOnce({ rows: [] })
        .mockReturnValue({ rows: [] });

      updateSettings({ locale: 'ru' });

      const sql = mockExecuteSync.mock.calls[0][0] as string;
      expect(sql).toContain('ON CONFLICT(key) DO UPDATE SET value = ?');
    });

    it('should return current settings after update', () => {
      mockExecuteSync
        .mockReturnValueOnce({ rows: [] })
        .mockReturnValue({
          rows: [
            { key: 'theme_preset_id', value: 'pink' },
            { key: 'haptic_enabled', value: '1' },
            { key: 'sound_enabled', value: '1' },
            { key: 'locale', value: 'en' },
          ],
        });

      const settings = updateSettings({ themePresetId: 'pink' });

      expect(settings.themePresetId).toBe('pink');
    });

    it('should not call executeSync when partial is empty', () => {
      mockExecuteSync.mockReturnValue({ rows: [] });

      updateSettings({});

      // Only getSettings SELECT call
      expect(mockExecuteSync).toHaveBeenCalledTimes(1);
    });
  });
});
