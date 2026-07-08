# [Crash] ChatRoom падает с "Couldn't find the bottom tab bar height"

**Модуль:** `src/pages/chat-room/ChatRoomScreen.tsx`
**Платформа:** Android / iOS
**Приоритет:** P0
**Воспроизводимость:** 100%

## Описание

При открытии любого чата (`ChatRoomScreen`) приложение падает с красным экраном ошибки:

```
Something went wrong
Couldn't find the bottom tab bar height. Are you inside a screen in Bottom Tab Navigator?
```

Экран полностью неработоспособен — ни один чат нельзя открыть.

## Шаги воспроизведения

1. Запустить приложение.
2. На экране списка чатов тапнуть по любому чату.

## Ожидаемый результат

Открывается экран чата с сообщениями и полем ввода.

## Фактический результат

Red box / crash: `useBottomTabBarHeight` бросает исключение.

## Причина

08.07.2026 стандартный `createBottomTabNavigator` из `@react-navigation/bottom-tabs` был заменён на кастомный `SwipeablePager` + `PagerTabBar` (см. `docs/reports/2026-07-08-swipeable-main-tabs.md`). При замене в `ChatRoomScreen` остался вызов `useBottomTabBarHeight()` из `@react-navigation/bottom-tabs`.

Этот хук читает `BottomTabBarHeightContext`, который предоставляется только внутри `BottomTabNavigator`. После перехода на кастомный pager контекст-провайдера больше нет — хук бросает исключение при первом рендере `ChatRoomScreen`.

## Исправление

- Удалён импорт `useBottomTabBarHeight` из `@react-navigation/bottom-tabs` в `ChatRoomScreen.tsx`.
- Высота нижней панели табов вынесена в константу `PAGER_TAB_BAR_HEIGHT = 56` в `shared/lib/keyboard.ts` и используется и в `SwipeablePager.tsx` (в стилях `PagerTabBar`), и в `ChatRoomScreen.tsx` (в формуле компенсации клавиатуры на Android).
- Константа экспортируется через `shared/lib/index.ts` — это соответствует FSD: `pages` и `app` импортируют из `shared`.

## Изменённые файлы

- `src/shared/lib/keyboard.ts` — добавлена `PAGER_TAB_BAR_HEIGHT = 56`
- `src/shared/lib/index.ts` — ре-экспорт `PAGER_TAB_BAR_HEIGHT`
- `src/app/SwipeablePager.tsx` — стиль `tabBar.height` использует константу вместо магического числа
- `src/pages/chat-room/ChatRoomScreen.tsx` — удалён `useBottomTabBarHeight`, используется `PAGER_TAB_BAR_HEIGHT`

## Статус

fixed
