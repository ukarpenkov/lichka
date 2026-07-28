# Chat Future Peek — шаг 4: entry overscroll

**Дата:** 2026-07-28
**Промпт/задача:** Создать features/chat-future-peek — entry overscroll (threshold, haptic, overlay, onCommit)

## Что сделано
- Слайс `src/features/chat-future-peek/` с чистой логикой порога и хуком `useFuturePeekEntryGesture`
- Фазы: idle → pulling (rubber-band) → armed (haptic + иконка) → commit / snap-back
- Haptic (`hapticTap`) и overlay только после `PEEK_THRESHOLD`; auto-commit на `PEEK_AUTO_COMMIT`
- Debounce: cooldown `PEEK_COMMIT_COOLDOWN_MS` + `.enabled(false)` пока busy
- `FuturePeekOverlay` — Clock + ChevronRight
- Public API через `index.ts`; реэкспорт в `features/index.ts`
- ChatRoom не трогали

## Изменённые файлы
- `src/features/chat-future-peek/peekGestureState.ts` — чистая логика
- `src/features/chat-future-peek/useFuturePeekGesture.ts` — Gesture.Pan + Reanimated
- `src/features/chat-future-peek/FuturePeekOverlay.tsx` — UI якоря
- `src/features/chat-future-peek/index.ts` — public API
- `src/features/chat-future-peek/__tests__/peekGestureState.test.ts`
- `src/features/chat-future-peek/__tests__/useFuturePeekGesture.test.ts`
- `src/features/index.ts` — реэкспорт

## Принятые решения
- Общий хук с `direction: 'enter' | 'exit'` + обёртки entry/exit (шаг 5)
- Порог 72px, auto-commit 120px (длинный pull, меньше ложных срабатываний)
- Иконка = Clock + ChevronRight (нет отдельного clock-forward в pixel set)

## Известные ограничения
- Не интегрировано в ChatRoom (шаг 8)
- Simultaneous с FlatList scroll — при интеграции

## Тестирование
- Unit: threshold / atEdge / commit / cancel / rubber-band — PASS
