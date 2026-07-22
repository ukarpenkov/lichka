# Исправление бейджа непрочитанных после обычного сообщения

**Дата:** 2026-07-22  
**Промпт/задача:** Бейдж непрочитанных появляется после отправки обычного сообщения и выхода в список чатов; должен быть только для сработавших reminder / alarm / periodic.

## Что сделано
- Сужена семантика `getUnreadCounts()`: считаются только сработавшие `reminder`/`alarm` и периодические шаблоны с fire после `last_read_at`.
- Обычные (`simple`) и image-сообщения больше не влияют на бейдж.
- При уходе из чата дополнительно вызывается `markChatAsRead` (cleanup `useFocusEffect`).
- Добавлены unit-тесты на новую логику счётчика.
- Описан баг в `docs/bugs/`.

## Изменённые файлы
- `src/entities/message/model/messageRepository.ts` — фильтр типов + учёт periodic fires в `getUnreadCounts`
- `src/pages/chat-room/ChatRoomScreen.tsx` — `markChatAsRead` при blur/unfocus
- `src/entities/message/__tests__/messageRepository.test.ts` — тесты unread
- `docs/bugs/unread-badge-on-simple-message.md` — описание бага
- `docs/reports/2026-07-22-fix-unread-badge-simple-message.md` — этот отчёт

## Принятые решения
- Бейдж = непрочитанные **уведомления приложения**, не любые сообщения в ленте.
- Periodic: +1 к счётчику на шаблон, если latest fire позже last read (как одна display-строка в чате).
- Двойной mark-as-read (focus + cleanup) закрывает случай, когда reminder сработал, пока пользователь уже в чате.

## Известные ограничения
- Будущие (ещё не сработавшие) reminder/alarm в счётчик не входят — это ожидаемо.
- Общий бейдж на tab bar по-прежнему отсутствует.

## Тестирование
- Unit: `getUnreadCounts` — только reminder/alarm; periodic после fire; skip simple; skip уже прочитанный / ещё не сработавший periodic.
- Ручная проверка: написать simple → выйти в список → бейджа нет; дождаться reminder/alarm/periodic вне чата → бейдж есть → открыть чат → бейдж сбрасывается.
