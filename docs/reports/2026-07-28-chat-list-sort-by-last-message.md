# Сортировка чатов по последнему сообщению

**Дата:** 2026-07-28
**Промпт/задача:** Изменить порядок чатов в списке по времени последнего доставленного сообщения; будущие scheduled не участвуют; анимация перемещения через Layout springify.

## Что сделано

- Написан proposal в `docs/features/` под модель Lichka (типы сообщений, SQLite, FSD).
- `getChats()` сортирует чаты по `MAX(created_at)` среди доставленных сообщений (те же правила, что `getVisibleMessagesByChatId`: без `periodic`, без future `scheduled_at`); пустые чаты — по `created_at`.
- В `ChatListScreen` — `Animated.FlatList` + `itemLayoutAnimation` (springify, как в `ChatListItem`).
- Обновлены unit-тесты и `docs/spec/current-spec.md`.

## Изменённые файлы

- `docs/features/chat-list-sort-by-last-message-proposal.md` — proposal (статус implemented)
- `src/entities/chat/model/chatRepository.ts` — SQL сортировки `getChats()`
- `src/entities/chat/__tests__/chatRepository.test.ts` — ожидания SQL / маппинг
- `src/pages/chat-list/ChatListScreen.tsx` — Animated.FlatList + itemLayoutAnimation
- `docs/spec/current-spec.md` — описание порядка `getChats()`

## Принятые решения

- Сортировка только по доставленным сообщениям; правка аватара/названия порядок не меняет (`updated_at` чата по-прежнему обновляется для import merge).
- Без новой колонки / миграции — subquery в `getChats()`.
- Periodic display-fires в SQL-порядок не входят (как в visible messages).

## Известные ограничения

- Срабатывания periodic (синтетические display-сообщения) не поднимают чат в списке до появления отдельной денормализации.
- Смена только аватара не вызывает перестановку строк (Layout сработает, если порядок изменился по сообщениям).

## Тестирование

- `npx jest src/entities/chat/__tests__/chatRepository.test.ts` — 21 passed
- Сценарии в тестах: маппинг строк; SQL содержит `MAX(m.created_at)`, фильтр `periodic` / `scheduled_at` / fallback `created_at`; пустой список
- Ручная проверка: написать сообщение в нижнем чате → назад → чат поднимается с spring-анимацией; future reminder не поднимает чат
