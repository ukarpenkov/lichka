# Исправление: невозможность скролла к старым сообщениям при открытой клавиатуре

**Дата:** 2026-08-10
**Баг:** `docs/bugs/chat-cannot-scroll-older-messages-with-keyboard.md`
**Промпт/задача:** При открытой клавиатуре в чате (Android) нельзя проскроллить к сообщениям прошлых дней. iOS не трогать. Первая попытка в коммите не помогла.

## Что сделано

### Попытка 1 (не сработала)
- Только `scrollEnabled` / `pointerEvents` с `|| keyboardOpen`.
- `flexGrow: 1` и Reanimated `paddingBottom` остались → список клипился, скроллить было некуда.

### Итерация 2
- Android: `paddingBottom` на `chatArea` через React state (`getAndroidChatAreaKeyboardPad`) — Yoga реально сжимает FlatList.
- Убран Reanimated `paddingBottom` с `chatArea`.
- `shouldEnableHistoryListScroll` (Android + keyboard) включает скролл и снимает `flexGrow: 1`.
- iOS без изменений.

## Изменённые файлы
- `src/pages/chat-room/ChatRoomScreen.tsx`
- `src/pages/chat-room/scrollEdge.ts`
- `src/shared/lib/keyboard.ts`
- `src/shared/lib/index.ts`
- тесты `scrollEdge`, `keyboard`
- `docs/bugs/chat-cannot-scroll-older-messages-with-keyboard.md`

## Принятые решения
- Не поднимать iOS на тот же JS-pad.
- Оставить `useKeyboardHeight` в `MessageComposer` для косметического padding.

## Известные ограничения
- Нужна ручная проверка на Android: Saved → клавиатура → скролл к первому дню.

## Тестирование
- Unit: `scrollEdge`, `keyboard`, `ChatRoomScreen.keyboardFocus`
