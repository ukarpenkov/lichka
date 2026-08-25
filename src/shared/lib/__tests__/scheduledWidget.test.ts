import { NativeModules, Platform } from 'react-native';
import { updateScheduledWidgetLocale } from '../scheduledWidget';

describe('updateScheduledWidgetLocale', () => {
  const originalOS = Platform.OS;
  const mockSetWidgetLocaleStrings = jest.fn();

  beforeEach(() => {
    mockSetWidgetLocaleStrings.mockReset();
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'android' });
    NativeModules.WidgetModule = { setWidgetLocaleStrings: mockSetWidgetLocaleStrings };
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => originalOS });
    delete NativeModules.WidgetModule;
  });

  it('should push empty and untitled copy to WidgetModule on Android', () => {
    updateScheduledWidgetLocale('No scheduled messages', 'Reminder');

    expect(mockSetWidgetLocaleStrings).toHaveBeenCalledWith(
      'No scheduled messages',
      'Reminder',
    );
  });

  it('should no-op on iOS', () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'ios' });

    updateScheduledWidgetLocale('No scheduled messages', 'Reminder');

    expect(mockSetWidgetLocaleStrings).not.toHaveBeenCalled();
  });

  it('should no-op when WidgetModule is missing', () => {
    delete NativeModules.WidgetModule;

    expect(() => {
      updateScheduledWidgetLocale('No scheduled messages', 'Reminder');
    }).not.toThrow();
  });
});
