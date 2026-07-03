# [UI] Панель ввода прячется за клавиатурой в чате

## Описание
При открытии клавиатуры на экране чата `MessageComposer` оказывается **под** клавиатурой — пользователь не видит поле ввода.

## Локализация
- `src/pages/chat-room/ChatRoomScreen.tsx` — основной layout экрана чата
- `android/app/src/main/AndroidManifest.xml:26` — `windowSoftInputMode`

## Причина
Конфликт `adjustResize` (нативная обработка Android) и React Native:
1. `adjustResize` уменьшает окно при открытии клавиатуры, но React Native с `flex: 1` layout **не корректно** пересчитывает размеры — контент не сжимается
2. Предыдущий код компенсировал это через `useAnimatedKeyboard` + `paddingBottom`, но это вызывало двойную компенсацию (зазор)
3. После удаления `useAnimatedKeyboard` без замены — панель ввода ушла под клавиатуру

## Исправление
1. **`AndroidManifest.xml`** — заменён `adjustResize` на `adjustNothing` (Android не трогает layout нативно)
2. **`ChatRoomScreen.tsx`** — область чата обёрнута в `KeyboardAvoidingView` с `behavior="padding"` для корректного подъёма контента при открытии клавиатуры
3. **`AppNavigator.tsx`** — удалён невалидный `androidWindowSoftInputMode` (остаток предыдущей попытки)

### Изменённые файлы
- `android/app/src/main/AndroidManifest.xml` — `adjustResize` → `adjustNothing`
- `src/pages/chat-room/ChatRoomScreen.tsx` — добавлен `KeyboardAvoidingView` вокруг области чата
- `src/app/AppNavigator.tsx` — удалён `androidWindowSoftInputMode: 'adjustNothing'`

## Статус
fixed (2026-07-03)
