import React from 'react';
import { render } from '@testing-library/react-native';
import { MessageBubble } from '../MessageBubble';

jest.mock('../../../widgets/image-message', () => ({
  ImageMessage: ({ message }: { message: { type: string; body: string; payload: string | null } }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, { testID: 'image-message-content' }, message.body || '[image]');
  },
}));

jest.mock('../../../widgets/voice-message', () => ({
  VoiceMessage: ({ message }: { message: { type: string; body: string } }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, { testID: 'voice-message-content' }, message.body);
  },
}));

jest.mock('../../../shared/lib/haptics', () => ({
  hapticLongPress: jest.fn(),
}));

jest.mock('../../../shared/config/ThemeProvider', () => ({
  useTheme: () => ({
    text: '#000000',
    background: '#FFFFFF',
    colors: {
      canvas: '#FFFFFF',
      ink: '#000000',
      body: 'rgba(0, 0, 0, 0.9)',
      muted: 'rgba(0, 0, 0, 0.6)',
      mutedSoft: 'rgba(0, 0, 0, 0.38)',
      surfaceSoft: 'rgba(0, 0, 0, 0.06)',
      surfaceStrong: 'rgba(0, 0, 0, 0.12)',
      onInk: '#FFFFFF',
      badge: '#E53935',
      onBadge: '#FFFFFF',
      destructive: '#E53935',
      scrim: 'rgba(0, 0, 0, 0.45)',
      switchTrackOff: 'rgba(0, 0, 0, 0.2)',
      switchTrackOn: 'rgba(0, 0, 0, 0.85)',
    },
  }),
}));

jest.mock('../../../shared/config/LocaleProvider', () => ({
  useLocale: () => ({ t: { edited: 'edited' } }),
}));

jest.mock('../../../entities/settings', () => ({
  getSettings: () => ({ hapticEnabled: false }),
}));

const createMessage = (overrides: Partial<{
  type: string;
  body: string;
  payload: string;
}> = {}) => ({
  id: 'msg-1',
  chatId: 'chat-1',
  type: overrides.type ?? 'simple',
  body: overrides.body ?? 'Hello',
  scheduledAt: null,
  intervalMinutes: null,
  enabled: false,
  payload: overrides.payload ?? null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

const onLongPress = jest.fn();

describe('MessageBubble', () => {
  beforeEach(() => {
    onLongPress.mockClear();
  });

  it('renders text for simple message', () => {
    const { getByText } = render(
      <MessageBubble message={createMessage({ type: 'simple', body: 'Hello world' })} onLongPress={onLongPress} />,
    );
    expect(getByText('Hello world')).toBeTruthy();
  });

  it('renders ImageMessage for type=image', () => {
    const { getByTestId } = render(
      <MessageBubble
        message={createMessage({
          type: 'image',
          body: '',
          payload: JSON.stringify({ uri: 'media/images/1.jpg', width: 800, height: 600 }),
        })}
        onLongPress={onLongPress}
      />,
    );
    expect(getByTestId('image-message-content')).toBeTruthy();
  });

  it('renders ImageMessage for type=simple with image payload', () => {
    const { getByTestId } = render(
      <MessageBubble
        message={createMessage({
          type: 'simple',
          body: '',
          payload: JSON.stringify({ uri: 'media/images/1.jpg', width: 800, height: 600 }),
        })}
        onLongPress={onLongPress}
      />,
    );
    expect(getByTestId('image-message-content')).toBeTruthy();
  });

  it('renders VoiceMessage for voice messages', () => {
    const { getByTestId } = render(
      <MessageBubble
        message={createMessage({
          type: 'simple',
          body: '[voice:5]',
          payload: JSON.stringify({ uri: 'media/voice/1.m4a' }),
        })}
        onLongPress={onLongPress}
      />,
    );
    expect(getByTestId('voice-message-content')).toBeTruthy();
  });

  it('renders reminder message with icon', () => {
    const { getByText } = render(
      <MessageBubble
        message={createMessage({ type: 'reminder', body: 'Reminder text' })}
        onLongPress={onLongPress}
      />,
    );
    expect(getByText('Reminder text')).toBeTruthy();
  });
});
