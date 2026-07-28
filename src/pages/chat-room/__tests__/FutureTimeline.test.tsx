import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FutureTimeline } from '../FutureTimeline';
import type { Message } from '../../../entities/message';

jest.mock('../../../shared/config', () => {
  const actual = jest.requireActual('../../../shared/config');
  return {
    ...actual,
    useTheme: () => ({
      colors: {
        canvas: '#fff',
        ink: '#000',
        surfaceSoft: '#00000010',
        surfaceStrong: '#00000020',
      },
      background: '#fff',
      text: '#000',
    }),
    useLocale: () => ({
      locale: 'en',
      t: {
        ...actual.en,
        futureEmptyTitle: 'Nothing scheduled yet',
        futureScheduleCta: 'Schedule',
        futureMode: 'Future',
        everyNMin: (n: number) => `every ${n} min`,
        tomorrow: 'Tomorrow',
      },
    }),
  };
});

jest.mock('../../../entities/settings', () => ({
  getSettings: () => ({ hapticEnabled: false }),
}));

jest.mock('../../../shared/lib', () => ({
  hapticLongPress: jest.fn(),
  MESSAGE_LIST_BOTTOM_GAP: 12,
}));

const baseMessage = (overrides: Partial<Message> = {}): Message => ({
  id: 'msg-1',
  chatId: 'chat-1',
  type: 'reminder',
  body: 'Buy milk',
  scheduledAt: '2099-06-01T10:00:00.000Z',
  intervalMinutes: null,
  enabled: true,
  payload: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

describe('FutureTimeline', () => {
  it('should show empty state and call schedule CTA', () => {
    const onSchedulePress = jest.fn();
    const { getByText, getByTestId } = render(
      <FutureTimeline
        messages={[]}
        highlightedMessageId={null}
        onSchedulePress={onSchedulePress}
        onLongPressMessage={jest.fn()}
      />,
    );

    expect(getByText('Nothing scheduled yet')).toBeTruthy();
    fireEvent.press(getByTestId('future-schedule-cta'));
    expect(onSchedulePress).toHaveBeenCalledTimes(1);
  });

  it('should render scheduled messages and highlight id', () => {
    const messages = [
      baseMessage({ id: 'a', body: 'First' }),
      baseMessage({ id: 'b', body: 'Second', type: 'periodic', intervalMinutes: 60, scheduledAt: null }),
    ];
    const { getByText } = render(
      <FutureTimeline
        messages={messages}
        highlightedMessageId="b"
        onSchedulePress={jest.fn()}
        onLongPressMessage={jest.fn()}
      />,
    );

    expect(getByText('First')).toBeTruthy();
    expect(getByText('Second')).toBeTruthy();
    expect(getByText('every 60 min')).toBeTruthy();
  });
});
