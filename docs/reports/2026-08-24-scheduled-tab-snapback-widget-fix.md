# Исправление snap-back с таба «Запланировано» после виджета

**Дата:** 2026-08-24
**Промпт/задача:** Разобрать плавающий баг: после открытия «Запланировано» с виджета нельзя уйти свайпом или по кнопке на Чаты/Настройки — анимация начинается и возвращает обратно. Описать баг и исправить.

## Что сделано

- Разобрана корневая причина плавающего snap-back: два дефекта в JS-навигации табов складывались в ловушку.
- Создан документ бага [`docs/bugs/scheduled-tab-snapback-after-widget.md`](../bugs/scheduled-tab-snapback-after-widget.md).
- Разделены одноразовое переключение таба и доставка focus-payload в `mainTabsApi`.
- Стабилизирован `handleIndexChange` в `AppNavigator` — API табов больше не перерегистрируется на каждый свайп.
- В `ScheduledScreen` добавлен `consumeScheduledFocus()` для устаревших строк виджета (id нет в списке).
- Добавлены unit-тесты на повторную регистрацию API и отложенное открытие таба.

## Изменённые файлы

- `docs/bugs/scheduled-tab-snapback-after-widget.md` — описание симптома, шагов, причины и фикса
- `src/app/mainTabsApi.ts` — `flushPending` переключает таб только по `pendingOpenScheduledTab`; `pendingScheduledFocus` отвечает только за подсветку строки; `navigateToScheduled` при неготовом API ставит `pendingOpenScheduledTab`
- `src/app/AppNavigator.tsx` — `activeIndexRef` для стабильного `handleIndexChange` без зависимости от `activeIndex`
- `src/pages/scheduled/ScheduledScreen.tsx` — consume pending focus, если строка не найдена в загруженном списке
- `src/app/__tests__/mainTabsApi.test.ts` — тесты: повторный `setMainTabsApi` не снэпит назад; отложенное открытие таба с focus

## Принятые решения

- **Не трогать native-слой виджета.** Intent и PendingIntent отрабатывают один раз; ловушка целиком на JS-стороне табов.
- **One-shot switch vs focus-payload.** Переключение на таб «Запланировано» — одноразовая операция (`pendingOpenScheduledTab`). Payload для scroll/highlight (`pendingScheduledFocus`) не должен повторно вызывать `switchToTab`, иначе любая перерегистрация API возвращает пользователя на таб.
- **Стабильный колбэк через ref.** Повторный тап по активному табу «Чаты» (pop to list) сохранён через `activeIndexRef`, без пересоздания `handleIndexChange` на каждую смену таба.
- **Consume при stale id.** Если список загрузился, но `messageId` из виджета уже отсутствует в SQLite — pending снимается явно, чтобы не зависать навсегда.

## Известные ограничения

- Если пользователь свайпает **до** загрузки списка, pending focus ещё жив до первого `loadEntries`. Snap-back после фикса не воспроизводится (API не перерегистрируется), но подсветка строки может примениться позже, когда список догрузится — это ожидаемое поведение.
- Тот же путь `navigateToScheduled` используется из Future peek в чате; фикс покрывает и этот сценарий.
- Ручная проверка на устройстве после долгого фона в отчёт не входила — покрытие unit-тестами API.

## Тестирование

```bash
npm test -- --testPathPattern='mainTabsApi|useWidgetNavigation|futurePeekAcceptance' --no-coverage
```

Результат: **31 тест, все прошли.**

Покрытые сценарии:

- `navigateToScheduled` переключает таб и уведомляет listener
- повторный `setMainTabsApi` после `navigateToScheduled` **не** вызывает `switchToTab` снова
- отложенное открытие таба при неготовом API + доставка focus; повторная регистрация API не снэпит назад
- `openScheduledTab()` без `messageId` не трогает listener
- виджет: `handleWidgetOpen('scheduled', messageId)` — таб + focus
- Future peek → Scheduled: `navigateToScheduled` с focus payload
