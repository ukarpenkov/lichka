# Баг: Текст в поле ввода прилипает к низу

## Описание
При вводе одной строки в поле ввода сообщения текст и placeholder прилипают к нижнему краю поля ввода вместо того, чтобы располагаться по вертикальному центру.

## Компонент
`MessageComposer` → собственный `TextInput` (не `shared/ui/Input`)

## Шаги воспроизведения
1. Открыть чат
2. Посмотреть на пустое поле ввода в `MessageComposer` (placeholder)
3. Начать печатать одну строку текста

## Ожидаемый результат
Текст и placeholder расположены по вертикальному центру поля ввода.

## Фактический результат
Текст и placeholder прижаты к нижнему краю поля ввода.

## Локализация
- `src/widgets/message-composer/MessageComposer.tsx:460` — `inputWrapper` со стилем `alignItems: 'flex-end'`
- `src/widgets/message-composer/MessageComposer.tsx:469` — `input` (`TextInput`, `multiline`, без `textAlignVertical`)

## Причина
`inputWrapper` — это `flexDirection: 'row'` с `alignItems: 'flex-end'`. Внутри лежат `TextInput` (`flex: 1`, высота = контент) и `IconButton` (Paperclip, 22px + padding). Кнопка прикрепления делает контейнер выше, чем однострочный `TextInput`, а `alignItems: 'flex-end'` прижимает `TextInput` к нижнему краю контейнера по кросс-оси (вертикали). В результате текст (вместе с placeholder) оказывается в нижней части видимого поля.

Гипотеза из репорта (`textAlignVertical: 'center'`) сама по себе не исправляет баг: при `maxHeight: 120` без `minHeight` высота `TextInput` равна контенту, поэтому `textAlignVertical` не имеет эффекта — позицию текста определяет положение самого `TextInput` внутри `inputWrapper`.

`shared/ui/Input` уже корректен: `textAlignVertical: multiline ? 'top' : 'center'`. Но `MessageComposer` использует собственный `TextInput`, а не `shared/ui/Input`.

## Исправление
Изменить `alignItems: 'flex-end'` → `'center'` в `inputWrapper` (`src/widgets/message-composer/MessageComposer.tsx`). Это центрирует `TextInput` и кнопку прикрепления по вертикали:
- одна строка — текст по центру поля;
- много строк — `TextInput` растёт вверх/вниз, кнопка прикрепления остаётся по центру (приемлемо для чат-композера, как в Telegram).

Дополнительно добавлен `textAlignVertical: 'center'` на `TextInput` для явного центрирования текста на Android (на iOS свойство игнорируется, на Android при отсутствии `minHeight` не влияет на многострочный режим, но делает поведение детерминированным).

## Статус
fixed
