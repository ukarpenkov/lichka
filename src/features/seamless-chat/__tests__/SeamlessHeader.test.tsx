import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { render } from '@testing-library/react-native';

import { useTheme } from '../../../shared/config';
import { SeamlessHeader } from '../SeamlessHeader';

jest.mock('../../../shared/config', () => ({
  useTheme: jest.fn(),
}));

const useThemeMock = useTheme as jest.Mock;

function flatStyle(node: any) {
  return StyleSheet.flatten(node.props.style) ?? {};
}

describe('SeamlessHeader', () => {
  beforeEach(() => {
    useThemeMock.mockReturnValue({ background: '#FAFAFA', text: '#000000' });
  });

  it('should render children', () => {
    const { getByText } = render(
      <SeamlessHeader testID="hdr">
        <Text>title-text</Text>
      </SeamlessHeader>,
    );

    expect(getByText('title-text')).toBeTruthy();
  });

  it('should not have borderBottomWidth', () => {
    const { getByTestId } = render(
      <SeamlessHeader testID="hdr">
        <Text>title-text</Text>
      </SeamlessHeader>,
    );

    const style = flatStyle(getByTestId('hdr'));
    expect(style.borderBottomWidth).toBe(0);
  });

  it('should use parent background when transparentOnIdle=true', () => {
    useThemeMock.mockReturnValue({ background: '#FAFAFA', text: '#000000' });

    const { getByTestId } = render(
      <SeamlessHeader testID="hdr" transparentOnIdle>
        <Text>title</Text>
      </SeamlessHeader>,
    );

    const style = flatStyle(getByTestId('hdr'));
    expect(style.backgroundColor).toBe('#FAFAFA');
  });

  it('should NOT use parent background (transparent) when transparentOnIdle=false', () => {
    useThemeMock.mockReturnValue({ background: '#FAFAFA', text: '#000000' });

    const { getByTestId } = render(
      <SeamlessHeader testID="hdr" transparentOnIdle={false}>
        <Text>title</Text>
      </SeamlessHeader>,
    );

    const style = flatStyle(getByTestId('hdr'));
    expect(style.backgroundColor).toBe('transparent');
  });
});
