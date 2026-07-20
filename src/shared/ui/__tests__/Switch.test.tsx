import React from 'react';
import { StyleSheet } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { Switch } from '../Switch';

jest.mock('../../config/ThemeProvider', () => ({
  useTheme: () => ({
    colors: {
      canvas: '#000000',
      ink: '#39FF14',
      body: 'rgba(57, 255, 20, 0.9)',
      muted: 'rgba(57, 255, 20, 0.6)',
      mutedSoft: 'rgba(57, 255, 20, 0.38)',
      surfaceSoft: 'rgba(57, 255, 20, 0.06)',
      surfaceStrong: 'rgba(57, 255, 20, 0.12)',
      onInk: '#000000',
      switchTrackOff: 'rgba(57, 255, 20, 0.2)',
      switchTrackOn: 'rgba(57, 255, 20, 0.85)',
      badge: '#E53935',
      onBadge: '#FFFFFF',
      destructive: '#E53935',
      scrim: 'rgba(0, 0, 0, 0.45)',
    },
  }),
}));

describe('Switch', () => {
  it('should expose checked accessibility state when on', () => {
    const { getByRole } = render(
      <Switch value={true} onValueChange={jest.fn()} />,
    );

    expect(getByRole('switch').props.accessibilityState).toEqual({
      checked: true,
      disabled: false,
    });
  });

  it('should call onValueChange with inverted value when pressed', () => {
    const onValueChange = jest.fn();
    const { getByRole } = render(
      <Switch value={false} onValueChange={onValueChange} />,
    );

    fireEvent.press(getByRole('switch'));

    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it('should not call onValueChange when disabled', () => {
    const onValueChange = jest.fn();
    const { getByRole } = render(
      <Switch value={true} onValueChange={onValueChange} disabled />,
    );

    fireEvent.press(getByRole('switch'));

    expect(onValueChange).not.toHaveBeenCalled();
    expect(getByRole('switch').props.accessibilityState.disabled).toBe(true);
  });

  it('should outline thumb with ink so knob stays visible on neon canvas', () => {
    const { getByTestId } = render(
      <Switch value={true} onValueChange={jest.fn()} />,
    );
    const flat = StyleSheet.flatten(getByTestId('switch-thumb').props.style);

    expect(flat.borderColor).toBe('#39FF14');
    expect(flat.backgroundColor).toBe('#000000');
    expect(flat.borderWidth).toBe(1.5);
  });
});
