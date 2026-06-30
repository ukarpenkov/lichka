# Совместимость приложения с Android-эмулятором на Windows

**Дата:** 2026-06-28
**Промпт/задача:** Приложение запускается и тут же закрывается на эмуляторе Android. Исправить запуск на эмуляторе и реальных устройствах.

## Что сделано

- Проведён полный аудит совместимости с Android-эмулятором (x86_64)
- Проверены: конфигурация Gradle, нативные модули (CMake/C++), зависимости, цепочка импортов при запуске
- Исправлена единственная критическая проблема

## Найденная проблема

**`android/gradle.properties:29`** — `reactNativeArchitectures` содержал только ARM:

```
# БЫЛО:
reactNativeArchitectures=arm64-v8a,armeabi-v7a

# СТАЛО:
reactNativeArchitectures=arm64-v8a,armeabi-v7a,x86_64
```

Эмулятор на Windows работает на x86_64. Все C++ нативные модули читают эту настройку из `rootProject`:
- `react-native-nitro-modules` → `android/build.gradle:56` `abiFilters (*reactNativeArchitectures())`
- `react-native-audio-recorder-player` → `android/build.gradle:46` `abiFilters (*reactNativeArchitectures())`
- `react-native-worklets` → аналогичный паттерн
- `@op-engineering/op-sqlite` → аналогичный паттерн

Без `x86_64` нативные `.so` библиотеки не собирались для архитектуры эмулятора → крэш при загрузке любого нативного модуля.

## Изменённые файлы

- `android/gradle.properties` — добавлена архитектура `x86_64`

## Известные особенности на эмуляторе

| Модуль | Работает | Примечание |
|--------|----------|------------|
| op-sqlite (БД) | Да | После исправления архитектуры |
| NitroModules | Да | После исправления архитектуры |
| Worklets | Да | После исправления архитектуры |
| react-native-haptic-feedback | Частично | Вибромотор отсутствует, `enableVibrateFallback: true` обеспечивает fallback |
| react-native-sound | Да | Звук через эмулятор |
| react-native-audio-recorder-player | Да | Запись через виртуальный микрофон эмулятора |
| react-native-fs | Да | Файловая система эмулятора |
| Напоминания/будильники | Да | AlarmManager работает на эмуляторе |

## Порядок запуска

1. Пересобрать: `npm run android:emulator` (уже включает `--active-arch-only`)
2. Или вручную: `npx react-native run-android --active-arch-only`
3. Metro-сервер: `npm run start` (в отдельном терминале)
