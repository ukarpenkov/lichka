# Поиск по чату (задача 11.2)

**Дата:** 2026-05-26
**Промпт/задача:** Реализовать поиск по чату на экране `ChatRoom`

## Что сделано
- Заменил клиентский `Array.filter` поиск в `ChatRoomScreen` на БД-поиск через `searchMessages(query, chatId)`
- Переработал `SearchOverlay` — теперь это полноэкранный оверлей с результатами из БД и подсветкой совпадений
- Вынес `HighlightedBody` и `parseHighlights` из `GlobalSearch` в `shared/ui/HighlightedBody.tsx` для переиспользования
- Обновил `GlobalSearch` — использует `HighlightedBody` из shared/ui

## Изменённые файлы
- `src/shared/ui/HighlightedBody.tsx` — новый файл, компонент для отображения текста с `<mark>`-подсветкой
- `src/shared/ui/index.ts` — добавлен экспорт `HighlightedBody` и `parseHighlights`
- `src/pages/chat-list/GlobalSearch.tsx` — удалено локальное определение `HighlightedBody`, импорт из shared/ui
- `src/pages/chat-room/SearchOverlay.tsx` — полная переработка: вызов `searchMessages(query, chatId)`, FlatList результатов, HighlightedBody, форматирование времени
- `src/pages/chat-room/ChatRoomScreen.tsx` — удалён стейт `searchQuery`, убраны `filteredItems`/`highlightedIds`, добавлен `handleSearchSelect` для скролла к сообщению из результатов поиска

## Принятые решения
- `SearchOverlay` — абсолютный оверлей (как `GlobalSearch`), а не встроенный в header, чтобы список результатов не конфликтовал с основным FlatList сообщений
- Результаты поиска НЕ показывают `chat_title` (в отличие от `GlobalSearch`), т.к. поиск идёт в рамках одного чата
- При выборе результата — оверлей закрывается, список сообщений скроллится к найденному (переиспользует логику скролла по `messageId`)
- `HighlightedBody` вынесен в shared, т.к. используется и в `GlobalSearch`, и в `SearchOverlay`

## Известные ограничения
- FTS5 отключен на уровне сборки op-sqlite — используется LIKE-поиск с лимитом 50 результатов

## Тестирование
- TypeScript: целевые файлы без ошибок (ошибки только в предсуществующих тестовых файлах)
