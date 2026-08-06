# [UI] Неполная перерисовка виджета при смене темы с Light на Dark

**Дата:** 2026-08-06  
**Статус:** fixed  
**Затрагивает:** Android home-screen widget «Запланировано», `ThemeModule`, `ScheduledWidgetProvider`  
**Связано:** [`widget-theme-not-refreshing-on-switch.md`](widget-theme-not-refreshing-on-switch.md) (2026-08-01, marked fixed) — residual intermittent

## Описание

После переключения темы (например Light → Dark) виджет на лаунчере иногда перекрашивается полностью, а иногда — только частично: текст становится новым, остальные элементы остаются от прошлой темы. От конкретных цветов темы не зависит.

## Шаги воспроизведения

1. Открыть виджет, находясь в светлой теме (Light).
2. Переключить тему на темную (Dark).
3. Свернуть приложение (Home) и посмотреть на виджет.
4. Повторить переключения Light ↔ Dark несколько раз.

## Фактический результат

Цвет текста меняется на белый. Остальные элементы (фон виджета, box-shadow, заголовок и иконка) остаются светлыми и не перерисовываются.

Иногда всё меняется как надо — баг **непостоянный**.

## Ожидаемый результат

Все элементы виджета (фон, тени, заголовок, иконки и текст) полностью и корректно перерисовываются в соответствии со стилями Dark-темы (и любой другой).

## Окружение / Доп. информация

- Android home-screen widget «Запланировано»
- Предыдущие фиксы (prefs `commit`, отказ от ImageView tint в пользу `setImageViewBitmap`, AppState re-push) не устранили intermittent-кейс

## Причина

Пластина передавалась в `RemoteViews` через `setImageViewBitmap` → bitmap сериализуется в Binder IPC (~1MB shared buffer). При перегруженном буфере или двойном `refreshAll` (setTheme + AppState background) update хоста падает/частично применяется: `setTextColor` списка проходит, ImageView-пластина и host title — нет.

## Решение

- Пластина пишется в PNG (`cacheDir/widget_plates/`) и отдаётся через `FileProvider` + `setImageViewUri` с cache-bust query (`?v=…`).
- `refreshAll` coalescing на main handler — один in-flight + один pending вместо конкурирующих binder-транзакций.
- `RemoteViewsFactory` получает intent с theme extras (fallback ink + reconnect URI).

См. отчёт: `docs/reports/2026-08-06-widget-theme-partial-redraw-fix.md`.
