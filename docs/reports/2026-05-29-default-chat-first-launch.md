# Дефолтный чат «Saved messages» при первом запуске

**Дата:** 2026-05-29
**Промпт/задача:** Пункт 16.1 — реализовать первый запуск с дефолтным чатом «Saved messages»

## Что сделано

- Добавлена миграция 5: столбец `is_system` в таблицу `chats`
- Обновлён тип `Chat` — поле `isSystem: boolean`
- Обновлён `chatRepository`:
  - Все SELECT-запросы включают `is_system`
  - `createChat` принимает опциональный `{ id?, isSystem? }` третьим аргументом
  - `deleteChat` блокирует удаление системных чатов
  - Новая функция `seedDefaultChat()` — создаёт «Saved messages» при пустой БД
- Обновлён `Avatar` — поддержка emoji-аватаров (путь без `/` и `file:` рендерится как emoji)
- Обновлён `ChatContextMenu` — проп `canDelete`, скрытие кнопки «Удалить» для системных чатов
- Обновлён `ChatListScreen` — передаёт `canDelete` на основе `isSystem`
- `App.tsx` — вызов `seedDefaultChat()` после `runMigrations()`
- Обновлены тесты — 18 тестов проходят, включая 2 новых

## Изменённые файлы

- `src/shared/db/db.ts` — миграция 5: `ALTER TABLE chats ADD COLUMN is_system`
- `src/entities/chat/model/types.ts` — поле `isSystem`
- `src/entities/chat/model/chatRepository.ts` — SELECT/INSERT/delete/seed
- `src/entities/chat/index.ts` — экспорт `seedDefaultChat`
- `src/shared/ui/Avatar.tsx` — emoji-аватары
- `src/pages/chat-list/ChatContextMenu.tsx` — проп `canDelete`
- `src/pages/chat-list/ChatListScreen.tsx` — передача `canDelete`
- `App.tsx` — вызов `seedDefaultChat()`
- `src/entities/chat/__tests__/chatRepository.test.ts` — обновлены + новые тесты

## Принятые решения

- **Фиксированный UUID** `'saved-messages'` для дефолтного чата — предсказуемый id, не дублируется
- **Emoji в `avatar_path`** — хранится как строка без `/` и `file:`, Avatar определяет по отсутствию разделителей путей. Не требует отдельной колонки
- **`is_system` в БД** — альтернатива (фиксированная проверка id) менее гибкая; с колонкой можно будет добавлять другие системные чаты
- **Seed после миграций** — гарантирует наличие таблицы перед вставкой
- **Нет onboarding-экранов** — сразу таб «Чаты» с созданным чатом

## Известные ограничения

- Импорт (replace-режим) удаляет системный чат; после перезапуска seed создаст его заново
- Дефолтное имя `'Saved messages'` не локализовано (пользователь может переименовать)
- 3 предсуществующих падения тестов (react-native-fs мок, gesture handler, dateUtils locale) — не связаны с изменениями

## Тестирование

- `chatRepository.test.ts` — 18/18 проходят
  - Новый: `should create system chat with fixed id`
  - Новый: `should return false for system chat`
  - Новый: `should create default chat when no chats exist`
  - Новый: `should not create chat when chats already exist`
  - Обновлены все существующие тесты с учётом `isSystem`
