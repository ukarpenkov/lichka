# Исправление: клавиатура перекрывает поле ввода на Android

**Дата:** 2026-07-03
**Промпт/задача:** Баг: клавиатура перекрывает поле ввода сообщения в чате на Android

## Что сделано
- Создан баг-репорт в `docs/bugs/keyboard-covers-input-android.md`
- Добавлен `androidWindowSoftInputMode: 'adjustResize'` в опции экрана `ChatRoom` в `AppNavigator.tsx`

## Изменённые файлы
- `src/app/AppNavigator.tsx` — добавлена опция `androidWindowSoftInputMode: 'adjustResize'` для экрана ChatRoom
- `docs/bugs/keyboard-covers-input-android.md` — создан баг-репорт

## Принятые решения
**Проблема:** `react-native-screens` (через `@react-navigation/native-stack`) создаёт нативные `ScreenFragment`-контейнеры, которые переопределяют `windowSoftInputMode` из `AndroidManifest.xml` на `adjustNothing`. В результате клавиатура перекрывает контент.

**Решение:** Установить `androidWindowSoftInputMode: 'adjustResize'` на уровне экрана в навигаторе. `react-native-screens` передаёт эту опцию в нативный `Screen.java`, который вызывает `getActivity().getWindow().setSoftInputMode(mode)`. Это гарантирует, что `adjustResize` применяется именно к ScreenFragment, а не наследуется из манифеста.

**Почему не KeyboardAvoidingView:** Предыдущие попытки (2026-07-01/02) показали, что `KeyboardAvoidingView` + `adjustResize` дают двойную компенсацию. Нативное решение через `androidWindowSoftInputMode` решает проблему на уровне фреймворка без JS-side компенсаций.

## Известные ограничения
- Решение применимо только к экрану чата. Если такая же проблема возникнет на других экранах, нужно будет добавить опцию и для них.

## Тестирование
- Проверена сборка линтером — ошибок нет
- Требуется ручная верификация на Android-устройстве/эмуляторе
