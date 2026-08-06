---
bug: chat-input-keyboard-dismisses-after-focus
status: fixed
branch: main
commits:
---

# Исправление самопроизвольного закрытия клавиатуры в чате

**Дата:** 2026-08-07
**Задача:** сохранить фокус поля `Message...` и открытую клавиатуру после тапа на экране чата.

## Что сделано

- Зафиксирована причина потери фокуса: условное изменение иерархии вокруг `MessageComposer` при перерасчёте нижней границы списка.
- Native gesture boundary композера сделан постоянным, чтобы изменение высоты экрана при открытии клавиатуры не размонтировало `TextInput`.
- Добавлена карточка бага с шагами воспроизведения, причиной и описанием исправления.

## Изменённые файлы

- `src/pages/chat-room/ChatRoomScreen.tsx` — устранено условное добавление и удаление `GestureDetector` вокруг композера.
- `src/pages/chat-room/__tests__/ChatRoomScreen.keyboardFocus.test.tsx` — добавлен regression-тест, проверяющий отсутствие remount при изменении scroll-метрик.
- `docs/bugs/chat-input-keyboard-dismisses-after-focus.md` — заведено описание критического бага.
- `docs/compose/reports/2026-08-07-chat-input-keyboard-focus.md` — итоговый отчёт.

## Принятые решения

- Обёртка native gesture остаётся смонтированной независимо от `atBottom`. Внешний future-peek pan уже управляет собственной активностью через `enabled` и edge gate, поэтому условно менять React-иерархию композера не требуется.
- Логика `Keyboard.dismiss()` не менялась: проблема была не в явном закрытии клавиатуры, а в пересоздании сфокусированного нативного поля.

## Известные ограничения

- Проверка поведения на физическом Android-устройстве в рамках этой сессии не выполнялась.
- Общая проверка TypeScript по проекту остаётся красной из-за ранее существовавших ошибок в `FuturePeekOverlay`, `pixel-avatar`, `scheduled-widget`, `imageCompress` и тестах `ImageMessage`; изменённый файл новых диагностик не добавляет.

## Тестирование

- `npm test -- --runInBand src/widgets/message-composer/__tests__/MessageComposer.test.tsx src/features/chat-future-peek/__tests__/useFuturePeekGesture.test.ts` — 2 набора, 8 тестов успешно.
- `npm test -- --runInBand src/pages/chat-room/__tests__/ChatRoomScreen.keyboardFocus.test.tsx` — regression-тест успешно подтверждает, что композер остаётся смонтированным при изменении `atBottom`.
- `npx eslint src/pages/chat-room/ChatRoomScreen.tsx` — ошибок нет; одна ранее существовавшая warning по inline style.
- `npx eslint src/pages/chat-room/__tests__/ChatRoomScreen.keyboardFocus.test.tsx` — ошибок и предупреждений нет.
- `git diff --check` — успешно.
- IDE-диагностика изменённого TypeScript-файла — ошибок нет.
