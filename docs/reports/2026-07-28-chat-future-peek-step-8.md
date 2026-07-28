# Chat Future Peek — шаг 8: wire entry/exit gestures

**Дата:** 2026-07-28
**Промпт/задача:** Подключить entry/exit overscroll к timelineMode

## Что сделано
- Entry: `useFuturePeekEntryGesture` при history + atBottom + !keyboard + !search
- Exit: `useFuturePeekExitGesture` при future + atTop
- Сохранение `historyScrollOffset` перед входом; restore на выходе; suppress auto scrollToBottom
- `FuturePeekOverlay` + a11y `futurePeekA11y` / `futureExitA11y`
- Edge helpers `isScrollAtBottom` / `isScrollAtTop`

## Изменённые файлы
- `src/pages/chat-room/ChatRoomScreen.tsx` — GestureDetector + hooks
- `src/pages/chat-room/scrollEdge.ts`
- `src/pages/chat-room/__tests__/scrollEdge.test.ts`
- `src/pages/chat-room/__tests__/futurePeekIntegration.test.ts`

## Принятые решения
- Edge epsilon 24px; короткий контент = atBottom и atTop
- Keyboard open блокирует только entry

## Известные ограничения
- Android/header back из Future — шаг 10
- Simultaneous с nested scroll может потребовать тонкой настройки на устройстве

## Тестирование
- scrollEdge + gesture gate integration — PASS
