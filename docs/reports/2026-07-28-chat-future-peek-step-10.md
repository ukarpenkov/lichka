# Chat Future Peek — шаг 10: Back → сначала History

**Дата:** 2026-07-28
**Промпт/задача:** Header back и Android system back выходят из Future, не pop сразу

## Что сделано
- `resolveChatRoomBackAction` — future → exit-future, history → pop
- `ChatHeader.onBack` → `handleBack`
- `navigation.beforeRemove` + `timelineModeRef` (без гонки двойного back)
- При выходе: `setParams({ mode: 'history' })` если пришли deep link'ом

## Изменённые файлы
- `src/pages/chat-room/chatRoomBack.ts`
- `src/pages/chat-room/ChatRoomScreen.tsx`
- `src/pages/chat-room/__tests__/chatRoomBack.test.ts`

## Тестирование
- back future → exit-future; history → pop — PASS
