# Исправление краша react-native-screens при восстановлении фрагментов

**Дата:** 2026-06-05
**Промпт/задача:** Приложение крашится на реальном устройстве с ошибкой `java.lang.IllegalStateException: Screen fragments should never be restored`

## Что сделано

- Добавлен `onCreate` override в `MainActivity.kt`, который передаёт `null` в `super.onCreate()` вместо `savedInstanceState`
- Это предотвращает попытку Android восстановить `ScreenFragment` после убийства процесса в фоне

## Изменённые файлы

- `android/app/src/main/java/com/lichka/MainActivity.kt` — добавлен `import android.os.Bundle` и метод `onCreate(savedInstanceState: Bundle?)` с `super.onCreate(null)`

## Принятые решения

- Использован подход `super.onCreate(null)` — рекомендованный в official react-native-screens issues (#17, #1487)
- Это стандартный паттерн для RN-приложений с react-native-screens

## Известные ограничения

- При восстановлении из фона приложение будет холодно стартовать (React инициализируется заново), а не продолжать с того же состояния
- Это нормальный trade-off для RN-приложений — навигация полностью управляется JS-стороной

## Тестирование

- Проверить: свернуть приложение → подождать пока Android убьёт процесс (или убить через `adb shell am kill com.lichka`) → открыть снова — не должно крашиться
