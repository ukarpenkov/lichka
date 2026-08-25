# Оставшийся snap-back табов после виджета «Запланировано»

**Дата:** 2026-08-25
**Промпт/задача:** После перехода на «Запланировано» из виджета свайп на Чаты/Настройки иногда показывает соседний экран и откатывается обратно. Описать баг в `docs/bugs` и исправить, если причина ясна.

## Что сделано

- Симптом совпал с уже закрытым 2026-08-24 слоем (`pendingScheduledFocus` + перерегистрация `setMainTabsApi`). Тот фикс в дереве, но откат оставался по двум другим гонкам.
- Обновлён документ бага: вчерашний слой оставлен как закрытый, добавлены путь «жест vs focus-скролл» и путь «повторный `openScheduledTab` с intent».
- Widget-open сделан одноразовым: consume extras на событии и после native emit, подмена `Activity.intent`, флаг `openConsumed`, отмена in-flight `getInitial*` при unmount, `openOnce` в одном цикле эффекта.
- Commit свайпа пейджера перенесён в `onFinalize` по сохранённому `gestureXSV` — сорванный pan с уже пройденным порогом коммитит соседний таб, а не `startIndex`.
- Focus-скролл на «Запланировано»: без 200 ms `animated: true`; `scrollToIndex({ animated: false })` только пока активен таб 1; retry `onScrollToIndexFailed` отменяется при уходе с таба.

## Изменённые файлы

- `docs/bugs/scheduled-tab-snapback-after-widget.md` — reopen остатка, пути 1–2, фикс 2026-08-25
- `src/features/scheduled-widget/useWidgetNavigation.ts` — `cancelled` / `handled` / consume на `onWidgetOpen`
- `android/app/src/main/java/com/lichka/WidgetModule.kt` — `openConsumed`, подмена intent на UI-потоке, consume после emit
- `src/app/SwipeablePager.tsx` — `resolvePagerSwipeTarget`, commit в `onFinalize`
- `src/pages/scheduled/ScheduledScreen.tsx` — неанимированный скролл только на табе Запланировано
- `src/features/scheduled-widget/__tests__/useWidgetNavigation.test.ts` — unmount до resolve, consume на событии, late `getInitial` не делает второй switch
- `src/app/__tests__/SwipeablePager.swipe.test.ts` — порог свайпа при cancel (большой translation, velocity 0)

## Принятые решения

- **Не откатывать вчерашний фикс `mainTabsApi`.** Он закрывает перерегистрацию API; повторный snap шёл из intent и из срыва pan.
- **Подменять intent целиком.** `removeExtra` in-place на Android ненадёжен; `openConsumed` страхует `getInitial*`, пока `setIntent` ещё не прошёл.
- **`onFinalize` вместо `onEnd`.** `onEnd` не вызывается, если pan отменил вертикальный скролл списка (`failOffsetY`). Target берётся из `gestureXSV`, не из обнулённого `event.translationX`.
- **Скролл без анимации и только на табе 1.** Подсветку можно применить сразу; сам `scrollToIndex` откладывается, если `activeIndex` ещё не 1 (чтобы не потерять скролл до `switchToTab`), и не стреляет поверх жеста ухода.

## Известные ограничения

- Native-часть (`WidgetModule.kt`) требует rebuild Android-приложения; один JS-бандл extras на activity не снимет.
- Пейджер в Jest без настоящего Gesture Handler: логика порога покрыта unit-тестом `resolvePagerSwipeTarget`, сам `onFinalize` — ручной проверкой на устройстве.
- Мгновенный `scrollToIndex` теоретически всё ещё может задеть pan, если пользователь ведёт палец в тот же кадр, когда индекс таба ещё 1. Тогда должен сработать `onFinalize` с большим `gestureXSV`.
- Future peek → `navigateToScheduled` идёт тем же focus-скроллом; выигрывает от неанимированного скролла и `onFinalize`.

## Тестирование

```bash
npm test -- --testPathPattern='useWidgetNavigation|SwipeablePager.swipe|mainTabsApi' --no-coverage
```

Результат: **25 тестов, все прошли.**

Покрытые сценарии:

- unmount хука до resolve `getInitial*` не вызывает `openScheduledTab` / consume
- `onWidgetOpen` вызывает consume и переключает таб
- late `getInitial` после уже обработанного события не делает второй `switchToTab`
- большой cancelled pan с velocity 0 коммитит соседний таб, короткий медленный — `startIndex`
- существующие тесты: повторный `setMainTabsApi` не снэпит назад (слой 2026-08-24)

Ручная проверка на устройстве в отчёт не входила: тап по строке виджета (cold + warm) → сразу свайп на Чаты/Настройки и тап по иконкам таббара.
