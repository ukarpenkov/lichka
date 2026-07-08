# Исправление краша ChatRoom: Couldn't find the bottom tab bar height

**Дата:** 2026-07-08
**Промпт/задача:** При открытии чата ошибка "Something went wrong. Couldn't find the bottom tab bar height. Are you inside a screen in Bottom Tab Navigator?" — описать баг в `docs/bugs/` и исправить.

## Что сделано

- Найдена причина: 08.07.2026 `createBottomTabNavigator` заменён на кастомный `SwipeablePager` + `PagerTabBar`, но в `ChatRoomScreen` остался вызов `useBottomTabBarHeight()` из `@react-navigation/bottom-tabs`. Хук читает `BottomTabBarHeightContext`, которого больше нет — бросает исключение при первом рендере.
- Высота панели табов вынесена в константу `PAGER_TAB_BAR_HEIGHT = 56` в `shared/lib/keyboard.ts` и используется и в `SwipeablePager.tsx`, и в `ChatRoomScreen.tsx`. Константа экспортируется через barrel `shared/lib/index.ts` (соответствует FSD: `pages` и `app` импортируют из `shared`).
- Удалён импорт `useBottomTabBarHeight` из `@react-navigation/bottom-tabs` в `ChatRoomScreen.tsx`.
- Логика компенсации клавиатуры на Android не изменилась: `Math.max(keyboardHeight - tabBarHeight + FUDGE, 0)` — `tabBarHeight` теперь константа 56 вместо динамического хука.
- Баг-репорт создан в `docs/bugs/chat-room-bottom-tab-bar-height-crash.md`.

## Изменённые файлы

- `src/shared/lib/keyboard.ts` — добавлена константа `PAGER_TAB_BAR_HEIGHT = 56`
- `src/shared/lib/index.ts` — ре-экспорт `PAGER_TAB_BAR_HEIGHT`
- `src/app/SwipeablePager.tsx` — `styles.tabBar.height` использует константу вместо магического числа 56
- `src/pages/chat-room/ChatRoomScreen.tsx` — удалён `useBottomTabBarHeight`, `tabBarHeight = PAGER_TAB_BAR_HEIGHT`
- `docs/bugs/chat-room-bottom-tab-bar-height-crash.md` — баг-репорт

## Принятые решения

- Константа размещена в `shared/lib/keyboard.ts`, т.к. она используется в формуле компенсации клавиатуры вместе с `KEYBOARD_ANDROID_LIFT_FUDGE` и `CHAT_LIST_KEYBOARD_BOTTOM_INSET`. Это не нарушает FSD: `app` и `pages` зависят только от `shared`.
- Значение 56 соответствует фиксированной высоте `PagerTabBar` (без safe-area inset, т.к. `PagerTabBar` его не учитывает). На Android safe-area bottom обычно 0, а компенсация клавиатуры применяется только на Android.

## Известные ограничения

- `PagerTabBar` не учитывает нижний safe-area inset (например, home indicator на iPhone). На iOS компенсация клавиатуры не используется (система поднимает клавиатуру сама), поэтому это не влияет на формулу.

## Тестирование

- `npx tsc --noEmit` — ошибок, вызванных изменениями, нет (все ошибки предсуществующие в других файлах).
- `npx jest --no-coverage` — 182 теста проходят, 18 suites passed.
- `npx eslint` на изменённых файлах — 0 ошибок (1 предсуществующий warning в `ChatRoomScreen.tsx:335`).
