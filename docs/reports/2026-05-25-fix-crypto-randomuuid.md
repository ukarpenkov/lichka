# Fix: замена crypto.randomUUID() на generateId()

**Дата:** 2026-05-25
**Промпт/задача:** При создании чата ошибка "не удалось сохранить чат"

## Что сделано
- Создана утилита `generateId()` в `shared/lib/generateId.ts` — генерация UUID v4 через `Math.random()`
- Заменены все вызовы `crypto.randomUUID()` на `generateId()` в трёх файлах
- Добавлено логирование ошибки в catch-блок `ChatForm.tsx` (ранее ошибка проглатывалась)

## Изменённые файлы
- `src/shared/lib/generateId.ts` — новая утилита
- `src/shared/lib/index.ts` — экспорт generateId
- `src/entities/chat/model/chatRepository.ts` — замена crypto.randomUUID()
- `src/entities/message/model/messageRepository.ts` — замена crypto.randomUUID()
- `src/widgets/chat-form/ChatForm.tsx` — замена + логирование ошибки

## Причина ошибки
`crypto.randomUUID()` недоступен в React Native — глобальный объект `crypto` не определён в Hermes/JSC рантайме.

## Тестирование
- Проверить создание нового чата
- Проверить создание сообщения
- Проверить редактирование чата с аватаром
