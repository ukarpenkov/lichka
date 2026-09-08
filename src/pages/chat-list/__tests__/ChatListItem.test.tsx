import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ChatListItem } from '../ChatListItem';
import { hapticTap } from '../../../shared/lib/haptics';
import type { Chat } from '../../../entities/chat';

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

jest.mock('../../../widgets/chat-avatar', () => ({
  ChatAvatar: () => null,
}));

jest.mock('../../../shared/lib/haptics', () => ({
  hapticTap: jest.fn(),
}));

const chat: Chat = {
  id: 'chat-1',
  title: 'Saved',
  avatarPath: null,
  isSystem: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('ChatListItem', () => {
  beforeEach(() => {
    (hapticTap as jest.Mock).mockClear();
  });

  it('should trigger hapticTap when opening a chat', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <ChatListItem chat={chat} onPress={onPress} onLongPress={jest.fn()} />,
    );

    fireEvent.press(getByText('Saved'));

    expect(hapticTap).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should trigger hapticTap when long-pressing to open the chat menu', () => {
    const onLongPress = jest.fn();
    const { getByText } = render(
      <ChatListItem chat={chat} onPress={jest.fn()} onLongPress={onLongPress} />,
    );

    fireEvent(getByText('Saved'), 'onLongPress');

    expect(hapticTap).toHaveBeenCalledTimes(1);
    expect(onLongPress).toHaveBeenCalledTimes(1);
  });
});
