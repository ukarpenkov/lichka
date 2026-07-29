import { getScheduledChatNavigation, getFutureToScheduledNavigation } from '../scheduledNavigation';

describe('scheduledNavigation', () => {
  it('should open any scheduled type in future mode with messageId', () => {
    expect(
      getScheduledChatNavigation({ chatId: 'c1', id: 'msg-reminder' }),
    ).toEqual({
      chatId: 'c1',
      messageId: 'msg-reminder',
      options: { mode: 'future' },
    });

    expect(
      getScheduledChatNavigation({ chatId: 'c2', id: 'msg-periodic' }),
    ).toEqual({
      chatId: 'c2',
      messageId: 'msg-periodic',
      options: { mode: 'future' },
    });
  });

  it('should map future row tap to scheduled focus messageId', () => {
    expect(getFutureToScheduledNavigation({ id: 'msg-9' })).toEqual({
      messageId: 'msg-9',
    });
  });
});
