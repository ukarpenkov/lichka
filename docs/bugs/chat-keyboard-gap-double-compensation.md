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
Удалены `useAnimatedKeyboard`, `useAnimatedStyle` и связанная логика `chatAreaAnimatedStyle` из `ChatRoomScreen.tsx`. Клавиатура обрабатывается нативно через `adjustResize` в `AndroidManifest.xml`.

### Изменённые файлы
- `src/pages/chat-room/ChatRoomScreen.tsx` — удалены `useAnimatedKeyboard`, `useAnimatedStyle`, `Platform`, переменные `keyboard` и `chatAreaAnimatedStyle`, а также `chatAreaAnimatedStyle` из стилей `Animated.View`

## Статус
fixed (2026-07-03)
