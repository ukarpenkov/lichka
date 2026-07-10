import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';

import { useTheme } from '../../../shared/config';
import { SeamlessBubble } from '../SeamlessBubble';

jest.mock('../../../shared/config', () => ({
  useTheme: jest.fn(),
}));

const useThemeMock = useTheme as jest.Mock;

function flatStyle(node: any) {
  return StyleSheet.flatten(node.props.style) ?? {};
}

describe('SeamlessBubble', () => {
  beforeEach(() => {
    useThemeMock.mockReturnValue({ background: '#FAFAFA', text: '#000000' });
  });

  it('should render children inside the bubble', () => {
    const { getByText, getByTestId } = render(
      <SeamlessBubble testID="bubble">
        <Text>hello world</Text>
      </SeamlessBubble>,
    );

    expect(getByText('hello world')).toBeTruthy();
    expect(getByTestId('bubble')).toBeTruthy();
  });

  it('should not apply borderWidth (no border)', () => {
    const { getByTestId } = render(
      <SeamlessBubble testID="bubble">
        <Text>content</Text>
      </SeamlessBubble>,
    );

    const bubble = getByTestId('bubble');
    const flat = flatStyle(bubble);
    expect(flat.borderWidth).toBe(0);
  });

  it('should call onLongPress handler', () => {
    const onLongPress = jest.fn();
    const { getByTestId } = render(
      <SeamlessBubble testID="bubble" onLongPress={onLongPress}>
        <Text>content</Text>
      </SeamlessBubble>,
    );

    fireEvent(getByTestId('bubble'), 'longPress');

    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  it('should call onPress handler', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <SeamlessBubble testID="bubble" onPress={onPress}>
        <Text>content</Text>
      </SeamlessBubble>,
    );

    fireEvent.press(getByTestId('bubble'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should remove shadow when highlighted', () => {
    const { getByTestId, rerender } = render(
      <SeamlessBubble testID="bubble">
        <Text>content</Text>
      </SeamlessBubble>,
    );

    const normalShadow = flatStyle(getByTestId('bubble')).shadowOpacity;

    rerender(
      <SeamlessBubble testID="bubble" highlighted>
        <Text>content</Text>
      </SeamlessBubble>,
    );

    const highlightedShadow = flatStyle(getByTestId('bubble')).shadowOpacity;
    expect(highlightedShadow).toBe(0);
    expect(normalShadow).not.toBe(0);
  });

  it('should not crash when callbacks are not provided', () => {
    const { getByTestId } = render(
      <SeamlessBubble testID="bubble">
        <Text>content</Text>
      </SeamlessBubble>,
    );

    expect(() => fireEvent(getByTestId('bubble'), 'longPress')).not.toThrow();
    expect(() => fireEvent.press(getByTestId('bubble'))).not.toThrow();
  });
});
