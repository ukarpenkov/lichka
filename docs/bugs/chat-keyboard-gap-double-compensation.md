# [UI] Лишний отступ между панелью ввода и клавиатурой в чате

## Описание
При открытии клавиатуры на экране чата между `MessageComposer` и клавиатурой появляется пустое пространство (фон приложения). Панель ввода не прилегает к клавиатуре.

## Локализация
`src/pages/chat-room/ChatRoomScreen.tsx:92-115` — `useAnimatedKeyboard` с `paddingBottom`

## Причина
Двойная компенсация высоты клавиатуры:
1. `android:windowSoftInputMode="adjustResize"` в `AndroidManifest.xml:24` — система сама уменьшает окно на высоту клавиатуры
2. `useAnimatedKeyboard` + `paddingBottom: keyboard.height.value` в `ChatRoomScreen.tsx` — добавлена **дополнительная** компенсация поверх системной

В результате контент сдвигается дважды, и между `MessageComposer` (низ контента) и клавиатурой образуется зазор.

## Исправление
Удалён `useAnimatedKeyboard` и связанная логика `keyboardAreaStyle`. Клавиатура обрабатывается нативно через `adjustResize`.

## Статус
fixed
