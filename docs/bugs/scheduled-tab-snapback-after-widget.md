# Нельзя уйти с «Запланировано» после открытия с виджета

**Дата обнаружения:** 2026-08-24
**Повторно:** 2026-08-25 (остаток после фикса `setMainTabsApi`)
**Платформа:** Android
**Статус:** fixed
**Затрагивает:** корневые табы (`SwipeablePager`), deep link виджета «Запланировано»
**Связано:**
- [`../features/android-scheduled-widget-proposal.md`](../features/android-scheduled-widget-proposal.md) — тап по виджету открывает таб Запланировано

## Симптом

После тапа по виджету открывается экран **Запланировано**. Свайп или тап по иконке Чаты / Настройки запускает анимацию перехода, затем пейджер пружинит обратно на Запланировано.

Воспроизводится не всегда (плавающий). Чаще сразу после открытия, пока список ещё скроллится/подсвечивает строку.

## Шаги воспроизведения

1. Оставить приложение в фоне (процесс может быть убит) или оставить тёплым.
2. На домашнем экране тапнуть по строке виджета «Запланировано» (не по заголовку).
3. Открывается таб Запланировано.
4. Сразу свайпнуть к Чатам / Настройкам или нажать иконку в таббаре.

**Ожидание:** переход на выбранный таб.

**Факт:** соседний экран начинает показываться и откатывается на Запланировано.

## Закрытый слой (2026-08-24)

Два дефекта в JS-навигации табов складывались в ловушку — **исправлены**, но симптом остался за счёт путей ниже.

1. **`pendingScheduledFocus` жил слишком долго.** `navigateToScheduled` сохранял payload и не очищал его в `flushPending`. Любой `setMainTabsApi(...)` снова вызывал `switchToTab(SCHEDULED_TAB_INDEX)`.

2. **API табов перерегистрировался на каждый свайп.** `handleIndexChange` зависел от `activeIndex` → effect `setMainTabsApi(null)` → `setMainTabsApi(newApi)` → `flushPending()` → возврат на индекс 1.

Фикс:

- `flushPending`: `switchToTab(1)` только по одноразовому флагу `pendingOpenScheduledTab`; focus-payload больше не форсит таб.
- `handleIndexChange` стабилен через `activeIndexRef`.
- `ScheduledScreen` вызывает `consumeScheduledFocus()`, даже если `messageId` нет в уже загруженном списке.

Этот слой **не** закрывает повторный `openScheduledTab` с intent и срыв pan-жеста.

## Почему плавает сейчас

Табы: Чаты=0, Запланировано=1, Настройки=2. Пейджер контролируемый: визуал в `indexSV`, React-индекс в `activeIndex`. Откат = жест не закоммитился (пружина к старому индексу) **или** JS снова делает `switchToTab(1)`.

Ловушка чаще после тапа по **строке** (`messageId` → scroll/highlight). Тап по заголовку / empty без id не запускает focus-скролл (путь 1), но warm-start extras (путь 2) всё равно могут сработать.

### Путь 1 — жест пейджера vs подсветка строки

После виджета `ScheduledScreen` уникально:

- `scrollToIndex({ animated: true })` через 200 ms после появления списка
- highlight + `FadeInUp` / `Layout` на строке

`SwipeablePager`:

- `failOffsetY(28)` — вертикальный сдвиг списка **фейлит** уже активный горизонтальный pan
- был только `onEnd`, без `onFinalize`
- `activeIndex` обновляется после конца жеста, поэтому таймер скролла не отменялся, пока палец ещё ведёт: индекс всё ещё 1

Соседний экран уже виден, жест срывается, пейджер пружинит к `startIndex` = Запланировано.

### Путь 2 — повторный `openScheduledTab` с неснятого intent

Warm-start: `MainActivity.onNewIntent` → `emitWidgetOpen` → JS `onWidgetOpen`.

`consumeInitialWidgetOpen()` вызывался только в `Promise.all(getInitial*)`, не на событии. `emitWidgetOpen` чистил `pendingOpen*`, но extras на `Activity.intent` оставались (`removeExtra` in-place на Android ненадёжен). Промис `getInitial*` не отменялся при unmount.

Поздний resolve / повторный mount хука снова читал `openTarget=scheduled` и вызывал `openScheduledTab` → `switchToTab(1)`, даже если пользователь уже ушёл. `launchMode=singleTask` держит тот же intent на activity.

## Исправление (2026-08-25)

- Widget open одноразовый: consume на `onWidgetOpen` и после emit; подмена `Activity.intent` без extras; флаг `openConsumed`, чтобы `getInitial*` не читал застрявшие extras; отмена in-flight промиса при unmount; `openOnce` в одном цикле эффекта.
- `SwipeablePager`: commit в `onFinalize` по сохранённому `gestureXSV` (не по обнулённому `event.translationX`). Если pan сорвали, но порог уже пройден — соседний таб, не `startIndex`.
- `ScheduledScreen`: `scrollToIndex({ animated: false })` только пока активен таб Запланировано; без 200 ms animated-скролла поверх жеста.

## Изменённые файлы

### 2026-08-24

- `src/app/mainTabsApi.ts` — one-shot switch vs focus-payload
- `src/app/AppNavigator.tsx` — стабильный `handleIndexChange`
- `src/pages/scheduled/ScheduledScreen.tsx` — consume при отсутствующей строке
- `src/app/__tests__/mainTabsApi.test.ts` — повторный `setMainTabsApi` не снэпит назад

### 2026-08-25

- `src/features/scheduled-widget/useWidgetNavigation.ts` — consume на событии, cancel промиса, openOnce
- `android/app/src/main/java/com/lichka/WidgetModule.kt` — `openConsumed` + подмена intent
- `src/app/SwipeablePager.tsx` — `onFinalize` + `resolvePagerSwipeTarget`
- `src/pages/scheduled/ScheduledScreen.tsx` — неанимированный скролл только на табе 1
- `src/features/scheduled-widget/__tests__/useWidgetNavigation.test.ts` — late getInitial / consume на событии
- `src/app/__tests__/SwipeablePager.swipe.test.ts` — порог свайпа при cancel
