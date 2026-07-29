# Android Scheduled Widget — neo-brutal края, тема, скролл, шрифты

**Дата:** 2026-07-29  
**Промпт/задача:** Привести home screen виджет «Запланировано» к pixel/neo-brutal языку (края), цветам темы приложения, прокрутке списка при малой высоте, типографике приложения и скрытому scrollbar.

## Что сделано

- Края виджета в neo-brutal / pixel стиле: hard offset-тень 4dp + обводка 2dp solid ink, радиус **16dp** (больше, чем у AlertDialog `radii.sm` = 8).
- Цвета виджета берутся из темы приложения (`ThemeModule`: `background` / `text`) — пластина, тексты, иконки; при смене темы виджет обновляется.
- Список внутри виджета стал прокручиваемым (`ListView` + `RemoteViewsService`): при низкой высоте и большом числе пунктов можно листать прямо в виджете.
- Scrollbar при листании **скрыт** (`android:scrollbars="none"`).
- Лимит snapshot увеличен с 10 до **25**.
- При старте без сохранённой темы в native пушится light-дефолт, чтобы виджет совпадал с приложением.
- Типографика виджета: заголовок «Запланировано» — **Press Start 2P** (pixel, 10sp); empty / строки списка — **JetBrains Mono** (как body в приложении).

## Изменённые файлы

### Native Android
- `android/app/src/main/res/font/press_start_2p_regular.ttf` — pixel display для заголовка виджета
- `android/app/src/main/res/font/jetbrains_mono_regular.ttf` — mono для body/meta/empty
- `android/app/src/main/res/drawable/bg_widget_scheduled.xml` — layer-list: hard shadow + face с border (fallback до runtime bitmap)
- `android/app/src/main/res/layout/widget_scheduled.xml` — FrameLayout + plate + `ListView`; fontFamily; `scrollbars="none"`
- `android/app/src/main/res/layout/widget_scheduled_row.xml` — layout строки списка + JetBrains Mono
- `android/app/src/main/java/com/lichka/ScheduledWidgetProvider.kt` — тема → plate/тексты; remote adapter; scroll notify
- `android/app/src/main/java/com/lichka/ScheduledWidgetService.kt` — `RemoteViewsService` + Factory
- `android/app/src/main/java/com/lichka/ThemeModule.kt` — `setTheme` вызывает `ScheduledWidgetProvider.refreshAll`
- `android/app/src/main/AndroidManifest.xml` — регистрация `ScheduledWidgetService` (`BIND_REMOTEVIEWS`)

### JS
- `src/shared/config/ThemeProvider.tsx` — всегда синхронизирует тему в `ThemeModule` при старте (в т.ч. DEFAULT_LIGHT)
- `src/features/scheduled-widget/syncScheduledWidget.ts` — `SCHEDULED_WIDGET_SNAPSHOT_LIMIT = 25`
- `src/features/scheduled-widget/__tests__/syncScheduledWidget.test.ts` — тест лимита под 25

## Принятые решения

- Hard shadow на Android через bitmap-пластину (RemoteViews не умеет динамический layer-list с цветами темы); XML layer-list остаётся fallback до первого update.
- Скролл — классический collection widget (`ListView` + `RemoteViewsFactory`), не Glance/Compose.
- Item click: `setPendingIntentTemplate` + `FLAG_MUTABLE` + `setOnClickFillInIntent` с `messageId`.
- Размерный лимит строк (small/medium/large) снят: все пункты snapshot доступны скроллом.
- Радиус пластины 16dp сознательно больше AlertDialog (8), чтобы виджет читался мягче на лаунчере.
- Заголовок pixel при **10sp** (не 14): Press Start 2P широкий, иначе «Запланировано» не влезает в узкий виджет; bold убран (у pixel нет weight).
- Шрифты продублированы в `res/font/` (RemoteViews не берёт Typeface из assets через setTypeface).
- Scrollbar скрыт: жест листания остаётся, визуальный шум на лаунчере убран.

## Известные ограничения

- Только Android (нет iOS WidgetKit).
- Некоторые OEM-лаунчеры режут/скругляют виджеты поверх нашей пластины.
- Скролл ListView в виджете зависит от лаунчера; на части устройств жест может конкурировать с жестами рабочего стола.
- Snapshot по-прежнему из JS SharedPreferences; при kill процесса до sync данные могут устареть.
- Максимум 25 пунктов в виджете (остальные — только в приложении).
- `res/font/` дублирует ttf из assets (чуть больше APK); иначе кастомный шрифт в App Widget недоступен.

## Тестирование

- Unit: `npm test -- --testPathPattern=scheduled-widget` — 9 passed.
- На устройстве (ручная проверка):
  - [ ] Пересобрать Android, добавить/обновить виджет
  - [ ] Смена темы в настройках → виджет перекрашивается (фон, текст, иконки, тень)
  - [ ] Neo-brutal края видны (обводка + offset-тень, радиус ~16)
  - [ ] Много запланированных + низкий виджет → вертикальный скролл списка
  - [ ] При скролле scrollbar не виден
  - [ ] Тап по строке → «Запланировано» с highlight; тап по заголовку/пустому → таб без highlight
  - [ ] Заголовок — Press Start 2P; строки и empty — JetBrains Mono
