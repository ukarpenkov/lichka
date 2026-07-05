# Исправление: неверная метка времени у сообщения будильника

**Дата:** 2026-07-05
**Промпт/задача:** Исправить баг, при котором сообщение будильника/напоминания отображается с временем создания вместо времени срабатывания

## Что сделано
- Создан документ бага `docs/bugs/alarm-message-wrong-timestamp.md`
- Изменена логика `createMessage()` в `messageRepository.ts`: теперь при наличии `scheduledAt` поле `createdAt` устанавливается равным `scheduledAt`, а не текущему времени
- Добавлены 2 unit-теста в `messageRepository.test.ts`

## Изменённые файлы
- `src/entities/message/model/messageRepository.ts:19` — `const now = sAt ?? new Date().toISOString()`
- `src/entities/message/__tests__/messageRepository.test.ts` — 2 новых теста
- `docs/bugs/alarm-message-wrong-timestamp.md` — документ бага

## Принятые решения
- Использован минимальный фикс (1 строка) вместо более сложных альтернатив (перезапись createdAt при срабатывании, изменение логики отображения)
- Выбрано `scheduledAt ?? new Date()` — для scheduled-сообщений createdAt = scheduledAt, для простых/периодических — текущее время
- Периодические сообщения не затронуты (scheduledAt = null, поведение не меняется)
- Приоритет: Medium, влияет на UX и доверие к таймлайну

## Тестирование
- Все 171 тест проходят (42 в messageRepository.test.ts, включая 2 новых)
- Новые тесты: `should use scheduledAt as createdAt for alarm/reminder messages`, `should use current time as createdAt when scheduledAt is not provided`
