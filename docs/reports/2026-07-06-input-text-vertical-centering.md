# Баг: Текст в поле ввода прилипает к низу

**Дата:** 2026-07-06
**Промпт/задача:** Завести баг в `docs/bugs/` и исправить — текст и placeholder в поле ввода `MessageComposer` прилипают к нижнему краю поля, должны быть по вертикальному центру.

## Что сделано
- Заведён баг-файл `docs/bugs/input-text-bottom-aligned.md` с описанием, локализацией, причиной и фиксом.
- Исправлен `MessageComposer`: `inputWrapper.alignItems` изменён с `'flex-end'` → `'center'`, чтобы `TextInput` и кнопка прикрепления центрировались по вертикали.
- На `TextInput` добавлен `textAlignVertical="center"` для детерминированного центрирования текста на Android (на iOS свойство игнорируется; при `maxHeight: 120` без `minHeight` не влияет на многострочный режим).
- Добавлен `testID="composer-input-wrapper"` на обёртку поля для тестируемости.
- Добавлен unit-тест, фиксирующий `textAlignVertical: 'center'` и `alignItems: 'center'`.

## Изменённые файлы
- `docs/bugs/input-text-bottom-aligned.md` — новый баг-репорт.
- `src/widgets/message-composer/MessageComposer.tsx` — фикс `alignItems`, `textAlignVertical`, `testID`.
- `src/widgets/message-composer/__tests__/MessageComposer.test.tsx` — тест «vertically centers text inside the input field» + импорт `StyleSheet`.

## Принятые решения
- Гипотеза из репорта (`textAlignVertical: 'center'`) сама по себе не исправляет баг: при `maxHeight` без `minHeight` высота `TextInput` равна контенту, поэтому `textAlignVertical` не имеет эффекта. Реальная причина — `alignItems: 'flex-end'` в `inputWrapper`: Paperclip (22px + padding) делает контейнер выше однострочного `TextInput`, и тот прижимается к низу.
- `shared/ui/Input` уже корректен (`textAlignVertical: multiline ? 'top' : 'center'`), но `MessageComposer` использует собственный `TextInput`, поэтому фикс применён в виджете.
- Выбрано `alignItems: 'center'` (вместо `flex-end`): одна строка — текст по центру; много строк — `TextInput` растёт, кнопка прикрепления остаётся по центру (как в Telegram).

## Известные ограничения
- Поведение многострочного режима (кнопка прикрепления по центру, а не внизу) — намеренное компромиссное решение. Если потребуется «bottom»-выравнивание кнопки при многострочном вводе, потребуется отдельная задача с условным `alignItems` по числу строк.
- `testID` добавлен в UI-компонент ради теста стиля.

## Тестирование
- `npx jest src/widgets/message-composer/__tests__/MessageComposer.test.tsx` — 5/5 passed.
- Новый сценарий: «vertically centers text inside the input field» проверяет `input.props.textAlignVertical === 'center'` и `StyleSheet.flatten(wrapper.props.style).alignItems === 'center'`.
- Существующие тесты на кнопки (Paperclip, Send, Repeat, Bell) — не сломаны.
