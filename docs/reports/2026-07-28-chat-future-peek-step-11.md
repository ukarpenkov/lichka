# Chat Future Peek — шаг 11: acceptance-тесты MVP

**Дата:** 2026-07-28
**Промпт/задача:** Закрепить acceptance-сценарии unit/integration тестами

## Что сделано
Файл `futurePeekAcceptance.test.ts` покрывает:

1. Peek atBottom + commit → future
2. Exit pull-up past threshold
3. Back в future → exit-future (не pop)
4. Empty future mode resolve
5. Scheduled navigate → mode future + messageId
6. Не atBottom → жест не активируется
7. Pull до порога → нет commit

## Изменённые файлы
- `src/pages/chat-room/__tests__/futurePeekAcceptance.test.ts`

## Дополнительно при ревью
- Починен `AlertDialog` (`spacing` из tokens, `absoluteFill`) — ломал SeamlessDateChip
- Partial mock в SeamlessDateChip.test

## Тестирование
- `npm test` — **44 suites, 347 tests PASS**
- iOS JS bundle — проверен
