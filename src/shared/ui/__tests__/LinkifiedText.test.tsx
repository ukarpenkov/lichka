import React from 'react';
import { Linking } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { LinkifiedText } from '../LinkifiedText';

jest.mock('../../config/ThemeProvider', () => ({
  useTheme: () => ({
    text: '#000',
    background: '#FFF',
    colors: {
      ink: '#000',
      body: 'rgba(0,0,0,0.9)',
      muted: 'rgba(0,0,0,0.6)',
      mutedSoft: 'rgba(0,0,0,0.38)',
      onInk: '#FFF',
    },
  }),
}));

jest.mock('../../config/LocaleProvider', () => ({
  useLocale: () => ({
    t: {
      openLink: 'Open link',
      linkOpenFailed: 'Could not open the link',
      error: 'Error',
      done: 'Done',
    },
  }),
}));

jest.mock('../pixel', () => {
  const { createElement } = require('react');
  const { Text } = require('react-native');
  return {
    Link: ({ size }: { size: number }) =>
      createElement(Text, { testID: 'inline-link-icon' }, `icon-${size}`),
  };
});

describe('LinkifiedText', () => {
  beforeEach(() => {
    jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render plain text without a link role', () => {
    const { getByText, queryByRole, queryByTestId } = render(
      <LinkifiedText text="Hello world" />,
    );
    expect(getByText('Hello world')).toBeTruthy();
    expect(queryByRole('link')).toBeNull();
    expect(queryByTestId('inline-link-icon')).toBeNull();
  });

  it('should put a font-sized icon after a URL and open it on press', async () => {
    const { getByRole, getByTestId } = render(
      <LinkifiedText text="https://example.com/note" variant="body" />,
    );

    expect(getByTestId('inline-link-icon').props.children).toBe('icon-16');
    fireEvent.press(getByRole('link'));

    await waitFor(() => {
      expect(Linking.openURL).toHaveBeenCalledWith('https://example.com/note');
    });
  });

  it('should use caption font size for the icon when style overrides it', () => {
    const { getByTestId } = render(
      <LinkifiedText text="see www.example.com" style={{ fontSize: 14 }} />,
    );
    expect(getByTestId('inline-link-icon').props.children).toBe('icon-14');
  });
});
