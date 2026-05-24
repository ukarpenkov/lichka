# Создание entity Chat

**Дата:** 2026-05-24
**Промпт/задача:** 3.1 — Создать entity Chat с типами, CRUD-репозиторием и unit-тестами

## Что сделано

- Создан тип `Chat` с полями: `id`, `title`, `avatarPath`, `createdAt`, `updatedAt`
- Реализован `chatRepository` с CRUD-операциями:
  - `createChat(title, avatarPath?)` — генерирует UUID, заполняет timestamps, вставляет в SQLite
  - `getChats()` — возвращает все чаты, отсортированные по `updatedAt DESC`
  - `getChatById(id)` — возвращает чат или `null`
  - `updateChat(id, fields)` — обновляет `title` и/или `avatarPath`, обновляет `updatedAt`
  - `deleteChat(id)` — hard delete из БД + попытка удаления файла аватара через `react-native-fs`
- Настроен barrel-export через `index.ts`
- Обновлён `src/entities/index.ts` с re-export чата
- Написано 14 unit-тестов, покрывающих все CRUD-операции и edge cases

## Изменённые файлы

- `src/entities/chat/model/types.ts` — создан, тип `Chat`
- `src/entities/chat/model/chatRepository.ts` — создан, CRUD-функции
- `src/entities/chat/index.ts` — создан, barrel-export
- `src/entities/index.ts` — обновлён, добавлен re-export `./chat`
- `src/entities/chat/__tests__/chatRepository.test.ts` — создан, 14 тестов

## Принятые решения

- UUID генерируется через `crypto.randomUUID()` (доступен в Node 18+, Hermes)
- Все операции синхронные (`executeSync`) — по паттерну существующего кода
- Маппинг snake_case → camelCase через функцию `mapRow`
- Удаление аватара при `deleteChat` — best-effort через `react-native-fs`, без падения при отсутствии модуля
- `avatarPath` может быть `null` (nullable), передаётся опционально в `createChat`

## Известные ограничения

- `react-native-fs` не в зависимостях проекта — удаление файлов аватара пока no-op в среде без этого модуля
- Нет unit-тестов на удаление файлов аватара (requires react-native-fs mock)

## Тестирование

- 14 unit-тестов: создание, получение списка, получение по ID, обновление, удаление
- Все 34 теста проекта проходят (4 suite)
