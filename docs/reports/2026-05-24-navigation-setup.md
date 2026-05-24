# Настройка навигации (3 таба + stack внутри «Чаты»)

**Дата:** 2026-05-24
**Промпт/задача:** Реализация задачи 4.1 — настройка React Navigation с BottomTabNavigator (3 таба) и NativeStackNavigator внутри таба «Чаты»

## Что сделано

- Создан `AppNavigator.tsx` с `BottomTabNavigator` (3 таба: Чаты, Запланировано, Настройки)
- Внутри таба «Чаты» — `NativeStackNavigator` с экранами `ChatList` и `ChatRoom`
- Иконки табов реализованы через SVG (`react-native-svg`): чат, календарь, шестерёнка
- Лейблы табов скрыты (`tabBarShowLabel: false`), только иконки
- Цвета таб-бара берутся из темы (`background` / `text`)
- `NavigationContainer` обёрнут в `ThemeProvider` (провайдер темы — внешний)
- `App.tsx` рендерит `AppNavigator` внутри `ThemeProvider`, запускает `runMigrations()` при старте
- Созданы placeholder-экраны: `ChatListScreen`, `ChatRoomScreen`, `ScheduledScreen`, `SettingsScreen`
- Тип `ChatStackParamList` вынесен в `src/app/types.ts`
- Обновлены barrel-файлы: `src/app/index.ts`, `src/pages/index.ts`

## Изменённые файлы

- `App.tsx` — переписан:ThemeProvider + runMigrations + AppNavigator
- `src/app/AppNavigator.tsx` — новый: навигатор с табами и стеком
- `src/app/types.ts` — новый: типы параметров стека чатов
- `src/app/index.ts` — обновлён: экспорт AppNavigator и типов
- `src/pages/chat-list/ChatListScreen.tsx` — новый: placeholder
- `src/pages/chat-list/index.ts` — новый: barrel
- `src/pages/chat-room/ChatRoomScreen.tsx` — новый: placeholder
- `src/pages/chat-room/index.ts` — новый: barrel
- `src/pages/scheduled/ScheduledScreen.tsx` — новый: placeholder
- `src/pages/scheduled/index.ts` — новый: barrel
- `src/pages/settings/SettingsScreen.tsx` — новый: placeholder
- `src/pages/settings/index.ts` — новый: barrel
- `src/pages/index.ts` — обновлён: экспорт всех экранов
- `docs/reports/2026-05-24-navigation-setup.md` — этот отчёт

## Принятые решения

- **Иконки через SVG вместо react-native-vector-icons:** пакет `react-native-vector-icons` не установлен; использован уже имеющийся `react-native-svg` для Material-style иконок (24×24). При необходимости можно заменить на vector-icons позже.
- **Shared element transition на аватар отложен:** в задаче указано как experimental/feature flag — не реализовано.
- **Параметры ChatRoom:** `chatId: string` передаётся при навигации из ChatList в ChatRoom.

## Известные ограничения

- Экраны — placeholder'ы без реальной UI (будут реализованы в задачах 5.x, 6.x, 7.x)
- SVG-иконки — упрощённые копии Material Icons, не pixel-perfect
- Shared element transition не реализован (experimental)
- Диагностики IDE показывают ошибки `--jsx` — это ложные срабатывания, Metro bundler компилирует JSX корректно

## Тестирование

- Тесты не писались (placeholder-экраны не требуют unit-тестов)
- Проверка визуально: запустить `npx react-native run-android` и убедиться, что 3 таба отображаются с иконками, навигация между табами работает, переход ChatList → ChatRoom работает
