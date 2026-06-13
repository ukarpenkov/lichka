# Исправление тестов — все зелёные

**Дата:** 2026-06-13
**Промпт/задача:** Прогони все тесты чтобы были зелёные

## Что сделано

3 провалившихся теста исправлены:

### 1. `dateUtils.test.ts` — `formatScheduledAt`

**Проблема:** `toLocaleTimeString` возвращает 12h формат (`02:30 PM`) на Windows, тест ожидал `14:30`.

**Решение:** `formatScheduledAt` переписан на ручное форматирование (`DD.MM.YYYY HH:MM` для ru, `MM/DD/YYYY HH:MM` для en) — детерминировано на любой платформе. Тесты обновлены под точные ожидания.

### 2. `messageRepository.test.ts` — импорт `react-native-fs`

**Проблема:** `messageRepository → shared/lib → mediaPath → react-native-fs` — Flow-синтаксис не парсится Jest.

**Решение:** Добавлен `jest.mock('react-native-fs')` в начале файла (до imports).

### 3. `App.test.tsx` — нативные модули

**Проблема:** `react-native-gesture-handler`, `react-native-reanimated`, `react-native-sound` и другие не доступны в Jest.

**Решение:** Создан `jest.setup.js` с моками для всех нативных модулей:
- `react-native-gesture-handler` (GestureHandlerRootView, Gesture, GestureDetector)
- `@gorhom/bottom-sheet` (BottomSheetModalProvider)
- `react-native-screens`, `react-native-safe-area-context`
- `@react-navigation/*` (NavigationContainer, useNavigation, useRoute, createNativeStackNavigator, createBottomTabNavigator)
- `react-native-reanimated` (View, useSharedValue, withSpring, FadeIn, Layout, etc.)
- `react-native-fs`, `@op-engineering/op-sqlite`
- `react-native-audio-recorder-player`, `react-native-haptic-feedback`
- `react-native-sound` (с static `setCategory`)
- `lucide-react-native` (Proxy → View по имени иконки)
- `react-native-document-picker`, `@react-native-google-signin/google-signin`, `react-native-image-picker`

`jest.config.js` обновлён: `setupFiles: ['./jest.setup.js']`.

## Изменённые файлы

- `jest.config.js` — добавлен `setupFiles`
- `jest.setup.js` — новый файл (нативные моки)
- `src/shared/config/dateUtils.ts` — `formatScheduledAt` ручное форматирование
- `src/shared/config/__tests__/dateUtils.test.ts` — обновлены ожидания
- `src/entities/message/__tests__/messageRepository.test.ts` — добавлен мок react-native-fs

## Результат

```
Test Suites: 8 passed, 8 total
Tests:       111 passed, 111 total
```
