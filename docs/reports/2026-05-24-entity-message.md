# Создание entity Message

**Дата:** 2026-05-24
**Промпт/задача:** Создать entity Message с CRUD-репозиторием и unit-тестами (задача 3.2 из promted-tasks.md)

## Что сделано

- Создан entity `src/entities/message/` по паттерну существующего entity `chat`
- Реализованы 7 функций репозитория:
  - `createMessage` — создание сообщений типа simple/reminder/alarm/periodic
  - `getMessagesByChatId` — получение всех сообщений чата
  - `getMessageById` — получение по ID
  - `updateMessage` — обновление полей (body, scheduledAt, intervalMinutes, enabled, payload)
  - `deleteMessage` — жёсткое удаление + очистка медиафайлов из payload
  - `getScheduledMessages` — напоминания/будильники/периодические с enabled=1
  - `getMessagesForChatAtTime` — сообщения для отображения в ленте (scheduled_at <= now)
- Поиск `searchMessages` переэкспортирован из `shared/db/search.ts` (FTS5 уже был реализован)
- Обновлён barrel-файл `src/entities/index.ts`
- Написано 25 unit-тестов, все проходят

## Изменённые файлы

- `src/entities/message/model/types.ts` — типы Message и MessageType
- `src/entities/message/model/messageRepository.ts` — CRUD-репозиторий
- `src/entities/message/index.ts` — barrel-файл с экспортом
- `src/entities/index.ts` — добавлен экспорт message entity
- `src/entities/message/__tests__/messageRepository.test.ts` — 25 unit-тестов

## Принятые решения

- `enabled` хранится как INTEGER (0/1) в SQLite, маппится в boolean в TypeScript
- `type` — строковый union type `'simple' | 'reminder' | 'alarm' | 'periodic'`
- Для simple-сообщений `enabled` автоматически ставится в `false` (0), для остальных — `true` (1)
- `deleteMessage` пытается распарсить payload как JSON и удалить файл по полю `uri` (аналогично deleteChat с avatarPath)
- `searchMessages` переэкспортирован из shared/db, а не дублирован в entity
- Порядок сообщений в `getMessagesByChatId` — по `created_at ASC` (хронологически)

## Известные ограничения

- `searchMessages` возвращает `SearchResult` с snake_case полями (из shared/db), а не camelCase как остальные функции entity — это сделано намеренно, чтобы не дублировать логику FTS5

## Тестирование

- 25 unit-тестов покрывают все 7 функций репозитория
- Проверены: создание всех типов сообщений, маппинг полей, частичное обновление, удаление существующего/несуществующего, scheduled queries
- Полный тест-сьют (59 тестов) проходит без регрессий
