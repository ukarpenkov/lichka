import { useEffect } from 'react';
import { Keyboard } from 'react-native';
import {
  useSharedValue,
  runOnUI,
  type SharedValue,
} from 'react-native-reanimated';

/** Доп. подъём на Android: keyboardDidShow слегка занижает высоту клавиатуры. */
export const KEYBOARD_ANDROID_LIFT_FUDGE = 5;

/** Высота контентной зоны нижней панели табов (иконки), без safe-area.
 * Полная высота панели = PAGER_TAB_BAR_HEIGHT + insets.bottom.
 * В формуле компенсации клавиатуры на Android вычитается полная высота —
 * эта зона уже занята layout-ом над краем экрана. */
export const PAGER_TAB_BAR_HEIGHT = 56;

/**
 * Зазор между нижней кромкой MessageComposer и верхней границей клавиатуры.
 * Входит в `paddingBottom` chatArea (реальный layout), а не в translateY композера —
 * иначе композер визуально наезжает на FlatList.
 */
export const KEYBOARD_COMPOSER_GAP = 16;

/**
 * Фиксированный отступ между последним сообщением и верхней кромкой MessageComposer.
 * Не зависит от клавиатуры: композер — flex-sibling под списком, а не оверлей.
 */
export const MESSAGE_LIST_BOTTOM_GAP = 8;

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
