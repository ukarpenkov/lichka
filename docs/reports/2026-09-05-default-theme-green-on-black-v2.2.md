# Тема по умолчанию Green on Black + версия 2.2

**Дата:** 2026-09-05
**Промпт/задача:** сделать тему «Green on Black» темой по умолчанию при установке, поднять версию приложения до 2.2 и собрать AAB для Google Play.

## Что сделано
- Введён `DEFAULT_THEME` (= `GREEN_ON_BLACK`, `#000000` / `#39FF14`) как тема по умолчанию при отсутствии сохранённой темы в settings.
- Все точки «дефолта» переведены с `DEFAULT_LIGHT` на `DEFAULT_THEME`: `ThemeProvider`, loading screen в `App.tsx`, `ErrorBoundary`, `settingsRepository`, начальное состояние `ThemePickerScreen`.
- Нативная сторона Android приведена к новому дефолту: дефолты `ThemeModule` (виджет/будильник), `colors.xml` (промо-превью виджета), fallback-цвета в `ScheduledWidgetProvider`, `ScheduledWidgetService`, `AlarmActivity`.
- Версия приложения поднята до 2.2: `versionCode 3 → 4`, `versionName "2.1" → "2.2"` (android), `APP_VERSION` в SettingsScreen, `package.json` / `package-lock.json`.
- Собран и подписан релизный AAB: `android/app/build/outputs/bundle/release/app-release.aab` (52 МБ, versionName 2.2 подтверждён в манифесте).

## Изменённые файлы
- `src/shared/config/theme.ts` — добавлены `GREEN_ON_BLACK` и `DEFAULT_THEME`, fallback `getTheme` → `DEFAULT_THEME`
- `src/shared/config/ThemeProvider.tsx` — дефолт провайдера → `DEFAULT_THEME`
- `src/shared/config/index.ts` — экспорт `DEFAULT_THEME`, `GREEN_ON_BLACK`
- `App.tsx` — цвета loading screen → `DEFAULT_THEME`
- `src/app/ErrorBoundary.tsx` — экран ошибки в цветах дефолтной темы
- `src/entities/settings/model/settingsRepository.ts` — `DEFAULTS.themePresetId: 'green-on-black'`
- `src/pages/settings/ThemePickerScreen.tsx` — начальный `currentId` → `DEFAULT_THEME.id`
- `src/pages/settings/SettingsScreen.tsx` — `APP_VERSION = '2.2'`
- `android/app/build.gradle` — versionCode 4, versionName "2.2"
- `android/app/src/main/java/com/lichka/ThemeModule.kt` — дефолты `#000000` / `#39FF14`
- `android/app/src/main/java/com/lichka/ScheduledWidgetProvider.kt` — fallback-цвета виджета
- `android/app/src/main/java/com/lichka/ScheduledWidgetService.kt` — fallback-ink виджета
- `android/app/src/main/java/com/lichka/AlarmActivity.kt` — fallback текста будильника
- `android/app/src/main/res/values/colors.xml` — widget_canvas/ink/ink_muted в green-on-black
- `package.json`, `package-lock.json` — версия 2.2
- Тесты: `theme.test.ts`, `ThemeProvider.test.tsx`, `settingsRepository.test.ts` — ожидания обновлены под новый дефолт

## Принятые решения
- `DEFAULT_LIGHT` оставлен как полноценная тема (id `light`) — она выбирается явно, но больше не является fallback'ом.
- Fallback `getTheme` для неизвестного id также ведёт в `DEFAULT_THEME`, чтобы поведение было единообразным во всех точках входа.
- Нативные дефолты виджета изменены, чтобы до первого запуска JS (когда prefs ещё пусты) виджет выглядел в новой теме, а не «перепрыгивал» со старого дефолта.

## Известные ограничения
- `getThemeTintedAvatarDataUri` и эвристика `lightHeuristic` в seamless-chat по-прежнему используют `#FAFAFA` как внутренние fallback'и — на поведение не влияют, не менялись.
- Проверка вручную выполнялась сборкой AAB и юнит-тестами; на устройстве новый дефолт не прогонялся.

## Тестирование
- `npx jest` по изменённым сьютам: 34/34 passed (theme, ThemeProvider, settingsRepository).
- `npx eslint` по изменённым файлам — без замечаний.
- `tsc --noEmit` — ошибки только в несвязанных тестовых файлах (pre-existing: launcher-shortcut, scheduled-widget, share-into-chat — мок `addEventListener` несовместим с типом `EmitterSubscription`).
- `./gradlew bundleRelease` — BUILD SUCCESSFUL, AAB собран и подписан.
