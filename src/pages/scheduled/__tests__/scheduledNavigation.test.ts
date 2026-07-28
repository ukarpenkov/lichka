import { getScheduledChatNavigation } from '../scheduledNavigation';

describe('getScheduledChatNavigation', () => {
  it('should open any scheduled type in future mode with messageId', () => {
    expect(
      getScheduledChatNavigation({ chatId: 'chat-1', id: 'msg-reminder' }),
    ).toEqual({
      chatId: 'chat-1',
      messageId: 'msg-reminder',
      options: { mode: 'future' },
    });

    expect(
      getScheduledChatNavigation({ chatId: 'chat-2', id: 'msg-periodic' }),
    ).toEqual({
      chatId: 'chat-2',
      messageId: 'msg-periodic',
      options: { mode: 'future' },
    });
  });
});
