# Экран «Настройки» (Settings)

**Дата:** 2026-05-25
**Промпт/задача:** Реализация экрана настроек (task 7.1) с секциями: Тема, Звук и тактильность, Язык, Резервная копия, О приложении

## Что сделано

- Переписан `SettingsScreen` из заглушки в полноценный экран с 5 секциями
- Создан экран выбора темы `ThemePickerScreen` с превью всех 13 пресетов
- Создан локальный компонент `SettingsRow` для единообразных рядов настроек
- Настроен стековый навигатор для вкладки Settings (по аналогии с ChatsTab)
- Все настройки (тема, звук, haptic, язык) сохраняются и восстанавливаются из SQLite

## Изменённые файлы

- `src/app/types.ts` — добавлен `SettingsStackParamList`
- `src/app/AppNavigator.tsx` — SettingsTab обёрнут в `NativeStackNavigator` (Settings + ThemePicker)
- `src/pages/settings/index.ts` — добавлен экспорт `ThemePickerScreen`
- `src/pages/settings/SettingsScreen.tsx` — полная переработка: ScrollView с 5 секциями
- `src/pages/settings/SettingsRow.tsx` — новый файл, локальный компонент ряда настроек
- `src/pages/settings/ThemePickerScreen.tsx` — новый файл, экран выбора темы

## Принятые решения

1. **Навигация к выбору темы** — SettingsTab обёрнут в `NativeStackNavigator` по образцу ChatsTab. ThemePicker — отдельный экран с заголовком «Тема оформления» и кнопкой назад
2. **Google Drive / Backup** — заглушки с `Alert.alert('Скоро')`. Нет пакетов для Google Drive API
3. **Язык** — переключатель RU/EN сохраняет значение в SQLite через `updateSettings()`. i18n-библиотеки нет, UI остаётся на русском
4. **Switch** — использован встроенный `react-native` Switch с тематическими `trackColor`/`thumbColor`
5. **ThemeProvider.setTheme()** — используется для смены темы (сам пишет в SQLite + обновляет контекст), отдельный `updateSettings()` не вызывается
6. **Версия** — константа `APP_VERSION = '0.1'` (import package.json не стандартен в RN)

## Известные ограничения

- Backup / Google Drive — заглушки, требуют отдельной реализации
- UI-лейблы не переводятся при смене языка (нет i18n-фреймворка)
- Версия приложения захардкожена, не читается из package.json динамически

## Тестирование

- Все 29 существующих юнит-тестов проходят (settings, theme, entities)
- 3 тест-сьютa падают из-за отсутствия нативных модулей (op-sqlite, gesture-handler) — пред-existing, не связаны с изменениями
