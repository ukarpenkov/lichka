import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { ThemeProvider, useTheme } from '../ThemeProvider';
import { DEFAULT_LIGHT, DEFAULT_DARK, getTheme } from '../theme';

const mockExecuteSync = jest.fn();

jest.mock('../../db', () => ({
  getDatabase: () => ({
    executeSync: mockExecuteSync,
  }),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    mockExecuteSync.mockReset();
    mockExecuteSync.mockReturnValue({ rows: [] });
  });

  it('should provide DEFAULT_LIGHT when no saved theme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.preset).toBe(DEFAULT_LIGHT);
    expect(result.current.background).toBe(DEFAULT_LIGHT.background);
    expect(result.current.text).toBe(DEFAULT_LIGHT.text);
  });

  it('should provide semantic colors derived from the pair', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.colors.canvas).toBe(DEFAULT_LIGHT.background);
    expect(result.current.colors.ink).toBe(DEFAULT_LIGHT.text);
    expect(result.current.colors.surfaceSoft).toBe('rgba(0, 0, 0, 0.06)');
  });

  it('should update semantic colors when theme switches', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.colors.canvas).toBe(DEFAULT_DARK.background);
    expect(result.current.colors.ink).toBe(DEFAULT_DARK.text);
    expect(result.current.colors.muted).toBe('rgba(255, 255, 255, 0.6)');
  });

  it('should load saved theme from settings on mount', () => {
    mockExecuteSync.mockReturnValue({ rows: [{ value: 'dark' }] });

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.preset).toBe(DEFAULT_DARK);
    expect(result.current.background).toBe(DEFAULT_DARK.background);
    expect(result.current.text).toBe(DEFAULT_DARK.text);
  });

  it('should load a preset theme from settings', () => {
    const amber = getTheme('amber');
    mockExecuteSync.mockReturnValue({ rows: [{ value: 'amber' }] });

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.preset).toBe(amber);
    expect(result.current.background).toBe(amber.background);
    expect(result.current.text).toBe(amber.text);
  });

  it('should switch theme via setTheme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setTheme('cyan');
    });

    const cyan = getTheme('cyan');
    expect(result.current.preset).toBe(cyan);
    expect(result.current.background).toBe(cyan.background);
    expect(result.current.text).toBe(cyan.text);
  });

  it('should persist theme to SQLite on setTheme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setTheme('mint');
    });

    expect(mockExecuteSync).toHaveBeenCalledWith(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      ['theme_preset_id', 'mint'],
    );
  });

  it('should switch theme multiple times', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setTheme('pink');
    });
    expect(result.current.preset.id).toBe('pink');

    act(() => {
      result.current.setTheme('lavender');
    });
    expect(result.current.preset.id).toBe('lavender');

    act(() => {
      result.current.setTheme('light');
    });
    expect(result.current.preset).toBe(DEFAULT_LIGHT);
  });

  it('should use DEFAULT_LIGHT for unknown saved id', () => {
    mockExecuteSync.mockReturnValue({ rows: [{ value: 'nonexistent' }] });

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.preset).toBe(DEFAULT_LIGHT);
  });
});
