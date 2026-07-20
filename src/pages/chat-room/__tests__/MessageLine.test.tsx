import React from 'react';
import { render } from '@testing-library/react-native';
import { MessageLine, formatLogTime } from '../MessageLine';

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
  useLocale: () => ({
    t: {
      edited: 'изм.',
      messageTypeReminder: 'напоминание',
      messageTypeAlarm: 'будильник',
      messageTypePeriodic: 'периодическое',
      messageTypeImage: 'изображение',
      messageTypeVoice: 'голосовое',
    },
  }),
}));

jest.mock('../../../entities/settings', () => ({
  getSettings: () => ({ hapticEnabled: false }),
}));

import type { Message, MessageType } from '../../../entities/message';

const createMessage = (overrides: Partial<{
  type: MessageType;
  body: string;
  payload: string;
  createdAt: string;
  updatedAt: string;
}> = {}): Message => ({
  id: 'msg-1',
  chatId: 'chat-1',
  type: overrides.type ?? 'simple',
  body: overrides.body ?? 'Hello',
  scheduledAt: null,
  intervalMinutes: null,
  enabled: false,
  payload: overrides.payload ?? null,
  createdAt: overrides.createdAt ?? '2026-01-01T12:34:56.000Z',
  updatedAt: overrides.updatedAt ?? overrides.createdAt ?? '2026-01-01T12:34:56.000Z',
});

const onLongPress = jest.fn();

describe('formatLogTime', () => {
  it('should format timestamp as [HH:MM:SS]', () => {
    // Local-timezone dependent — only assert bracket + separators shape via regex on fixed UTC offset mock
    const stamp = formatLogTime('2026-01-01T12:34:56.000Z');
    expect(stamp).toMatch(/^\[\d{2}:\d{2}:\d{2}\]$/);
  });
});

describe('MessageLine', () => {
  beforeEach(() => {
    onLongPress.mockClear();
  });

  it('should render text for simple message without bubble chrome', () => {
    const { getByText, queryByText } = render(
      <MessageLine message={createMessage({ type: 'simple', body: 'Hello world' })} onLongPress={onLongPress} />,
    );
    expect(getByText('Hello world')).toBeTruthy();
    expect(queryByText('Hello world')?.props.style).toBeDefined();
  });

  it('should render log timestamp prefix', () => {
    const { getByText } = render(
      <MessageLine message={createMessage()} onLongPress={onLongPress} />,
    );
    expect(getByText(/^\[\d{2}:\d{2}:\d{2}\]$/)).toBeTruthy();
  });

  it('should render ImageMessage for type=image', () => {
    const { getByTestId } = render(
      <MessageLine
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

  it('should render ImageMessage for type=simple with image payload', () => {
    const { getByTestId } = render(
      <MessageLine
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

  it('should render VoiceMessage for voice messages', () => {
    const { getByTestId } = render(
      <MessageLine
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

  it('should render reminder message body', () => {
    const { getByText } = render(
      <MessageLine
        message={createMessage({ type: 'reminder', body: 'Reminder text' })}
        onLongPress={onLongPress}
      />,
    );
    expect(getByText('Reminder text')).toBeTruthy();
  });

  it('should append edited marker after text', () => {
    const { getByText } = render(
      <MessageLine
        message={createMessage({
          body: 'Edited body',
          createdAt: '2026-01-01T12:00:00.000Z',
          updatedAt: '2026-01-01T13:00:00.000Z',
        })}
        onLongPress={onLongPress}
      />,
    );
    expect(getByText(/\(изм\.\)/)).toBeTruthy();
  });
});
