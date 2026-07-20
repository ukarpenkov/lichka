# Safe area: поиск по чату и нижний tab bar

**Дата:** 2026-07-20
**Промпт/задача:** При поиске по чату нет safe zone сверху; нижний бар — больше отступ от низа экрана с учётом композера и подъёма клавиатуры.

## Что сделано

- `SearchOverlay` учитывает `insets.top` — поле поиска больше не пересекается со status bar.
- `PagerTabBar` добавляет `paddingBottom: insets.bottom` (высота = 56 + inset); иконки остаются в зоне 56px, home indicator — ниже.
- Android keyboard lift в `ChatRoomScreen` вычитает полную высоту панели (`PAGER_TAB_BAR_HEIGHT + insets.bottom`), чтобы зазор композера над клавиатурой не ломался.
- `Screen` по умолчанию без нижнего edge — inset снизу отдаёт tab bar (без двойного отступа на списках). `AlarmScreen` (fullscreen вне табов) явно включает `bottom`.

## Изменённые файлы

- `src/pages/chat-room/SearchOverlay.tsx` — `paddingTop: insets.top`
- `src/app/SwipeablePager.tsx` — safe-area bottom у `PagerTabBar`
- `src/pages/chat-room/ChatRoomScreen.tsx` — `tabBarHeight` с учётом inset
- `src/shared/lib/keyboard.ts` — комментарий к `PAGER_TAB_BAR_HEIGHT`
- `src/shared/ui/Screen.tsx` — проп `edges`, default без `bottom`
- `src/pages/alarm/AlarmScreen.tsx` — `edges` с `bottom`

## Принятые решения

- Нижний отступ = системный safe-area inset, без дополнительной константы: композер по-прежнему на 12px над рядом иконок; растёт только зона под иконками.
- Keyboard formula на Android использует полную высоту tab bar, т.к. эта зона уже занята layout-ом.

## Известные ограничения

- На Android без gesture nav `insets.bottom` обычно 0 — визуально tab bar не меняется.
- Визуальную проверку подъёма клавиатуры с композером нужно сделать на устройстве/симуляторе.

## Тестирование

- Визуально: поиск в чате — поле под status bar.
- Визуально: tab bar — иконки выше home indicator; композер без клавиатуры — прежний зазор до иконок.
- Android: открыть клавиатуру в чате — композер над клавиатурой с прежним `KEYBOARD_COMPOSER_GAP`.
