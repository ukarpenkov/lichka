# Фикс: блок ввода в чате застревает в середине экрана

**Дата:** 2026-07-03
**Промпт/задача:** Исправить баг: при открытии чата блок ввода сообщения отображается в середине экрана, а не прижат ко дну. Происходит не всегда.

## Что сделано
- Установлена корневая причина: `useAnimatedKeyboard().height.value` не всегда равен 0 при закрытой клавиатуре — гонка при навигации между экранами
- В `ChatRoomScreen.tsx` добавлен `keyboardVisible` shared value с надёжным трекингом через `Keyboard.addListener`
- В `ChatRoomScreen.tsx` `chatAreaAnimatedStyle` теперь проверяет `keyboardVisible.value` перед применением `paddingBottom`
- В `MessageComposer.tsx` аналогично добавлен трекинг видимости клавиатуры, `containerAnimatedStyle` использует `keyboardVisible.value` вместо `keyboard.height.value > 0`

## Изменённые файлы
- `src/pages/chat-room/ChatRoomScreen.tsx` — добавлен `Keyboard` import, `keyboardVisible` shared value, `useEffect` с Keyboard listeners, проверка в `chatAreaAnimatedStyle`
- `src/widgets/message-composer/MessageComposer.tsx` — добавлен `Keyboard` import, `keyboardVisible` shared value, `useEffect` с Keyboard listeners, замена условия в `containerAnimatedStyle`

## Принятые решения
- Использовать `Keyboard.addListener('keyboardDidShow'/'keyboardDidHide')` вместо `keyboardWill*` для надёжности на всех версиях Android
- Shared value (`keyboardVisible`) вместо React state — чтобы `useAnimatedStyle` мог читать значение на UI-потоке
- Не менять структуру layout — текущий подход `flex: 1` на chatArea + ручная компенсация через padding корректен, проблема была только в триггере

## Известные ограничения
- `Keyboard.addListener` на Android эмитит `keyboardDidShow` с задержкой ~100-200ms после реального появления клавиатуры; на время этой задержки `paddingBottom` не применяется, но это незаметно благодаря `keyboard.height.value`, который уже отреагировал

## Тестирование
- Открытие чата "Saved messages" без предварительного использования клавиатуры — composer прижат ко дну
- Открытие чата после использования клавиатуры на другом экране — composer прижат ко дну
- Нажатие на поле ввода — клавиатура открывается, composer поднимается над ней без зазора
- Скрытие клавиатуры — composer возвращается на место без задержки
