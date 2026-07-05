# Одноразовое напоминание не удаляется из Scheduled после срабатывания

**Дата обнаружения:** 2026-07-05
**Тип сообщения:** reminder (одноразовое напоминание)
**Статус:** fixed

## Симптом
Оповещение срабатывает вовремя, но запись остаётся в списке Scheduled (не удаляется и не скрывается).

## Шаги воспроизведения
1. Создать отложенное сообщение → тип «напоминание» → указать время.
2. Перейти на вкладку Scheduled.
3. Держать экран включённым, дождаться времени срабатывания.
4. Оповещение приходит ✅
5. Запись остаётся в списке Scheduled ❌

## Корневая причина
Два фактора:

1. **Нативный AlarmReceiver не обновляет SQLite.** При срабатывании одноразового напоминания `AlarmReceiver.kt` (строка 54-72) постит уведомление и чистит `AlarmStorage` (SharedPreferences), но не трогает таблицу `messages` — запись остаётся с `enabled = 1`. Нативный Kotlin-код не имеет доступа к `op-sqlite` на JS-стороне.

2. **ScheduledScreen не обновляется без потери фокуса.** Экран использует `useFocusEffect` — перечитывает данные только при получении фокуса навигации. Если пользователь остаётся на экране в момент срабатывания, список не перерисовывается.

## Исправление

Два изменения на JS-стороне:

1. **`messageRepository.ts`** — добавлена функция `disableFiredMessages()`:
   ```sql
   UPDATE messages SET enabled = 0
   WHERE enabled = 1
     AND type IN ('reminder', 'alarm')
     AND scheduled_at IS NOT NULL
     AND scheduled_at <= ?
   ```
   Деактивирует все одноразовые напоминания/алармы, чьё время уже прошло.

2. **`ScheduledScreen.tsx`** — добавлен периодический опрос каждые 15 секунд:
   - На каждом тике вызывается `disableFiredMessages()` + `getScheduledMessages()`
   - Таймер очищается при потере фокуса экрана (cleanup в `useFocusEffect`)
   - При возврате на экран (focus gain) — мгновенный cleanup и загрузка

## Изменённые файлы
- `src/entities/message/model/messageRepository.ts` — +`disableFiredMessages()`
- `src/entities/message/index.ts` — экспорт `disableFiredMessages`
- `src/pages/scheduled/ScheduledScreen.tsx` — периодический refresh + cleanup
- `src/entities/message/__tests__/messageRepository.test.ts` — тесты для `disableFiredMessages`
