# Исправление зазора клавиатуры в чате

**Дата:** 2026-07-01
**Промпт/задача:** При вызове клавиатуры поднимался только блок ввода сообщения, между ним и клавиатурой оставался видимый зазор с последними сообщениями чата

## Что сделано

- Убрана независимая клавиатурная логика из `MessageComposer` (`useAnimatedKeyboard` + `transform: translateY`)
- Убран `paddingBottom` с `contentContainerStyle` `FlatList`
- Создан общий контейнер `Animated.View` (`chatArea`), оборачивающий `FlatList` + `MessageComposer`
- `keyboardAreaStyle` применяется к этому контейнеру: на Android добавляет `paddingBottom` равный высоте клавиатуры, на iOS возвращает пустой объект (система сама обрабатывает resize)

## Изменённые файлы

- `src/pages/chat-room/ChatRoomScreen.tsx` — замена `keyboardPaddingStyle` на `keyboardAreaStyle`, обёртка FlatList+Composer в `Animated.View`
- `src/widgets/message-composer/MessageComposer.tsx` — удалены `useAnimatedKeyboard`, `composerStyle`, импорт `Platform`

## Принятые решения

Проблема была в том, что два компонента независимо обрабатывали клавиатуру: `MessageComposer` двигал себя через `transform` (визуально, без влияния на layout), а `FlatList` добавлял `paddingBottom` в `contentContainerStyle` (для скролла). В результате на Android (translucent keyboard) `FlatList` не сжимался, а `MessageComposer` уезжал вверх — между ними появлялся зазор.

Решение: один контейнер с `paddingBottom` сжимает и список, и поле ввода одновременно. `flex: 1` на `FlatList` корректно уменьшает его высоту.

## Известные ограничения

- На iOS возврат пустого объекта — клавиатура обрабатывается системой через resize окна

## Тестирование

- Ручное тестирование на Android/iOS: открытие клавиатуры, ввод текста, запись голоса, отправка сообщения
