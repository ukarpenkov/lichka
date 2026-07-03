# Исправление: клавиатура перекрывает поле ввода на Android

**Дата:** 2026-07-03
**Промпт/задача:** Баг `keyboard-covers-input-android` всё ещё воспроизводится после предыдущего фикса

## Что сделано
- **AppNavigator.tsx**: `androidWindowSoftInputMode` изменён с `'adjustResize'` на `'adjustNothing'` — отключаем автоматический resize окна, чтобы избежать двойной компенсации
- **ChatRoomScreen.tsx**: добавлены `useAnimatedKeyboard` и `useAnimatedStyle` для ручного анимированного `paddingBottom` на `chatArea` — контент поднимается на высоту клавиатуры

## Изменённые файлы
- `src/app/AppNavigator.tsx:50` — `adjustResize` → `adjustNothing` + `@ts-expect-error`
- `src/pages/chat-room/ChatRoomScreen.tsx:2,6-7,94-97,293,317` — импорт `Platform`, `useAnimatedKeyboard`, `useAnimatedStyle`; хук и анимированный стиль; замена `<View>` на `<Animated.View>` для chatArea

## Принятые решения
- `useAnimatedKeyboard` выбран вместо `KeyboardAvoidingView`, потому что он уже использовался ранее (2026-07-01) и работал корректно; был удалён только из-за двойной компенсации с `adjustResize`
- `adjustNothing` вместо `adjustResize` — чтобы исключить конфликт системного и ручного управления клавиатурой
- Анимированный `paddingBottom` применяется только на Android (`Platform.OS === 'android'`), на iOS поведение не меняется

## Тестирование
- Собрать и запустить на Android-устройстве/эмуляторе, открыть чат, нажать на поле ввода — клавиатура должна появиться, поле ввода должно быть видно над ней
