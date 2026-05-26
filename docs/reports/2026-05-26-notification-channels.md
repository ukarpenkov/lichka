# Создание notification channels и регистрация

**Дата:** 2026-05-26
**Промпт/задача:** 8.1 Создать notification channels и регистрацию (plain RN Native Module)

## Что сделано
- Создан `NotificationModule.kt` — React Native Native Module, регистрирующий 2 канала при старте:
  - `reminders` (IMPORTANCE_DEFAULT) — для напоминаний
  - `alarms` (IMPORTANCE_HIGH, CATEGORY_ALARM, bypassDnd) — для полноэкранных будильников
- Создан `NotificationPackage.kt` — ReactPackage для регистрации модуля
- Обновлён `MainApplication.kt` — добавлен `NotificationPackage` в список пакетов
- Создана JS-обёртка `notificationChannels.ts` в `shared/lib` с экспортируемыми константами каналов
- Expo-modules-core не используется — plain RN Native Module

## Изменённые файлы
- `android/app/src/main/java/com/lichka/NotificationModule.kt` — новый файл, Native Module
- `android/app/src/main/java/com/lichka/NotificationPackage.kt` — новый файл, ReactPackage
- `android/app/src/main/java/com/lichka/MainApplication.kt` — добавлен `add(NotificationPackage())`
- `src/shared/lib/notificationChannels.ts` — новый файл, JS-обёртка
- `src/shared/lib/index.ts` — экспорт notificationChannels
- `docs/tasks/promted-tasks.md` — отмечена задача 8.1

## Принятые решения
- Каналы регистрируются в `initialize()` модуля (автоматически при старте RN bridge) + доступны через `@ReactMethod registerChannels()` из JS
- Канал `alarms` имеет `bypassDnd(true)` для пробоя через режим «Не беспокоить»
- JS-обёртка — no-op на iOS (Platform.OS check)
- Константы `CHANNEL_REMINDERS` и `CHANNEL_ALARMS` экспортируются для использования в фичах уведомлений

## Известные ограничения
- Каналы создаются с дефолтными настройками звука/вибрации; кастомизация — в следующих задачах (8.2, 8.3)
- Для Android 13+ (API 33) потребуется runtime permission `POST_NOTIFICATIONS` — будет добавлено в 8.2

## Тестирование
- Ручная проверка: `adb shell dumpsys notification | grep -A 5 "reminders"` после запуска приложения
