# Wear OS: починка largeIcon уведомлений

**Дата:** 2026-08-23
**Промпт/задача:** Оценить правку иконки уведомлений на Wear OS / Harmony (Huawei) от 2026-07-29; закрыть проблему на настоящем Wear OS, не меняя основные уведомления на телефоне.

Связано: [`2026-07-29-notification-watch-large-icon.md`](2026-07-29-notification-watch-large-icon.md)

## Что сделано

- Разобраны два разных моста часов: **Wear OS 3+** (Pixel Watch, Galaxy Watch 4+) и **Huawei/Honor GT через Health**.
- В `NotificationHelper.appLargeIcon` исправлена растеризация adaptive-иконки: bitmap берётся в системный размер `notification_large_icon_width` / `height`, а не из `intrinsicWidth` (у `AdaptiveIconDrawable` часто **-1** → получался bitmap **1×1**).
- `setLargeIcon` в reminder/alarm **оставлен** — на Wear OS 3+ круглый аватар карточки это то же поле, что и large icon в шторке; отдельного Wear-only API нет.
- Не трогали: `smallIcon` (`ic_stat_notification`), каналы, будильник / full-screen, snooze, «прочитано», тексты.

## Изменённые файлы

- `android/app/src/main/java/com/lichka/NotificationHelper.kt` — `appLargeIcon` / `appIconDrawable`; билдеры reminder и alarm по полям те же

## Принятые решения

- **Диагноз 2026-07-29 частично верен для Wear OS:** цветной аватар на часах — `largeIcon`. Но реализация конвертации adaptive mipmap была сломана: `drawable.intrinsicWidth.coerceAtLeast(1)` давал 1×1, Wear подставлял fallback.
- **Huawei GT / Harmony через Health** игнорирует `largeIcon` / `smallIcon` у сторонних приложений и рисует иконку из своего каталога (иначе generic «сообщения»). Это ограничение моста, из NotificationCompat не чинится.
- **`WearableExtender.setBackground` не использовать:** deprecated, на Wear OS 3+ игнорируется; визуально не отделяет часы от телефона.
- **Не убирать `setLargeIcon`:** без него Wear OS 3+ берёт launcher icon приложения (это уже лучше 1×1), но идея «аватар из largeIcon» для настоящих часов остаётся верной. Кастомный аватар на часах и large icon в шторке — одно поле.
- **Телефон:** статусбар по-прежнему перо (`smallIcon`). Справа в строке шторки может появиться нормальное круглое лого вместо пустого места/точки — тот же `setLargeIcon`, что уже был, теперь не 1×1.

## Известные ограничения

- Huawei/Honor GT, Watch Fit и аналоги через Huawei Health — generic-иконка останется.
- На телефоне large icon в шторке теперь видимый (если 1×1 система раньше игнорировала). Отделить иконку часов от шторки на Wear OS 3+ нельзя без companion-приложения на часах.
- Проверка на конкретной модели часов в этой задаче не выполнялась.

## Тестирование

- `./gradlew :app:compileDebugKotlin` — успешно
- На устройстве: пересобрать → reminder/alarm → на **Wear OS** (Pixel Watch / Galaxy Watch 4+) круглое лого Lichka; в статусбаре телефона перо; в шторке справа — round launcher
- Huawei GT: ожидание без изменений (generic)
