# Иконка уведомлений на Wear / Harmony часах

**Дата:** 2026-07-29
**Промпт/задача:** На Android Wear / Harmony OS (GT и похожие) уведомления приходят с дефолтной иконкой сообщений вместо логотипа Lichka.

## Что сделано

- В `NotificationHelper` для reminder и alarm добавлен `setLargeIcon` с round-лаунчером приложения (`ic_launcher_round`, fallback на `ic_launcher` / application icon).
- Добавлен хелпер `appLargeIcon` / `drawableToBitmap`: корректно рендерит adaptive icon в `Bitmap` (на API 26+ `BitmapFactory.decodeResource` для adaptive mipmap часто даёт null).
- Монохромный `setSmallIcon(R.drawable.ic_stat_notification)` оставлен без изменений — для status bar на телефоне.

## Изменённые файлы

- `android/app/src/main/java/com/lichka/NotificationHelper.kt` — `setLargeIcon` в `buildReminderNotification` и `buildAlarmNotification`, хелперы конвертации drawable → bitmap

## Принятые решения

- **Причина:** на часах (Wear bridge / Huawei Health / Harmony) цветной аватар обычно берётся из `largeIcon`; без него мост часто подставляет generic «сообщения». `smallIcon` — только альфа-маска для шторки телефона.
- **Round launcher:** `ic_launcher_round` лучше смотрится на круглых циферблатах.
- **Не трогали** `ic_stat_notification` и каналы уведомлений — проблема была не в small icon, а в отсутствии large icon в payload.

## Известные ограничения

- Часть Huawei/Honor GT через Health может игнорировать `largeIcon` у сторонних приложений и показывать generic — ограничение моста, не Android Notification API.
- Проверка на устройстве (конкретная модель часов) в рамках задачи не выполнялась — нужна ручная проверка после сборки.

## Тестирование

- `./gradlew :app:compileDebugKotlin` — успешно
- На устройстве: пересобрать приложение → дождаться reminder/alarm → проверить иконку на часах и large icon в шторке телефона
