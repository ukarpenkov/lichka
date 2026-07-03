# Баг: Клавиатура перекрывает поле ввода (Android)

## Описание
При открытии клавиатуры на Android она перекрывает input-поле для ввода сообщения. Пользователь не видит, что печатает.

## Шаги воспроизведения
1. Открыть чат
2. Нажать на поле ввода сообщения в MessageComposer
3. Появляется клавиатура

## Ожидаемый результат
Input поднимается над клавиатурой, текст ввода виден

## Фактический результат
Клавиатура закрывает поле ввода, пользователь не видит свой текст

## Локализация
- `android/app/src/main/AndroidManifest.xml:24` — `android:windowSoftInputMode="adjustResize"`
- `src/pages/chat-room/ChatRoomScreen.tsx:254` — корневой View без KeyboardAvoidingView
- `src/widgets/message-composer/MessageComposer.tsx:272` — TextInput без защиты от клавиатуры

## Причина
`react-native-screens` (через `@react-navigation/native-stack`) создаёт нативные `ScreenFragment`-контейнеры для каждого экрана. Эти контейнеры **переопределяют** `windowSoftInputMode`, установленный в `AndroidManifest.xml`, на значение по умолчанию `adjustNothing`. В результате `adjustResize` из манифеста игнорируется, и клавиатура перекрывает контент.

## Корень
`Screen.java` (react-native-screens) в `updateWindowSoftInputMode()` вызывает `getActivity().getWindow().setSoftInputMode(mWindowSoftInputMode)`, где `mWindowSoftInputMode` по умолчанию равен `SOFT_INPUT_ADJUST_NOTHING`.

## История
1. **2026-07-01** — добавлен `useAnimatedKeyboard` с `paddingBottom`. Двойная компенсация: `adjustResize` + `paddingBottom`. Исправлено.
2. **2026-07-02** — удалён `useAnimatedKeyboard`. `adjustResize` из манифеста не работает из-за ScreenFragment. Клавиатура перекрывает input. **Настоящий баг.**

## Исправление
**Проблема:** `androidWindowSoftInputMode: 'adjustResize'` в опциях экрана ChatRoom не решил проблему — `adjustResize` ненадёжен на Android с `react-native-screens`, клавиатура всё равно перекрывает поле ввода.

**Решение:**
1. `AppNavigator.tsx`: переключить `androidWindowSoftInputMode` на `'adjustNothing'` — убираем автоматический resize окна
2. `ChatRoomScreen.tsx`: добавить `useAnimatedKeyboard` с анимированным `paddingBottom` на `chatArea` — вручную поднимаем контент над клавиатурой

## Статус
fixed
