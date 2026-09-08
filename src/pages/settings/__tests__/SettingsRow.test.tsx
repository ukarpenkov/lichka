import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SettingsRow } from '../SettingsRow';
import { hapticTap } from '../../../shared/lib/haptics';

jest.mock('../../../shared/config/ThemeProvider', () => ({
  useTheme: () => ({
    colors: {
      canvas: '#FFFFFF',
      ink: '#000000',
      muted: 'rgba(0,0,0,0.6)',
      surfaceSoft: 'rgba(0,0,0,0.06)',
    },
  }),
}));

jest.mock('../../../shared/lib/haptics', () => ({
  hapticTap: jest.fn(),
}));

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
});
