import ReactNativeHapticFeedback, {
  HapticFeedbackTypes,
} from 'react-native-haptic-feedback';
import {
  hapticTap,
  hapticLongPress,
  hapticSuccess,
  setHapticFeedbackEnabled,
} from '../haptics';

const trigger = ReactNativeHapticFeedback.trigger as jest.Mock;

describe('haptics', () => {
  beforeEach(() => {
    trigger.mockClear();
    setHapticFeedbackEnabled(true);
  });

  afterEach(() => {
    setHapticFeedbackEnabled(true);
  });

  it('should trigger impactLight on hapticTap when enabled', () => {
    hapticTap();

    expect(trigger).toHaveBeenCalledWith(HapticFeedbackTypes.impactLight, {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
  });

  it('should not trigger hapticTap when disabled', () => {
    setHapticFeedbackEnabled(false);

    hapticTap();

    expect(trigger).not.toHaveBeenCalled();
  });

  it('should trigger impactMedium on hapticLongPress when enabled', () => {
    hapticLongPress();

    expect(trigger).toHaveBeenCalledWith(HapticFeedbackTypes.impactMedium, expect.any(Object));
  });

  it('should not trigger hapticLongPress when disabled', () => {
    setHapticFeedbackEnabled(false);

    hapticLongPress();

    expect(trigger).not.toHaveBeenCalled();
  });

  it('should trigger notificationSuccess on hapticSuccess when enabled', () => {
    hapticSuccess();

    expect(trigger).toHaveBeenCalledWith(
      HapticFeedbackTypes.notificationSuccess,
      expect.any(Object),
    );
  });

  it('should not trigger hapticSuccess when disabled', () => {
    setHapticFeedbackEnabled(false);

    hapticSuccess();

    expect(trigger).not.toHaveBeenCalled();
  });
});
