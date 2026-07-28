import { resolveChatRoomBackAction } from '../chatRoomBack';

describe('resolveChatRoomBackAction', () => {
  it('should exit future instead of popping when in future mode', () => {
    expect(resolveChatRoomBackAction('future')).toBe('exit-future');
  });

  it('should pop ChatRoom when in history mode', () => {
    expect(resolveChatRoomBackAction('history')).toBe('pop');
  });
});
