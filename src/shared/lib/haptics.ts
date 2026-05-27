import ReactNativeHapticFeedback, {
  HapticFeedbackTypes,
} from 'react-native-haptic-feedback';

const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

/** Лёгкое нажатие — tap на иконки, кнопки */
export function hapticTap(): void {
  ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.impactLight, options);
}

/** Среднее нажатие — long press */
export function hapticLongPress(): void {
  ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.impactMedium, options);
}

/** Успешное действие — отправка сообщения */
export function hapticSuccess(): void {
  ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.notificationSuccess, options);
}
