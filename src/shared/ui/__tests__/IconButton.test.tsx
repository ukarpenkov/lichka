import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { IconButton } from '../IconButton';
import { hapticTap } from '../../lib/haptics';

jest.mock('../../config/ThemeProvider', () => ({
  useTheme: () => ({
    text: '#000000',
    colors: {
      canvas: '#FFFFFF',
      ink: '#000000',
    },
  }),
}));

jest.mock('../../lib/haptics', () => ({
  hapticTap: jest.fn(),
}));

const Icon = () => null;

describe('IconButton', () => {
  beforeEach(() => {
    (hapticTap as jest.Mock).mockClear();
  });

  it('should call onPress without haptic by default', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <IconButton icon={Icon} onPress={onPress} testID="icon-btn" />,
    );

    fireEvent.press(getByTestId('icon-btn'));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(hapticTap).not.toHaveBeenCalled();
  });

  it('should trigger hapticTap when haptic is enabled', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <IconButton icon={Icon} haptic onPress={onPress} testID="icon-btn" />,
    );

    fireEvent.press(getByTestId('icon-btn'));

    expect(hapticTap).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should not trigger haptic when disabled', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <IconButton icon={Icon} haptic disabled onPress={onPress} testID="icon-btn" />,
    );

    fireEvent.press(getByTestId('icon-btn'));

    expect(hapticTap).not.toHaveBeenCalled();
    expect(onPress).not.toHaveBeenCalled();
  });
});
