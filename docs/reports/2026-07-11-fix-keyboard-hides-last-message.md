# Fix: клавиатура скрывает последнее сообщение в чате

**Дата:** 2026-07-11
**Промпт/задача:** Баг — когда открыта клавиатура в чате, последнее сообщение полностью скрывается за блоком ввода текста.

## Что сделано

Увеличен `CHAT_LIST_KEYBOARD_BOTTOM_INSET` с 28px до 80px и добавлен `onContentSizeChange` для надёжного scrollToEnd.

## Изменённые файлы

- `src/shared/lib/keyboard.ts` — `CHAT_LIST_KEYBOARD_BOTTOM_INSET` увеличен с `KEYBOARD_COMPOSER_GAP + 12` (28px) до 80px
- `src/pages/chat-room/ChatRoomScreen.tsx` — добавлен `handleContentSizeChange` callback и `onContentSizeChange` на FlatList

## Принятые решения

1. **Увеличение padding с 28 до 80px** — MessageComposer имеет высоту ~80px при открытой клавиатуре, плюс `translateY: -16` визуально накладывает его на FlatList. Старый padding 28px был недостаточен для компенсации.

2. **onContentSizeChange на FlatList** — при открытии клавиатуры layout перестраивается, и `contentSize` FlatList меняется. `scrollToEnd` в `onContentSizeChange` вызывается после того, как layout стабилизировался, что надёжнее `setTimeout(100)` в `keyboardDidShow`.

3. **`animated: false` в onContentSizeChange** — чтобы избежать двойной анимации (клавиатура + scroll одновременно).

## Известные ограничения

- `CHAT_LIST_KEYBOARD_BOTTOM_INSET = 80` — захардкоженная величина. Если высота MessageComposer изменится, значение нужно будет обновить. Можно сделать динамическим через `onLayout` на composer.
- `keyboardDidShow` + `setTimeout(100)` оставлен как дополнительная страховка на случай, если `onContentSizeChange` не сработает вовремя.

## Тестирование

- Проверить на Android: открыть чат, ввести текст, открыть клавиатуру → последнее сообщение видно
- Проверить на iOS: аналогично
- Проверить что scrollToEnd не прыгает при первой загрузке чата (keyboard closed)
- Проверить работу при поиске сообщений (scrollToIndex)
