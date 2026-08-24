# Нельзя уйти с «Запланировано» после открытия с виджета

**Дата обнаружения:** 2026-08-24
**Платформа:** Android
**Статус:** fixed
**Затрагивает:** корневые табы (`SwipeablePager`), deep link виджета «Запланировано»
**Связано:**
- [`../features/android-scheduled-widget-proposal.md`](../features/android-scheduled-widget-proposal.md) — тап по виджету открывает таб Запланировано

## Симптом

После долгого простоя телефона: тап по виджету → экран **Запланировано**. Свайп или тап по иконке Чаты / Настройки запускает анимацию перехода, затем пейджер пружинит обратно на Запланировано.

Воспроизводится не всегда (плавающий).

## Шаги воспроизведения

1. Оставить приложение в фоне надолго (процесс может быть убит).
2. На домашнем экране тапнуть по строке виджета «Запланировано» (не по заголовку).
3. Открывается таб Запланировано.
4. Свайпнуть к Чатам / Настройкам или нажать иконку в таббаре.

**Ожидание:** переход на выбранный таб.

**Факт:** анимация ухода начинается и сразу возвращает на Запланировано. Повторные попытки дают тот же snap-back.

## Почему плавает

Ловушка срабатывает только если после открытия остаётся `pendingScheduledFocus` (тап по **строке** виджета с `messageId`). Тап по заголовку / empty state вызывает `openScheduledTab()` без id — бага нет.

Pending не снимается, пока `ScheduledScreen` не найдёт строку в списке:

- пользователь сразу свайпает, список ещё не загрузился (cold start после долгого фона);
- строка виджета устарела (снимок не обновлялся ~30 мин) — id уже нет в SQLite, `consumeScheduledFocus()` **никогда** не вызывается.

Если подождать подсветку найденной строки — consume проходит, уйти с таба можно. Отсюда «то есть, то нет».

Тот же путь есть у Future peek в чате (`navigateToScheduled`), не только у виджета.

## Корневая причина

Два дефекта складываются.

1. **`pendingScheduledFocus` живёт слишком долго.** `navigateToScheduled` сохраняет payload и не очищает его в `flushPending` (в отличие от `pendingChat` / `pendingOpenScheduledTab`). Любой `setMainTabsApi(...)` снова вызывает `switchToTab(SCHEDULED_TAB_INDEX)`.

2. **API табов перерегистрируется на каждый свайп.** `handleIndexChange` зависел от `activeIndex`. Смена таба пересоздаёт колбэк → effect делает `setMainTabsApi(null)` → `setMainTabsApi(newApi)` → `flushPending()` → принудительный возврат на индекс 1. Визуально: анимация ухода, затем snap-back.

## Исправление

- `flushPending`: `switchToTab(1)` только по одноразовому флагу `pendingOpenScheduledTab`; focus-payload больше не форсит таб.
- `navigateToScheduled`: если API ещё не готов — ставить `pendingOpenScheduledTab`, а не полагаться на повторный switch из focus-payload.
- `handleIndexChange` стабилен через `activeIndexRef` — `setMainTabsApi` регистрируется один раз на mount.
- `ScheduledScreen` вызывает `consumeScheduledFocus()`, даже если `messageId` нет в уже загруженном списке (устаревшая строка виджета).

## Изменённые файлы

- `src/app/mainTabsApi.ts` — one-shot switch vs focus-payload
- `src/app/AppNavigator.tsx` — стабильный `handleIndexChange`
- `src/pages/scheduled/ScheduledScreen.tsx` — consume при отсутствующей строке
- `src/app/__tests__/mainTabsApi.test.ts` — повторный `setMainTabsApi` не снэпит назад
