# Исправление ошибки "Another navigator is already registered" в SwipeablePager

**Дата:** 2026-07-08
**Промпт/задача:** Приложение не открывается на эмуляторе — ошибка рендера "Another navigator is already registered for this container".

## Что сделано

После рефакторинга `264ebe5` (замена bottom-tab-навигатора на кастомный `SwipeablePager`) приложение падало с ошибкой:

```
Another navigator is already registered for this container.
You likely have multiple navigators under a single "NavigationContainer" or "Screen".
```

### Причина

`SwipeablePager` рендерит все три дочерних экрана одновременно (для горизонтального свайпа).
Внутри двух из них (`ChatStackScreen` и `SettingsStackScreen`) находятся независимые
`NativeStackNavigator`. React Navigation через `EnsureSingleNavigator`/`useRegisterNavigator`
допускает только один навигатор на один контейнер/экран — поэтому при монтировании второго
стека выбрасывалась ошибка.

В обычном tab-наваторе каждый стек изолирован внутри `<Screen />`, который создаёт
собственный `SingleNavigatorContext`. Кастомный `SwipeablePager` такой изоляции не давал.

### Решение

Каждый вложенный стек обёрнут в `NavigationIndependentTree` + `BaseNavigationContainer`
из `@react-navigation/native`. Это даёт каждому стеку собственный
`SingleNavigatorContext` и независимое navigation-дерево.

Это безопасно, потому что:

- Кросс-навигация между табами и в `ChatRoom` уже выполняется императивно через
  `mainTabsApi.ts` (`setChatStackNavigation`, `navigateToChat`, `switchToTab`),
  а не через `navigation.navigate` родительского стека.
- `useFocusEffect` и `useNavigation` внутри каждого экрана корректно работают,
  потому что `NavigationIndependentTree` сбрасывает контексты `NavigationContext`,
  `NavigationRouteContext`, `IsFocusedContext`, после чего `BaseNavigationContainer`
  предоставляет новые.

### Дополнительно

- Вынесена общая функция `buildNavTheme(text, background)` — устраняет дублирование
  темы между `AppNavigator`, `ChatStackScreen` и `SettingsStackScreen`.

## Изменённые файлы

- `src/app/AppNavigator.tsx` — обёрнуты `ChatStackScreen` и `SettingsStackScreen`
  в `NavigationIndependentTree` + `BaseNavigationContainer`; добавлен `buildNavTheme`.

## Принятые решения

- Использован `BaseNavigationContainer` (а не `NavigationContainer`), потому что
  `NavigationContainer` добавляет `BackHandler`, linking, document title — это
  responsibility корневого контейнера. Вложенным деревьям нужна только базовая
  инфраструктура состояния.
- Каждый независимый контейнер получает собственный `theme`, чтобы хедеры стеков
  корректно окрашивались в цвета приложения.

## Известные ограничения

- Навигация между независимыми деревьями возможна только императивно (через
  `mainTabsApi`). `navigation.navigate('ChatRoom')` из `ScheduledScreen` не сработал
  бы напрямую — для этого используется `navigateToChat()` из `mainTabsApi`.
- Кнопка "назад" Android обрабатывается только корневым `NavigationContainer`
  (`useBackButton`). Вложенные стеки не перехватывают BackHandler самостоятельно —
  это работает, потому что `react-native-screens` natively обрабатывает back
  внутри `ScreenStackItem` через `dismissCount` event.

## Тестирование

- Запущен эмулятор `emulator-5554`, Metro на порту 8081.
- `adb shell am start -n com.lichka/.MainActivity` — приложение запускается,
  `MainActivity` становится `topResumedActivity`, процесс стабилен (PID 10553).
- `adb logcat` — нет ошибок "Another navigator", "Render Error", "RedBox", "FATAL".
- `ReactNativeJS: Running "lichka"` — бандл загружен.
- `npx eslint src/app/AppNavigator.tsx` — чисто.
- `npx tsc --noEmit` — новых ошибок по изменённому файлу нет (существующие ошибки
  в других файлах не связаны с задачей).
