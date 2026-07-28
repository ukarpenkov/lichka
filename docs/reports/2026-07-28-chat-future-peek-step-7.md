# Chat Future Peek — шаг 7: Future list + empty + CTA

**Дата:** 2026-07-28
**Промпт/задача:** UI списка Future, empty state, CTA, highlight по messageId

## Что сделано
- `FutureTimeline` + `getScheduledMessagesByChatId` + refresh 15s / `disableFiredMessages`
- Карточки с `formatScheduledWhen` (shared); empty + CTA `futureScheduleCta`
- CTA → выход в history (composer доступен для schedule flow)
- Highlight + scrollToIndex по `messageId` в future-списке

## Изменённые файлы
- `src/pages/chat-room/FutureTimeline.tsx`
- `src/shared/config/dateUtils.ts` — `formatScheduledWhen`
- `src/pages/scheduled/ScheduledItem.tsx` — reuse formatter
- `src/pages/chat-room/ChatRoomScreen.tsx`
- `src/pages/chat-room/__tests__/FutureTimeline.test.tsx`
- `src/shared/config/__tests__/dateUtils.test.ts`

## Принятые решения
- CTA возвращает в history к существующему composer (не дублировать pickers)
- ScheduledItem опциональный `chatTitle` / `highlighted`

## Известные ограничения
- Deep link из Scheduled tab — шаг 9

## Тестирование
- empty + CTA; non-empty list; formatScheduledWhen — PASS
