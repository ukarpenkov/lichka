# Миграция БД — CHECK constraint с 'image'

**Дата:** 2026-07-04
**Промпт/задача:** Шаг 1 из `docs/tasks/image-messages-proposal-prompts.md` — добавить 'image' в CHECK constraint таблицы messages

## Что сделано
- Добавлена миграция 6 в `src/shared/db/db.ts`: пересоздание таблицы `messages` с новым CHECK constraint, включающим `'image'`
- Миграция создаёт новую таблицу `messages_new`, переносит данные, удаляет старую, переименовывает новую
- Написаны unit-тесты в `src/shared/db/__tests__/db.test.ts`

## Изменённые файлы
- `src/shared/db/db.ts` — миграция 6 с CHECK constraint `type IN ('simple', 'reminder', 'alarm', 'periodic', 'image')`
- `src/shared/db/__tests__/db.test.ts` — тесты: применение миграции, пропуск уже применённой, rollback при ошибке

## Принятые решения
- Миграция обёрнута в транзакцию (уже есть в `runMigrations()`)
- SQLite не поддерживает ALTER CONSTRAINT, поэтому использован паттерн пересоздания таблицы

## Известные ограничения
- Нет

## Тестирование
- `npm test` — все тесты проходят (132 passed)
- Проверено: миграция 6 применяется, не переприменяется, rollback при ошибке
