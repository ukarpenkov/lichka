import React from 'react';
import { AppState, NativeModules, Platform } from 'react-native';
import { renderHook, act } from '@testing-library/react-native';
import { LocaleProvider, useLocale } from '../LocaleProvider';
import { dictionaries } from '../locale';

const mockExecuteSync = jest.fn();
const mockSetWidgetLocaleStrings = jest.fn();

jest.mock('../../db', () => ({
  getDatabase: () => ({
    executeSync: mockExecuteSync,
  }),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return <LocaleProvider>{children}</LocaleProvider>;
}

describe('LocaleProvider', () => {
  const originalOS = Platform.OS;
  let appStateHandler: ((state: string) => void) | undefined;
  let addSpy: jest.SpyInstance;

  beforeEach(() => {
    mockExecuteSync.mockReset();
    mockExecuteSync.mockReturnValue({ rows: [{ value: 'ru' }] });
    mockSetWidgetLocaleStrings.mockReset();
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'android' });
    NativeModules.WidgetModule = { setWidgetLocaleStrings: mockSetWidgetLocaleStrings };
    appStateHandler = undefined;
    addSpy = jest.spyOn(AppState, 'addEventListener').mockImplementation(((
      type: string,
      handler: (state: string) => void,
    ) => {
      if (type === 'change') {
        appStateHandler = handler;
      }
      return { remove: jest.fn() };
    }) as typeof AppState.addEventListener);
  });

  afterEach(() => {
    addSpy.mockRestore();
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => originalOS });
    delete NativeModules.WidgetModule;
  });

  it('should provide the saved locale from settings', () => {
    const { result } = renderHook(() => useLocale(), { wrapper });

    expect(result.current.locale).toBe('ru');
    expect(result.current.t.noScheduled).toBe(dictionaries.ru.noScheduled);
  });

  it('should push widget copy to WidgetModule on mount', () => {
    renderHook(() => useLocale(), { wrapper });

    expect(mockSetWidgetLocaleStrings).toHaveBeenCalledWith(
      dictionaries.ru.noScheduled,
      dictionaries.ru.scheduledUntitled,
    );
  });

  it('should persist locale to SQLite on setLocale', () => {
    const { result } = renderHook(() => useLocale(), { wrapper });

    act(() => {
      result.current.setLocale('en');
    });

    expect(mockExecuteSync).toHaveBeenCalledWith(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      ['locale', 'en'],
    );
  });

  it('should push translated widget copy when locale changes', () => {
    const { result } = renderHook(() => useLocale(), { wrapper });
    mockSetWidgetLocaleStrings.mockClear();

    act(() => {
      result.current.setLocale('en');
    });

    expect(result.current.locale).toBe('en');
    expect(result.current.t.noScheduled).toBe('No scheduled messages');
    expect(mockSetWidgetLocaleStrings).toHaveBeenCalledWith(
      dictionaries.en.noScheduled,
      dictionaries.en.scheduledUntitled,
    );
  });

  it('should re-push widget copy when app goes to background', () => {
    const { result } = renderHook(() => useLocale(), { wrapper });

    act(() => {
      result.current.setLocale('de');
    });
    mockSetWidgetLocaleStrings.mockClear();

    act(() => {
      appStateHandler?.('background');
    });

    expect(mockSetWidgetLocaleStrings).toHaveBeenCalledWith(
      dictionaries.de.noScheduled,
      dictionaries.de.scheduledUntitled,
    );
  });
});
