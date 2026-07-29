# Android Adaptive Scheduled Widget

**Дата:** 2026-07-29  
**Промпт/задача:** Реализовать адаптивный Android home screen виджет: показывать запланированные сообщения по размеру; тап открывает экран «Запланировано». Proposal: `docs/features/android-scheduled-widget-proposal.md`.

## Что сделано

- Proposal фичи (`approved`): адаптивный App Widget только для Android, контент = reminder/alarm/periodic как на табе «Запланировано».
- Native виджет `ScheduledWidgetProvider` (RemoteViews): small → 1 строка, medium → ~4, large → до 10 + empty state.
- Snapshot в SharedPreferences (`ScheduledWidgetStorage`) + RN bridge `WidgetModule.updateScheduledWidgetSnapshot`.
- JS-слой `features/scheduled-widget`: сбор snapshot из `getScheduledMessages` + sync при schedule/cancel/load и на старте приложения.
- Deep link: Intent `openTarget=scheduled` (+ опциональный `messageId`) → `openScheduledTab` / `navigateToScheduled` (не ChatRoom).
- Unit-тесты snapshot и навигации с виджета; полный `npm test` — 372 passed.

## Изменённые файлы

### Документация
- `docs/features/android-scheduled-widget-proposal.md` — proposal (approved)

### Native Android
- `android/.../ScheduledWidgetProvider.kt` — AppWidgetProvider, адаптив по размеру
- `android/.../ScheduledWidgetStorage.kt` — JSON snapshot в SharedPreferences
- `android/.../WidgetModule.kt`, `WidgetPackage.kt` — RN bridge + emit `onWidgetOpen`
- `android/.../MainActivity.kt`, `MainApplication.kt`, `AndroidManifest.xml` — регистрация, capture intent
- `res/layout/widget_scheduled.xml`, `res/xml/widget_scheduled_info.xml`, drawables/colors/strings

### JS / FSD
- `src/shared/lib/scheduledWidget.ts` — bridge API
- `src/features/scheduled-widget/` — sync + `useWidgetNavigation`
- `src/app/mainTabsApi.ts` — `openScheduledTab(messageId?)`
- `src/app/AppNavigator.tsx` — hook + sync на старте
- `src/features/notifications/schedulingService.ts` — sync после schedule/cancel
- `src/pages/scheduled/ScheduledScreen.tsx`, `src/pages/chat-room/ChatRoomScreen.tsx` — sync при refresh

### Тесты
- `src/features/scheduled-widget/__tests__/syncScheduledWidget.test.ts`
- `src/features/scheduled-widget/__tests__/useWidgetNavigation.test.ts`
- `src/app/__tests__/mainTabsApi.test.ts` — кейсы `openScheduledTab`

## Принятые решения

- RemoteViews вместо Glance/Compose — без Compose в проекте.
- Snapshot из JS, не чтение SQLite из виджета — RN владеет БД.
- Тап всегда на экран «Запланировано», не в ChatRoom.
- Тема виджета: фиксированный light `#FAFAFA` / ink (не 11 пресетов).

## Известные ограничения

- Только Android (нет iOS WidgetKit).
- Основной refresh от JS; `updatePeriodMillis` ~30 мин — safety net ОС.
- Snapshot может устареть, если процесс убит до sync после мутации.
- Создание reminder из виджета — вне scope.

## Тестирование

- Unit: пустой snapshot, маппинг полей, лимит 10, missing chat → «—».
- Unit: `handleWidgetOpen` / `openScheduledTab` — таб без фокуса и с `messageId`; unknown target игнорируется; pending до готовности API.
- `npm test` — 372 passed.
- На устройстве: пересобрать Android → добавить виджет → создать напоминание → проверить список и тап на «Запланировано».
