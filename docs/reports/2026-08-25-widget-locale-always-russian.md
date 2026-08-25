# Виджет «Запланировано» не переводится (empty-state всегда русский)

**Дата:** 2026-08-25
**Промпт/задача:** Проверить, почему виджет всегда на русском, в частности надпись «Нет запланированных». Затем описать баг в `docs/bugs` и написать отчёт.

## Что сделано

- Подтверждено: экран «Запланировано» переводится через `t.noScheduled`; Android-виджет брал hardcoded русский из `res/values/strings.xml`.
- Заведён баг [`docs/bugs/widget-locale-always-russian.md`](../bugs/widget-locale-always-russian.md).
- Добавлен мост локали по образцу темы: JS → `WidgetModule.setWidgetLocaleStrings` → SharedPreferences → `refreshAll`.
- Empty-state и fallback пустого тела строки читаются из сохранённой copy; до первого запуска приложения остаётся `strings.xml`.

## Изменённые файлы

- `docs/bugs/widget-locale-always-russian.md` — баг (fixed)
- `android/app/src/main/java/com/lichka/WidgetModule.kt` — `setWidgetLocaleStrings`
- `android/app/src/main/java/com/lichka/ScheduledWidgetStorage.kt` — persist / read empty и untitled
- `android/app/src/main/java/com/lichka/ScheduledWidgetProvider.kt` — empty-state из storage
- `android/app/src/main/java/com/lichka/ScheduledWidgetService.kt` — untitled из storage
- `src/shared/lib/scheduledWidget.ts` — `updateScheduledWidgetLocale`
- `src/shared/lib/index.ts` — реэкспорт
- `src/shared/config/LocaleProvider.tsx` — push при старте, `setLocale`, AppState background
- `src/shared/config/locale/types.ts` — ключ `scheduledUntitled`
- `src/shared/config/locale/ru.ts`, `en.ts`, `es.ts`, `de.ts`, `fr.ts`, `pt.ts` — строки empty/untitled
- `src/shared/config/__tests__/locale.test.ts` — ключ в required list
- `src/shared/config/__tests__/LocaleProvider.test.tsx` — push на mount / смену языка / background
- `src/shared/lib/__tests__/scheduledWidget.test.ts` — Android / iOS / missing module

## Принятые решения

- Не заводить `values-en/` и т.п.: виджет должен следовать in-app локали, а не языку системы.
- Те же точки push, что у темы: mount, смена настройки, `background` / `inactive`.
- `commit()` в storage, чтобы `refreshAll` сразу читал новые строки.
- `strings.xml` оставлен fallback до первого запуска приложения (как дефолтные цвета темы).

## Известные ограничения

- Нужен native rebuild / установка APK.
- Имя и описание виджета в пикере лаунчера (`widget_scheduled_title`, `widget_scheduled_description`) по-прежнему из `strings.xml` (русский) — это UI системы, не empty-state.
- Дата/время в строках виджета по-прежнему `SimpleDateFormat("dd.MM HH:mm", Locale.getDefault())`, не in-app локаль.

## Тестирование

- Jest: `locale.test.ts`, `LocaleProvider.test.tsx`, `scheduledWidget.test.ts` — 28 passed.
- [ ] Native rebuild Android, виджет «Запланировано» на home screen, пустой список
- [ ] Настройки → English: empty-state `No scheduled messages`
- [ ] Deutsch / Español / Français / Português — соответствующий `noScheduled`
- [ ] Русский снова: «Нет запланированных»
- [ ] Смена языка + Home: виджет обновляется без переустановки
