import { useEffect } from 'react';
import { Keyboard } from 'react-native';
import {
  useSharedValue,
  runOnUI,
  type SharedValue,
} from 'react-native-reanimated';

/** Доп. подъём на Android: keyboardDidShow слегка занижает высоту клавиатуры. */
export const KEYBOARD_ANDROID_LIFT_FUDGE = 5;

/** Высота нижней панели табов (кастомный PagerTabBar).
 * Применяется в формуле компенсации клавиатуры: эта зона уже учтена layout-ом,
 * поэтому вычитается из keyboardHeight на Android. */
export const PAGER_TAB_BAR_HEIGHT = 56;

/** Зазор между блоком ввода и верхней границей клавиатуры. */
export const KEYBOARD_COMPOSER_GAP = 16;

/** Отступ списка сообщений снизу при открытой клавиатуре.
 *  Должен перекрывать визуальную высоту MessageComposer (~80px) +
 *  KEYBOARD_COMPOSER_GAP (translateY: -16 на composer), чтобы
 *  последнее сообщение не перекрывалось блоком ввода. */
export const CHAT_LIST_KEYBOARD_BOTTOM_INSET = 80 + KEYBOARD_COMPOSER_GAP;

/**
 * Единый источник правды по высоте клавиатуры для всего приложения.
 *
 * Возвращает shared value с «эффективной» высотой клавиатуры: она ненулевая
 * только когда клавиатура реально открыта.
 *
 * Использует JS‑лисенеры `keyboardDidShow`/`keyboardDidHide` как основной
 * источник. `useAnimatedKeyboard` НЕ используется — на Android
 * с `adjustNothing` и `react-native-screens` он может возвращать
 * stale‑состояние OPEN после повторного монтирования экрана.
 *
 * `useSharedValue(0)` гарантирует начальное значение 0 при каждом mount.
 * В cleanup — принудительный сброс в 0 на UI‑потоке.
 */
export function useKeyboardHeight(): SharedValue<number> {
  const kbHeight = useSharedValue(0);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      kbHeight.value = e.endCoordinates.height;
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      kbHeight.value = 0;
    });

    return () => {
      showSub.remove();
      hideSub.remove();
      runOnUI(() => {
        kbHeight.value = 0;
      })();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return kbHeight;
}
