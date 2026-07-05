# Fix: одноразовые напоминания удаляются из Scheduled после срабатывания

**Дата:** 2026-07-05
**Промпт/задача:** Исправить баг — одноразовое напоминание не удаляется из списка за-планированных после срабатывания.

## Что сделано
- Добавлена функция `disableFiredMessages()` в `messageRepository.ts` — деактивирует одноразовые напоминания/алармы, чьё `scheduled_at` уже прошло
- `ScheduledScreen` теперь вызывает `disableFiredMessages()` при каждом обновлении списка
- Добавлен периодический опрос (каждые 15 секунд) на экране Scheduled для автообновления без потери фокуса
- Написаны unit-тесты для `disableFiredMessages` (3 тестовых сценария)

## Изменённые файлы
- `src/entities/message/model/messageRepository.ts` — добавлена `disableFiredMessages()`
- `src/entities/message/index.ts` — экспорт `disableFiredMessages`
- `src/pages/scheduled/ScheduledScreen.tsx` — периодический refresh + cleanup при фокусе
- `src/entities/message/__tests__/messageRepository.test.ts` — тесты для новой функции

## Принятые решения
- **JS-side cleanup вместо нативного.** Нативный `AlarmReceiver.kt` не имеет доступа к `op-sqlite`, поэтому cleanup делается на JS-стороне при каждом обновлении списка. Это полностью покрывает кейс: при фокусе экрана и периодически (если экран открыт).
- **Интервал 15 секунд** — достаточный компромисс между своевременностью обновления и нагрузкой на БД.
- **Не затрагиваем periodic.** Периодические сообщения не деактивируются — они должны продолжать срабатывать.

## Известные ограничения
- Нативный `AlarmReceiver` всё ещё не синхронизирует состояние с SQLite. Запись деактивируется только при ближайшем обновлении списка на JS-стороне (до 15 секунд задержки, если экран открыт; мгновенно при возврате на экран).
- При полном убийстве процесса (force kill) до обновления списка — запись может остаться `enabled=1` до следующего запуска приложения. Это некритично, т.к. `getScheduledMessages()` всё равно фильтрует по `scheduled_at > now`.

## Тестирование
- 3 новых unit-теста для `disableFiredMessages`:
  - should disable reminders and alarms with past scheduled_at
  - should query with correct conditions
  - should not affect periodic messages
- Все 161 существующих тестов проходят без регрессий
