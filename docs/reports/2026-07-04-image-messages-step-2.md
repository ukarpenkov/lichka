# MessageType + messageRepository

**Дата:** 2026-07-04
**Промпт/задача:** Шаг 2 из `docs/tasks/image-messages-proposal-prompts.md` — добавить 'image' в MessageType и обновить репозиторные запросы

## Что сделано
- Добавлен `'image'` в union-тип `MessageType` в `src/entities/message/model/types.ts`
- `createMessage`: `enabled = type === 'simple' || type === 'image' ? 0 : 1` (image не запланировано)
- `getVisibleMessagesByChatId`: добавлен `'image'` в `type IN ('simple', 'periodic', 'image')`
- Дополнены тесты в `src/entities/message/__tests__/messageRepository.test.ts`

## Изменённые файлы
- `src/entities/message/model/types.ts` — `MessageType` включает `'image'`
- `src/entities/message/model/messageRepository.ts` — `enabled=false` для image, `getVisibleMessagesByChatId` возвращает image-сообщения
- `src/entities/message/__tests__/messageRepository.test.ts` — тесты: createMessage с image (enabled=false), getVisibleMessagesByChatId включает image, getScheduledMessages НЕ содержит image

## Принятые решения
- `getScheduledMessages` уже фильтрует по `type IN ('reminder', 'alarm', 'periodic')`, image туда не попадёт без изменений
- `deleteMessage` уже удаляет файлы по `payload.uri`, отдельной логики для image не требуется

## Известные ограничения
- Нет

## Тестирование
- `npm test` — все тесты проходят (132 passed)
- Проверено: image-сообщения создаются с enabled=false, видны в чате, не попадают в scheduled
