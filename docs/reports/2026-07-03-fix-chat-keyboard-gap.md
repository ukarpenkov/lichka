# Исправление зазора между панелью ввода и клавиатурой

**Дата:** 2026-07-03
**Промпт/задача:** Исправление бага chat-keyboard-gap-double-compensation — зазор между MessageComposer и клавиатурой оставался после предыдущей попытки фикса

## Что сделано
- Удалён `useAnimatedKeyboard` и связанная логика `chatAreaAnimatedStyle` из `ChatRoomScreen.tsx`
- Удалены неиспользуемые импорты: `useAnimatedKeyboard`, `useAnimatedStyle`, `Platform`
- Клавиатура теперь обрабатывается нативно через `android:windowSoftInputMode="adjustResize"` в `AndroidManifest.xml`

## Изменённые файлы
- `src/pages/chat-room/ChatRoomScreen.tsx` — удалены `useAnimatedKeyboard`, `useAnimatedStyle`, `Platform`, переменные `keyboard` и `chatAreaAnimatedStyle`, убран `chatAreaAnimatedStyle` из стилей `Animated.View`
- `docs/bugs/chat-keyboard-gap-double-compensation.md` — обновлён статус и описание исправления

## Принятые решения
- Простое удаление без замены — `adjustResize` в `AndroidManifest.xml` уже обеспечивает корректную обработку клавиатуры нативно

## Известные ограничения
- Нет

## Тестирование
- Требуется ручная проверка: открыть чат, нажать на поле ввода, убедиться что MessageComposer прилегает к клавиатуре без зазора
