# Android Adaptive Scheduled Widget

**Статус:** approved

## Описание проблемы

Пользователю нужен быстрый обзор ближайших напоминаний/будильников без открытия приложения. В ТЗ (#57, #69) home screen widgets — post-MVP; отдельного экрана «Напоминания» нет — это таб **Запланировано**.

## Предлагаемое решение

Android App Widget (RemoteViews), адаптивный по размеру:

| Размер | Контент |
|--------|---------|
| small | заголовок + 1 ближайший элемент |
| medium | до ~4 строк |
| large | до ~8–10 строк + empty state |

Контент = те же `reminder` / `alarm` / `periodic`, что на [`ScheduledScreen`](../../src/pages/scheduled/ScheduledScreen.tsx), по `scheduled_at ASC`.

**Тап:** всегда открывает экран **Запланировано** (не ChatRoom):
- по строке → `navigateToScheduled(messageId)` (scroll + highlight);
- по заголовку/пустому → `switchToTab(SCHEDULED_TAB_INDEX)`.

**Данные:** JS пишет JSON-snapshot в SharedPreferences (как `AlarmStorage`); виджет не читает SQLite.

## Влияние на архитектуру

| Слой | Изменения |
|------|-----------|
| Native `android/.../com/lichka/` | `ScheduledWidgetStorage`, `ScheduledWidgetProvider`, layouts, `WidgetModule` |
| `shared/lib` | bridge `updateScheduledWidgetSnapshot` |
| `features/scheduled-widget` | сбор snapshot + sync; обработка open intent |
| `app/mainTabsApi` | открытие таба Scheduled без/с messageId |
| `pages` / FSD `widgets` | без UI виджета |

## Альтернативы

| Вариант | Почему не выбран |
|---------|------------------|
| Glance / Compose | В проекте нет Compose; RemoteViews проще и в стиле текущего Kotlin |
| Чтение SQLite из виджета | RN владеет БД; риск блокировок/версий схемы |
| Тап → ChatRoom | Продуктово выбран экран Запланировано |

## Оценка сложности

Средняя: native widget + snapshot bridge + deep link + sync hooks. Риски: устаревший snapshot при kill без sync; OEM-ограничения на refresh.

## Ограничения

- Только Android (нет iOS WidgetKit).
- Тема виджета: light `#FAFAFA` / ink (не все 11 пресетов).
- `updatePeriodMillis` — safety net ОС (~30 мин); основной refresh от JS.
