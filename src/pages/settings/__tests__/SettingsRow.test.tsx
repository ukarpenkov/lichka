import React from 'react';
import { Text as RNText } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { SettingsRow } from '../SettingsRow';
import { hapticTap } from '../../../shared/lib/haptics';

jest.mock('../../../shared/config', () => {
  const actual = jest.requireActual('../../../shared/config');
  return {
    ...actual,
    useTheme: () => ({
      colors: {
        canvas: '#FFFFFF',
        ink: '#39FF14',
        muted: 'rgba(0,0,0,0.6)',
        surfaceSoft: 'rgba(0,0,0,0.06)',
      },
    }),
  };
});

jest.mock('../../../shared/config/ThemeProvider', () => ({
  useTheme: () => ({
    colors: {
      canvas: '#FFFFFF',
      ink: '#39FF14',
      muted: 'rgba(0,0,0,0.6)',
      surfaceSoft: 'rgba(0,0,0,0.06)',
    },
  }),
}));

jest.mock('../../../shared/lib/haptics', () => ({
  hapticTap: jest.fn(),
}));

function MockIcon({ color }: { size?: number; color?: string; style?: unknown }) {
  return <RNText testID="row-icon">{color}</RNText>;
}

describe('SettingsRow', () => {
  beforeEach(() => {
    (hapticTap as jest.Mock).mockClear();
  });

  it('should trigger hapticTap and onPress when the row is pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <SettingsRow label="Theme" onPress={onPress} />,
    );

    fireEvent.press(getByText('Theme'));

    expect(hapticTap).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should not trigger hapticTap when the row has no onPress', () => {
    const { getByText } = render(<SettingsRow label="Version" />);

    fireEvent.press(getByText('Version'));

    expect(hapticTap).not.toHaveBeenCalled();
  });

  it('should not trigger onPress or haptic when the row is disabled', () => {
    const onPress = jest.fn();
    const { getByText, getByTestId } = render(
      <SettingsRow label="Export to file" icon={MockIcon} onPress={onPress} disabled />,
    );

    fireEvent.press(getByText('Export to file'));

    expect(hapticTap).not.toHaveBeenCalled();
    expect(onPress).not.toHaveBeenCalled();
    expect(getByTestId('row-icon').props.children).toBe('rgba(0,0,0,0.6)');
  });

  it('should show a theme-ink loader on the pressed row while loading', () => {
    const onPress = jest.fn();
    const { getByTestId, getByText, queryByText } = render(
      <SettingsRow label="Backup to Google Drive" onPress={onPress} loading>
        <RNText>hidden</RNText>
      </SettingsRow>,
    );

    const loader = getByTestId('settings-row-loader');
    expect(loader.props.color).toBe('#39FF14');
    expect(getByText('Backup to Google Drive')).toBeTruthy();
    expect(queryByText('hidden')).toBeNull();

    fireEvent.press(getByText('Backup to Google Drive'));
    expect(onPress).not.toHaveBeenCalled();
    expect(hapticTap).not.toHaveBeenCalled();
  });

  it('should keep ink color on the loading row even when the group is disabled', () => {
    const { getByText, getByTestId } = render(
      <SettingsRow
        label="Restore from Google Drive"
        icon={MockIcon}
        onPress={jest.fn()}
        disabled
        loading
      />,
    );

    expect(getByTestId('settings-row-loader').props.color).toBe('#39FF14');
    expect(getByTestId('row-icon').props.children).toBe('#39FF14');
    expect(getByText('Restore from Google Drive').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: '#39FF14' })]),
    );
  });

  it('should render trailing children when not loading', () => {
    const { getByText, queryByTestId } = render(
      <SettingsRow label="Version">
        <RNText>2.3</RNText>
      </SettingsRow>,
    );

    expect(getByText('2.3')).toBeTruthy();
    expect(queryByTestId('settings-row-loader')).toBeNull();
  });
});
