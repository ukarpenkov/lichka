# Виджет «Запланировано»: «Не удалось загрузить виджет»

**Дата:** 2026-08-08  
**Статус:** fixed  
**Затрагивает:** Android home-screen widget «Запланировано», `ScheduledWidgetProvider`, `FileProvider`  
**Связано:**
- [`widget-theme-not-refreshing-on-switch.md`](widget-theme-not-refreshing-on-switch.md) — тема не обновлялась (Canvas plate, без ImageView tint)
- [`widget-theme-partial-redraw-intermittent.md`](widget-theme-partial-redraw-intermittent.md) — intermittent partial redraw → PNG + `FileProvider` + `setImageViewUri` + coalesce `refreshAll`

## Описание

При добавлении / показе виджета «Запланировано» на домашнем экране система показывает ошибку **«Не удалось загрузить виджет»** вместо RemoteViews.

## Шаги воспроизведения

1. Установить сборку с FileProvider-пластиной (после фикса 2026-08-06).
2. Долгое нажатие на home → виджеты → «Запланировано».
3. Добавить виджет на экран (или обновить уже стоящий после переустановки APK).

## Ожидаемый результат

Виджет рисуется: neo-brutal пластина, заголовок, список / empty state в цветах текущей темы.

## Фактический результат

Плейсхолдер лаунчера с текстом «Не удалось загрузить виджет» (системный `AppWidgetHostView` error state).

## Причина

Регрессия после перехода пластины на `setImageViewUri` + `FileProvider` (`f9f3d46`):

1. Host (launcher) открывает `content://…fileprovider/…` при inflate RemoteViews.
2. Provider `exported=false` → нужен явный `grantUriPermission` пакету лаунчера.
3. При `targetSdkVersion = 36` без `<queries>` для `CATEGORY_HOME` `queryIntentActivities` часто **пустой** → grants никому не выдаются.
4. Host ловит `SecurityException` / `RemoteViews$ActionException` → весь виджет падает в error view.

Предыдущие фиксы темы (bitmap-пластина без sticky tint, размер из `MIN_*`/`SIZES`, prefs `commit`, theme extras, coalesce refresh) нужно **сохранить**; чинить только выдачу URI и безопасный fallback.

## Решение

- Добавить `<queries>` для home-launcher intent (package visibility на targetSdk 36).
- Надёжнее грантить URI: default HOME + все HOME из query; OEM/SystemUI — только дополнительно и **не** как основание для `setImageViewUri`.
- Если HOME grants = 0 — fallback на `setImageViewBitmap` (coalesce refresh уже есть; без sticky tint).
- `updateWidget` в try/catch с forced bitmap fallback при исключениях в нашем процессе.

## Что сохранено из прошлых фиксов

- Canvas neo-brutal plate (цвета в пикселях, без ImageView tint)
- Размер из `OPTION_APPWIDGET_SIZES` / `MIN_*`
- PNG + FileProvider + cache-bust `?v=` (когда grants есть)
- Coalesce `refreshAll`
- Theme extras в RemoteViewsFactory / prefs `commit`
