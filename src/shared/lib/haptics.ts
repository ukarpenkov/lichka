import ReactNativeHapticFeedback, {
  HapticFeedbackTypes,
} from 'react-native-haptic-feedback';

const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

/** Default on — matches AppSettings.hapticEnabled until settings sync. */
let hapticEnabled = true;

/** Sync from settings (entities/app). shared must not import entities. */
export function setHapticFeedbackEnabled(enabled: boolean): void {
  hapticEnabled = enabled;
}

function triggerIfEnabled(type: HapticFeedbackTypes): void {
  if (!hapticEnabled) return;
  ReactNativeHapticFeedback.trigger(type, options);
}

/** Лёгкое нажатие — tap на иконки, кнопки, навигацию */
export function hapticTap(): void {
  triggerIfEnabled(HapticFeedbackTypes.impactLight);
}

/** Среднее нажатие — long press */
export function hapticLongPress(): void {
  triggerIfEnabled(HapticFeedbackTypes.impactMedium);
}

/** Успешное действие — отправка сообщения */
export function hapticSuccess(): void {
  triggerIfEnabled(HapticFeedbackTypes.notificationSuccess);
}
