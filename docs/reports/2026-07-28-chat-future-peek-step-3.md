# Chat Future Peek — шаг 3: mode в навигации

**Дата:** 2026-07-28
**Промпт/задача:** Расширить ChatRoom params и navigateToChat опциональным mode history|future

## Что сделано
- `ChatStackParamList.ChatRoom` расширен: `mode?: 'history' | 'future'`; тип `ChatRoomMode`
- `navigateToChat(chatId, messageId?, options?: { mode? })` прокидывает mode в navigate / setParams / pending queue
- Без options / без mode — param `mode` не добавляется (обратная совместимость)
- Unit-тесты `mainTabsApi.test.ts`
- ScheduledScreen не менялся

## Изменённые файлы
- `src/app/types.ts` — ChatRoomMode, mode в params
- `src/app/mainTabsApi.ts` — options, pending, openChatRoom
- `src/app/__tests__/mainTabsApi.test.ts` — новый файл тестов

## Принятые решения
- `mode` добавляется в params только если передан (не дефолтим `'history'` в объекте навигации)
- `__resetMainTabsApiForTests` — только для изоляции unit-тестов модуля с module-level state

## Известные ограничения
- ChatRoom ещё не читает `mode` из route (шаг 6+)
- Deep link из Scheduled — шаг 9

## Тестирование
- navigate with mode future / without options / pending flush / setParams — PASS
- Полный `npm test`: связанные suites PASS; 2 падения вне scope (`db.test` SIGSEGV, `SeamlessDateChip`) — не связаны с этим шагом
