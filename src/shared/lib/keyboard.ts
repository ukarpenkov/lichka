import { useEffect } from 'react';
import { Keyboard } from 'react-native';
import {
  useAnimatedKeyboard,
  useSharedValue,
  runOnUI,
  KeyboardState,
  type SharedValue,
} from 'react-native-reanimated';

/**
 * Единый источник правды по высоте клавиатуры для всего приложения.
 *
 * Возвращает shared value с «эффективной» высотой клавиатуры: она ненулевая
 * только когда клавиатура реально открыта или открывается.
 *
 * В отличие от предыдущей реализации на `useDerivedValue`, использует
 * `useSharedValue` с JS‑лисенерами и `runOnUI` — это гарантирует, что
 * при повторном монтировании экрана значение будет 0, а не stale‑значение
 * от Reanimated (которое на Android с `adjustNothing` и react‑native‑screens
 * может не обновиться после переподключения native‑view).
 */
export function useKeyboardHeight(): SharedValue<number> {
  const keyboard = useAnimatedKeyboard();
  const kbHeight = useSharedValue(0);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      kbHeight.value = e.endCoordinates.height;
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      kbHeight.value = 0;
    });

    // Keyboard may already be open when the component mounts
    // (e.g. deep link while typing). keyboardDidShow already fired,
    // so we sync the current state via Reanimated on the UI thread.
    runOnUI(() => {
      const state = keyboard.state.value;
      if (
        state === KeyboardState.OPEN ||
        state === KeyboardState.OPENING
      ) {
        kbHeight.value = keyboard.height.value;
      }
    })();

    return () => {
      showSub.remove();
      hideSub.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return kbHeight;
}
