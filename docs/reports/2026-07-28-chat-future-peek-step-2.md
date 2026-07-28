# Chat Future Peek — шаг 2: getScheduledMessagesByChatId

**Дата:** 2026-07-28
**Промпт/задача:** Добавить выборку scheduled только для одного чата в entities/message

## Что сделано
- Добавлена `getScheduledMessagesByChatId(chatId)` с теми же фильтрами, что у `getScheduledMessages`, плюс `chat_id = ?`, `ORDER BY scheduled_at ASC`
- Экспорт через `src/entities/message/index.ts`
- Unit-тесты: фильтр по chatId, SQL-условия, periodic, чужой чат

## Изменённые файлы
- `src/entities/message/model/messageRepository.ts` — новая функция
- `src/entities/message/index.ts` — public API
- `src/entities/message/__tests__/messageRepository.test.ts` — тесты

## Принятые решения
- Параметры SQL: `[chatId, now]` — chat_id первым, затем now для `scheduled_at > ?`
- UI и навигация не трогались

## Известные ограничения
- Функция ещё не используется в ChatRoom / Future UI

## Тестирование
- `getScheduledMessagesByChatId` scenarios — PASS
- Полный `npm test`: связанные suites PASS; 2 падения вне scope (`db.test` SIGSEGV, `SeamlessDateChip`) — не связаны с этим шагом
