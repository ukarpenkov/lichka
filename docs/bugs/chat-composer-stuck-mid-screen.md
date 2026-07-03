# Блок отправки сообщения отображается в середине экрана при открытии чата

## Описание
Блок ввода сообщения (`Message...`) и панель иконок отправки отображаются в середине экрана, сразу после последнего сообщения, вместо того чтобы быть прижатыми ко дну. Ниже — большое пустое пространство до нижней навигации.

## Шаги воспроизведения
1. Открыть приложение
2. Перейти в чат "Saved messages"
3. Обратить внимание на положение блока ввода

## Ожидаемый результат
Блок ввода сообщения и панель иконок прижаты к нижней части экрана (над нижней навигацией).

## Фактический результат
Блок ввода и панель иконок отображаются в середине экрана, сразу после последнего сообщения. Оставшаяся ~половина экрана пустая.

## Локализация
- `src/pages/chat-room/ChatRoomScreen.tsx:103-108` — `chatAreaAnimatedStyle` c `paddingBottom: Math.max(keyboard.height.value - tabBarHeight, 0)` на Android
- `src/widgets/message-composer/MessageComposer.tsx:84-86` — `containerAnimatedStyle` с `paddingBottom: keyboard.height.value > 0 ? 0 : 12`

## Причина
`useAnimatedKeyboard().height.value` не всегда равен 0 когда клавиатура закрыта — возникает гонка при навигации: анимация скрытия клавиатуры не успевает завершиться до монтирования экрана чата, и `keyboard.height.value` остаётся на ненулевом значении.

Из-за этого `chatAreaAnimatedStyle` применяет `paddingBottom` (равный `keyboard.height.value - tabBarHeight`) хотя клавиатура не открыта. Этот отступ сдвигает весь `chatArea` (список сообщений + MessageComposer) вверх, оставляя пустое пространство снизу. Блок ввода оказывается в середине экрана.

## Исправление
Добавлен надёжный трекинг видимости клавиатуры через `Keyboard.addListener('keyboardDidShow'/'keyboardDidHide')`, синхронизированный в reanimated shared value `keyboardVisible`. `paddingBottom` теперь применяется только когда `keyboardVisible.value === true`.

### Изменённые файлы
- `src/pages/chat-room/ChatRoomScreen.tsx` — добавлен `keyboardVisible` shared value + `Keyboard.addListener`, `chatAreaAnimatedStyle` проверяет `keyboardVisible.value`
- `src/widgets/message-composer/MessageComposer.tsx` — добавлен `keyboardVisible` shared value + `Keyboard.addListener`, `containerAnimatedStyle` использует `keyboardVisible.value`

## Статус
fixed (2026-07-03)
