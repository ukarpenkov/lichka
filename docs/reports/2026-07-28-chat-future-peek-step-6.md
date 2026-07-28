# Chat Future Peek — шаг 6: timelineMode + индикатор + composer

**Дата:** 2026-07-28
**Промпт/задача:** timelineMode в ChatRoom, индикатор «Будущее», скрытие composer

## Что сделано
- `timelineMode` из `route.params.mode` через `resolveTimelineMode`
- Индикатор: `ChatHeader.modeLabel` + sticky chip `── Будущее ──`
- MessageComposer не рендерится в `future`
- Список Future / жесты — шаги 7–8

## Изменённые файлы
- `src/pages/chat-room/timelineMode.ts` — хелпер
- `src/pages/chat-room/ChatHeader.tsx` — modeLabel
- `src/pages/chat-room/ChatRoomScreen.tsx` — state + UI
- `src/pages/chat-room/__tests__/timelineMode.test.ts`

## Принятые решения
- Default = history; `mode === 'future'` → future
- Sync при смене `mode` / `focusNonce`

## Известные ограничения
- Back из Future → ChatList пока (шаг 10)

## Тестирование
- resolveTimelineMode — PASS
