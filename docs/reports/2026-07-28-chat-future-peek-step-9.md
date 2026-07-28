# Chat Future Peek — шаг 9: Scheduled → Future

**Дата:** 2026-07-28
**Промпт/задача:** Deep link из Scheduled в Future + highlight

## Что сделано
- `getScheduledChatNavigation` — всегда `{ mode: 'future', messageId }`
- `ScheduledScreen.handlePress` открывает ChatRoom в Future для всех типов
- Highlight в Future уже был (шаг 7); sync mode только при `mode === 'future'`

## Изменённые файлы
- `src/pages/scheduled/scheduledNavigation.ts`
- `src/pages/scheduled/ScheduledScreen.tsx`
- `src/pages/scheduled/__tests__/scheduledNavigation.test.ts`
- `src/pages/chat-room/ChatRoomScreen.tsx` — не сбрасывать history при exit

## Принятые решения
- periodic тоже Future + highlight шаблона (не history display)

## Тестирование
- scheduledNavigation + acceptance #5 — PASS
