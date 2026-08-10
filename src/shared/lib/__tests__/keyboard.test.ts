import {
  getAndroidChatAreaKeyboardPad,
  KEYBOARD_ANDROID_LIFT_FUDGE,
  KEYBOARD_COMPOSER_GAP,
} from '../keyboard';

describe('getAndroidChatAreaKeyboardPad', () => {
  const tabBarHeight = 80;

  it('should return 0 when keyboard is closed', () => {
    expect(getAndroidChatAreaKeyboardPad(0, tabBarHeight)).toBe(0);
    expect(getAndroidChatAreaKeyboardPad(-1, tabBarHeight)).toBe(0);
  });

  it('should subtract tab bar and add fudge/gap', () => {
    const keyboardHeight = 300;
    expect(getAndroidChatAreaKeyboardPad(keyboardHeight, tabBarHeight)).toBe(
      keyboardHeight -
        tabBarHeight +
        KEYBOARD_ANDROID_LIFT_FUDGE +
        KEYBOARD_COMPOSER_GAP,
    );
  });

  it('should not go negative when keyboard is shorter than tab bar', () => {
    expect(getAndroidChatAreaKeyboardPad(10, tabBarHeight)).toBe(0);
  });
});
