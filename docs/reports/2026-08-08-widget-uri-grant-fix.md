---
bug: widget-failed-to-load
status: fixed
branch: main
---

# Виджет «Не удалось загрузить виджет» — фикс URI-grant и кэша лаунчера

**Дата:** 2026-08-08
**Задача:** исправить «Не удалось загрузить виджет» на Xiaomi API 37 после предыдущих правок

## Что сделано

### 1. Исправлен баг с выдачей URI-грантов (корень проблемы)

**Причина:** `grantUriPermission` вызывался на **базовый** URI (без query-параметров), а лаунчер через `setImageViewUri` получал **display URI** с query `?v=…`. Система Android считает это разными URI — грант не срабатывал.

```
grantUriPermission(ctx, baseUri, flags)  // content://.../plate_83.png
setImageViewUri(displayUri)              // content://.../plate_83.png?v=ff000000_...
```

Лаунчер получал `SecurityException` → `AppWidgetHostView.getErrorView()` → «Не удалось загрузить виджет».

**Исправлено в `ScheduledWidgetProvider.kt`:**
- `grantUriToHomeLaunchers` теперь получает `displayUri` (с query), а не `grantUri`
- Добавлен `FLAG_GRANT_PREFIX_URI_PERMISSION` для покрытия URI с любыми query-параметрами
- Упрощён `PlateUris` — теперь содержит только один URI

### 2. Масштабирование bitmap в fallback-пути

Добавлен `safeBinderBitmap()`: если размер bitmap > 480px по любой стороне — сжимает до безопасного для Binder (под 1 МБ). Предотвращает `TransactionTooLargeException` при неудаче URI-пути.

### 3. Замена кастомных шрифтов на системные

В `widget_scheduled.xml` и `widget_scheduled_row.xml`:
- `@font/press_start_2p_regular` → `sans-serif-medium`
- `@font/jetbrains_mono_regular` → `sans-serif`

Шрифты в RemoteViews могут не загружаться в процессе лаунчера (особенно на targetSdk 36+).

### 4. Защита `onUpdate`

`onUpdate` обёрнут в try/catch — предотвращает падение виджета при неожиданных исключениях.

### 5. Логирование

Добавлены `Log.d`/`Log.w` с тегом `ScheduledWidget` для отслеживания количества грантов, размеров виджета и факта отката на bitmap.

### 6. Побочная находка: кэш лаунчера

После переустановки APK (uninstall release → install debug) лаунчер MIUI кэширует старый путь к APK и не может загрузить ресурсы. `ResourcesManager: failed to load asset path /data/app/~~OLD_HASH==/com.lichka-.../base.apk`. Лечится `adb shell am force-stop com.miui.home`.

## Изменённые файлы

| Файл | Что изменено |
|------|-------------|
| `android/app/src/main/java/com/lichka/ScheduledWidgetProvider.kt` | Грант на displayUri, FLAG_GRANT_PREFIX, safeBinderBitmap, Log, try/catch onUpdate |
| `android/app/src/main/res/layout/widget_scheduled.xml` | Шрифты: sans-serif вместо press_start_2p / jetbrains_mono |
| `android/app/src/main/res/layout/widget_scheduled_row.xml` | Шрифты: sans-serif вместо jetbrains_mono |

## Принятые решения

- URI-путь с query-параметрами сохранён (cache-bust нужен для перерисовки при смене темы). Грант теперь выдаётся на URI с query.
- `FLAG_GRANT_PREFIX_URI_PERMISSION` — дополнительная страховка, покрывает любые query-вариации.
- Bitmap fallback теперь безопасен по размеру (≤ 480px), но URI-путь остаётся приоритетным.
- Системные шрифты (`sans-serif`) вместо кастомных — убирает риск сбоя загрузки шрифтов в процессе лаунчера.

## Известные ограничения

- Лаунчеры могут кэшировать путь к APK при переустановке — решается перезапуском лаунчера. При обычном обновлении через Google Play это не проблема (APK обновляется in-place).
- На устройствах с нестандартными лаунчерами, которые не отвечают на `ACTION_MAIN`/`CATEGORY_HOME`, URI-путь не сработает — отработает bitmap fallback.

## Тестирование

- Проверено на Xiaomi 2506BPN68G, API 37 (Android 15)
- `adb logcat` до фикса: `SecurityException → getErrorView → widget load error`
- `adb logcat` после фикса: `URI grants=2, size=498x551` — без ошибок, виджет отображается
- Лаунчер перезапущен для сброса кэша APK-пути
