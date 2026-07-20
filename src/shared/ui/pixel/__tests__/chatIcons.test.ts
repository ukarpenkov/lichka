import {
  CHAT_AVATAR_ICONS,
  DEFAULT_CHAT_ICON,
  isChatIconAvatar,
} from '../chatIcons';

describe('chatIcons', () => {
  it('should include all picker icons in the Streamline Pixel set', () => {
    for (const id of CHAT_AVATAR_ICONS) {
      expect(isChatIconAvatar(id)).toBe(true);
    }
  });

  it('should recognize default saved-messages ribbon icon', () => {
    expect(DEFAULT_CHAT_ICON).toBe('social-rewards-certified-ribbon');
    expect(isChatIconAvatar(DEFAULT_CHAT_ICON)).toBe(true);
  });

  it('should not treat emoji or file paths as chat icons', () => {
    expect(isChatIconAvatar('🔖')).toBe(false);
    expect(isChatIconAvatar('media/avatars/chat-1.jpg')).toBe(false);
  });
});
