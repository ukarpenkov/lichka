# Неполная intermittent-перерисовка виджета при смене темы

**Дата:** 2026-08-06  
**Промпт/задача:** Завести баг, исправить неполную перерисовку Android-виджета «Запланировано» при смене Light→Dark (текст новый, фон/тень/заголовок/иконки старые; проявляется непостоянно). Учесть, что прошлые фиксы не помогли — другой подход. Коммит не нужен.

## Что сделано

- Заведён баг [`docs/bugs/widget-theme-partial-redraw-intermittent.md`](../bugs/widget-theme-partial-redraw-intermittent.md); в старом баг-доке отмечен residual.
- Пластина виджета больше не едет через Binder как `setImageViewBitmap`: PNG в `cacheDir/widget_plates/` + `FileProvider` + `setImageViewUri` с cache-bust `?v=…`.
- `refreshAll` coalescing: быстрые повторные вызовы (setTheme + AppState re-push) сжимаются в один/два последовательных refresh без параллельных binder-транзакций.
- `ScheduledWidgetRemoteViewsFactory` принимает intent и использует `EXTRA_THEME_INK` как fallback; prefs остаются source of truth в `getViewAt`.

## Изменённые файлы

- `docs/bugs/widget-theme-partial-redraw-intermittent.md` — новый баг-репорт (fixed)
- `docs/bugs/widget-theme-not-refreshing-on-switch.md` — ссылка на residual
- `android/app/src/main/java/com/lichka/ScheduledWidgetProvider.kt` — URI-пластина, coalesce refresh, grant URI лаунчерам
- `android/app/src/main/java/com/lichka/ScheduledWidgetService.kt` — intent → factory, fallback ink
- `android/app/src/main/AndroidManifest.xml` — `FileProvider`
- `android/app/src/main/res/xml/file_paths.xml` — `cache-path` для пластин
- `android/app/src/main/res/layout/widget_scheduled.xml` — комментарий про URI

## Принятые решения

- Не возвращаться к `setImageTintList` на shapes (sticky tint на лаунчерах уже подтверждён).
- Не масштабировать/резать binder-bitmap дальше — убрать большой bitmap из IPC целиком.
- Иконки строк (~18dp) оставлены как pre-colored `setImageViewBitmap`: размер мал для Binder; tint сбрасывается на API 31+.
- Grant URI только home-launcher пакетам (`CATEGORY_HOME`); grant на base URI без query, display URI с `?v=` для сброса кэша ImageView.

## Известные ограничения

- Нужен native rebuild / установка APK.
- Если лаунчер не в `CATEGORY_HOME` (кастомные оболочки), grant может не пройти — тогда сработает fallback на binder bitmap (как раньше).
- OEM могут кэшировать `content://` агрессивнее; cache-bust query снижает риск, но не гарантирует 100% на всех оболочках.

## Тестирование

- [ ] Native rebuild Android, виджет «Запланировано» на home screen
- [ ] Light → Dark → Light несколько раз подряд: каждый раз фон, hard-shadow, заголовок, empty, иконки и текст совпадают с темой
- [ ] Amber / другие пресеты — полная перекраска
- [ ] Пустой виджет (нет scheduled): title + empty в цветах темы
- [ ] Resize виджета: углы пластины не уезжают в эллипс
