# Полупрозрачный текст в поле ввода чата

**Дата:** 2026-08-28
**Промпт/задача:** Описать баг (текст в инпуте чата полупрозрачный, только контуры), исправить и написать отчёт.

## Что сделано

- Зафиксирован баг: после ретро-курсора набранный текст в композере терял заливку и оставался контурами.
- Измерительный слой `RetroTextInput` скрывается через `opacity: 0`, а не `color: 'transparent'`.
- Слой измерения и caret больше не обёрнуты в `absoluteFill`-контейнер поверх поля.
- Добавлен тест, что цвет текста инпута остаётся непрозрачным, а измерение полностью скрыто.

## Изменённые файлы

- `docs/bugs/chat-input-text-outline-only.md` — описание, причина и статус.
- `src/features/retro-text-caret/RetroTextInput.tsx` — скрытие измерительного слоя без прозрачного цвета.
- `src/features/retro-text-caret/__tests__/RetroTextInput.test.tsx` — проверка непрозрачного текста и `opacity: 0` у измерения.
- `docs/reports/2026-08-28-chat-input-text-outline-fix.md` — отчёт.

## Принятые решения

- Нативный `TextInput` по-прежнему единственный редактор: значение, IME и selection не менялись.
- `opacity: 0` оставляет `onTextLayout`, но не растеризует контуры глифов, в отличие от `color: 'transparent'`.
- Горизонтальный caret и `caretHidden` сохранены.

## Известные ограничения

- Позиция caret по-прежнему зависит от метрик скрытого `Text`; расхождение с `TextInput` на отдельных прошивках возможно, как и раньше.
- Ручная проверка на устройстве в рамках задачи не выполнялась.

## Тестирование

- `npm test -- --runInBand src/features/retro-text-caret/__tests__/RetroTextInput.test.tsx src/widgets/message-composer/__tests__/MessageComposer.test.tsx`
- Результат: 2 test suites passed, 19 tests passed.
- Покрытие `RetroTextInput`: statements / functions / lines 100%, branches около 87%.
