# Бейджи непрочитанных сообщений

**Дата:** 2026-07-10
**Промпт/задача:** Реализовать отображение счётчика непрочитанных сообщений рядом с каждым чатом в списке диалогов

## Что сделано

### 1. Миграция БД (migration 7)
Добавлена таблица `chat_read_markers` с полями `chat_id` (PK) и `last_read_at` (timestamp последнего прочтения). При входе в чат обновляется `last_read_at`, а непрочитанные — это сообщения, созданные после этой отметки.

### 2. Repository-функции в `entities/message`
- `getUnreadCounts()` — возвращает `Record<string, number>` (chatId → количество непрочитанных) через SQL-запрос с группировкой
- `markChatAsRead(chatId)` — устанавливает `last_read_at` на текущее время для чата

### 3. UI-компонент `Badge` (`shared/ui/Badge.tsx`)
Красная圆形 метка с белым текстом. Поддерживает:
- Автоформатирование: `>99` → `99+`
- Адаптивную ширину для 3+ цифр
- Возврат `null` при `count <= 0`

### 4. Обновлён `ChatListItem`
- Добавлен пропс `unreadCount?: number` (default 0)
- Бейдж позиционируется абсолютно поверх аватара через `position: 'relative'` контейнер

### 5. Обновлён `ChatListScreen`
- Загружает `getUnreadCounts()` при фокусе и при обновлении
- Передаёт `unreadCount` в каждый `ChatListItem`

### 6. Обновлён `ChatRoomScreen`
- Вызывает `markChatAsRead(chatId)` при `useFocusEffect` — при входе в чат все сообщения считаются прочитанными

## Изменённые файлы

- `src/shared/db/db.ts` — добавлена migration 7 (chat_read_markers)
- `src/entities/message/model/messageRepository.ts` — добавлены `getUnreadCounts()` и `markChatAsRead()`
- `src/shared/ui/Badge.tsx` — новый компонент
- `src/shared/ui/index.ts` — экспорт Badge
- `src/features/unread-badges/index.ts` — новый feature barrel
- `src/features/index.ts` — экспорт из unread-badges
- `src/pages/chat-list/ChatListItem.tsx` — поддержка badge
- `src/pages/chat-list/ChatListScreen.tsx` — загрузка и передача unread counts
- `src/pages/chat-room/ChatRoomScreen.tsx` — mark-as-read при входе

## Принятые решения

- **chat_read_markers вместо is_read на сообщениях**: таблица маркеров эффективнее — одно значение на чат вместо обновления каждой строки. Счётчик считается SQL COUNT WHERE created_at > last_read_at
- **Бейдж на аватаре, а не справа от текста**: стандартный паттерн (Telegram, WhatsApp, Discord) — бейдж поверх аватара
- **Сброс при входе в чат**: простая и предсказуемая логика — `useFocusEffect` + `markChatAsRead()`. Не зависит от скролла или таймеров

## Известные ограничения

- Локальная-only логика: нет синхронизации между устройствами (нет сервера)
- Бейдж не учитывает периодические сообщения (они генерируются синтетически)
- Нет badge на вкладке tab bar (общий счётчик) — можно добавить позже

## Тестирование

- Проверить: создать чат с 3 сообщениями → бейдж показывает 3 → открыть чат → бейдж исчезает
- Проверить: 100+ сообщений → отображается `99+`
- Проверить: dark/light тема — бейдж читаем на обоих
