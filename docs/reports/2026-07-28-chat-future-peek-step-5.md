# Chat Future Peek — шаг 5: exit overscroll

**Дата:** 2026-07-28
**Промпт/задача:** Зеркальный exit overscroll вверх в features/chat-future-peek

## Что сделано
- `useFuturePeekExitGesture({ enabled, atTop, onCommit })` — pull up у верхнего края
- Та же логика порога/haptic/commit через `direction: 'exit'`
- Overlay якорь сверху при `direction: 'exit'`
- Unit-тесты покрывают exit pull distance / velocity invert

## Изменённые файлы
- `src/features/chat-future-peek/useFuturePeekGesture.ts` — exit wrapper + activeOffsetY вверх
- `src/features/chat-future-peek/peekGestureState.ts` — getPullDistance/Velocity для exit
- `src/features/chat-future-peek/FuturePeekOverlay.tsx` — top anchor
- `src/features/chat-future-peek/index.ts` — экспорт exit API
- `src/features/chat-future-peek/__tests__/*` — enter/exit cases

## Принятые решения
- Один модуль жеста с `direction`, не дублировать Pan-логику
- Exit: `translationY < 0` → pull distance; overlay у top

## Известные ограничения
- Не интегрировано в ChatRoom (шаг 8)
- Back в шапке — шаг 10

## Тестирование
- Exit pull/velocity/commit/cancel — PASS (в peekGestureState.test)
