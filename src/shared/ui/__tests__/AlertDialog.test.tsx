import React from 'react';
import { StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';
import { AlertDialog } from '../AlertDialog';

const THEME_INK = '#39FF14';
const DESTRUCTIVE = '#E53935';

jest.mock('../../config/ThemeProvider', () => ({
  useTheme: () => ({
    text: THEME_INK,
    background: '#000000',
    colors: {
      canvas: '#000000',
      ink: THEME_INK,
      body: 'rgba(57, 255, 20, 0.9)',
      muted: 'rgba(57, 255, 20, 0.6)',
      mutedSoft: 'rgba(57, 255, 20, 0.38)',
      surfaceSoft: 'rgba(57, 255, 20, 0.06)',
      surfaceStrong: 'rgba(57, 255, 20, 0.12)',
      onInk: '#000000',
      switchTrackOff: 'rgba(57, 255, 20, 0.2)',
      switchTrackOn: 'rgba(57, 255, 20, 0.85)',
      badge: DESTRUCTIVE,
      onBadge: '#FFFFFF',
      destructive: DESTRUCTIVE,
      scrim: 'rgba(0, 0, 0, 0.45)',
    },
  }),
}));

describe('AlertDialog', () => {
  it('should match raised backing to destructive accent instead of theme ink', () => {
    const { getByTestId } = render(
      <AlertDialog
        visible
        title="Delete chat"
        message='Delete "HOME"?'
        buttons={[
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive' },
        ]}
        onClose={jest.fn()}
      />,
    );

    const destructiveShadow = StyleSheet.flatten(
      getByTestId('alert-btn-shadow-destructive').props.style,
    );
    const destructiveFace = StyleSheet.flatten(
      getByTestId('alert-btn-face-destructive').props.style,
    );

    expect(destructiveShadow.backgroundColor).toBe(DESTRUCTIVE);
    expect(destructiveFace.borderColor).toBe(DESTRUCTIVE);
  });

  it('should keep theme-ink raised backing on cancel and default buttons', () => {
    const { getByTestId } = render(
      <AlertDialog
        visible
        title="Exact alarms"
        buttons={[
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open settings' },
        ]}
        onClose={jest.fn()}
      />,
    );

    const cancelShadow = StyleSheet.flatten(
      getByTestId('alert-btn-shadow-cancel').props.style,
    );
    const defaultShadow = StyleSheet.flatten(
      getByTestId('alert-btn-shadow-default').props.style,
    );
    const cancelFace = StyleSheet.flatten(
      getByTestId('alert-btn-face-cancel').props.style,
    );

    expect(cancelShadow.backgroundColor).toBe(THEME_INK);
    expect(defaultShadow.backgroundColor).toBe(THEME_INK);
    expect(cancelFace.borderColor).toBe(THEME_INK);
  });
});
