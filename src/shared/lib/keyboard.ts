import {
  useAnimatedKeyboard,
  useDerivedValue,
  KeyboardState,
  type SharedValue,
} from 'react-native-reanimated';

/**
 * Единый источник правды по высоте клавиатуры для всего приложения.
 *
 * Возвращает shared value с «эффективной» высотой клавиатуры: она ненулевая
 * только когда клавиатура реально открыта или открывается (`KeyboardState`
 * `OPEN`/`OPENING`). Всё остальное время высота равна `0`.
 *
 * Зачем это нужно: `useAnimatedKeyboard().height` при навигации может
 * кратковременно оставаться ненулевым при уже закрытой/закрывающейся
 * клавиатуре. Раньше это компенсировали ненадёжным JS-флагом через
 * `Keyboard.addListener`, продублированным в двух компонентах, что приводило
 * к гонкам (блок ввода зависал посреди экрана) и рассинхрону.
 *
 * Здесь гейт по `state` живёт целиком на UI-потоке — без JS-листенеров,
 * без дублирования и без гонок при монтировании экрана.
 */
export function useKeyboardHeight(): SharedValue<number> {
  const keyboard = useAnimatedKeyboard();

  return useDerivedValue(() => {
    const isOpen =
      keyboard.state.value === KeyboardState.OPEN ||
      keyboard.state.value === KeyboardState.OPENING;
    return isOpen ? keyboard.height.value : 0;
  });
}
