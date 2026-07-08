# Свайп-переключение главных табов

**Дата:** 2026-07-08
**Промпт/задача:** Сделать возможность листать 3 основных экрана (список чатов, запланировано, настройки) горизонтальным свайпом с плавной анимацией на reanimated.

## Что сделано

- Создан кастомный pager `src/app/SwipeablePager.tsx` на `react-native-reanimated` + `react-native-gesture-handler`:
  - горизонтальный свайг с привязкой к ближайшему табу;
  - учёт скорости жеста для выбора направления;
  - пружинная анимация переключения через `SPRING_SNAP`;
  - кастомная нижняя панель `PagerTabBar` с анимированным нажатием.
- Заменён `createBottomTabNavigator` в `src/app/AppNavigator.tsx` на кастомный `MainTabs` с pager.
- Добавлен `src/app/MainTabsContext.tsx` и хуки `useTabVisible` / `useOnTabVisible` для сохранения поведения "обновлять данные при возврате на таб", потому что свайп не меняет фокус react-navigation.
- Добавлен `src/app/mainTabsApi.ts` — императивный API для программных переходов.
- Адаптирована навигация из уведомлений (`src/features/notifications/useNotificationNavigation.ts`) и из `ScheduledScreen` для открытия чата через `mainTabsApi`.
- Обновлены экраны:
  - `ChatListScreen` — обновление списка при возврате на таб чатов;
  - `ScheduledScreen` — полная замена `useFocusEffect` на `useTabVisible` с таймером обновления;
  - `SettingsScreen` — обновление настроек при возврате на таб.

## Изменённые файлы

- `src/app/AppNavigator.tsx` — замена bottom-tabs на pager.
- `src/app/SwipeablePager.tsx` — новый компонент пейджера и нижней панели.
- `src/app/MainTabsContext.tsx` — новый контекст видимости таба.
- `src/app/mainTabsApi.ts` — новый imperative API.
- `src/features/notifications/useNotificationNavigation.ts` — использование `mainTabsApi`.
- `src/features/notifications/index.ts` — убран устаревший re-export `setNavigationReady`.
- `src/features/index.ts` — убран устаревший re-export `setNavigationReady`.
- `src/pages/chat-list/ChatListScreen.tsx` — регистрация навигации стека чатов, обновление по видимости таба.
- `src/pages/scheduled/ScheduledScreen.tsx` — переход к чату через `mainTabsApi`, видимость вместо фокуса.
- `src/pages/settings/SettingsScreen.tsx` — обновление по видимости таба.
- `docs/features/swipeable-tabs-proposal.md` — описание фичи.

## Принятые решения

- Свайп включён всегда (в том числе на вложенных экранах). Это создаёт единообразное поведение "листания" и упрощает код. Если внутри ChatRoom/ThemePicker горизонтальный свайп будет конфликтовать, можно позже добавить отключение через отслеживание текущего маршрута стека.
- Для cross-tab открытия чата используется ссылка на навигацию `ChatStack`, устанавливаемая из `ChatListScreen`. Это обходное решение, потому что `createNativeStackNavigator` не принимает `ref` в React Navigation v7.
- Данные обновляются не по фокусу, а по видимости таба, чтобы корректно работать при свайп-переключении.

## Известные ограничения

- Свайп может конфликтовать с горизонтальными жестами внутри `ChatRoom` (shared element, выбор изображения и т.д.). Жест настроен с `activeOffsetX` и `failOffsetY`, чтобы минимизировать ложные срабатывания.
- Вложенные стеки не получают `blur`/`focus` от таб-переключения, поэтому `useFocusEffect` заменён на `useTabVisible` там, где это важно.

## Тестирование

- `npx tsc --noEmit` — ошибок, вызванных изменениями, нет. Остались только предсуществующие ошибки в других файлах.
- `npx jest --no-coverage` — 182 теста проходят.
- Проверена структура FSD: новые файлы находятся в слое `app`, изменения в `pages` и `features` минимальны и направлены на адаптацию.
