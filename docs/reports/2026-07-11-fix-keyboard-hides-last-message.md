# Fix: клавиатура скрывает последнее сообщение в чате

**Дата:** 2026-07-11
**Промпт/задача:** Баг — когда открыта клавиатура в чате, нижняя часть (~20%) последнего сообщения скрывается за блоком ввода текста.

## Что сделано

1. Заменён анимированный `listContentAnimatedStyle` на `useState`-based `keyboardOpen` — FlatList гарантированно пересчитывает `contentSize` при смене padding
2. Добавлен `onContentSizeChange` на FlatList — `scrollToEnd` вызывается после реального обновления размера контента, а не по таймеру
3. `CHAT_LIST_KEYBOARD_BOTTOM_INSET` увеличен до `80 + KEYBOARD_COMPOSER_GAP` (96px)

## Изменённые файлы

- `src/pages/chat-room/ChatRoomScreen.tsx` — замена animated style на state-based, добавлен `onContentSizeChange`
- `src/shared/lib/keyboard.ts` — `CHAT_LIST_KEYBOARD_BOTTOM_INSET = 80 + KEYBOARD_COMPOSER_GAP`

## Принятые решения

1. **Замена animated style на state-based** — `useAnimatedStyle` для `contentContainerStyle.paddingBottom` не гарантировал пересчёт `contentSize` на JS-потоке. `useState` вызывает ре-рендер → FlatList пересчитывает контент → `scrollToEnd` работает с актуальным размером.

2. **`onContentSizeChange` вместо `setTimeout(300)`** — старый таймер вызывал `scrollToEnd` до обновления `contentSize`. Теперь скролл происходит после реального изменения размера.

3. **`CHAT_LIST_KEYBOARD_BOTTOM_INSET = 80 + KEYBOARD_COMPOSER_GAP`** — компенсация `translateY: -16` на MessageComposer.

## Известные ограничения

- Значение 80px для высоты composer захардкожено. Если высота изменится — нужно обновить.

## Тестирование

- Открыть чат, открыть клавиатуру → последнее сообщение полностью видно
- Проверить что scrollToEnd не прыгает при первой загрузке чата (keyboard closed)
- Проверить работу при поиске сообщений (scrollToIndex)
