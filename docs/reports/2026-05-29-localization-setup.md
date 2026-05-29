# Настройка локализации RU + EN

**Дата:** 2026-05-29
**Промпт/задача:** Настроить локализацию RU + EN с возможностью расширения на другие языки (пункт 15.1 из tasks)

## Что сделано

### Созданы новые файлы

- `src/shared/config/locale.ts` — типы (`Locale`, `LocaleDictionary`), словари RU и EN, функции `getDictionary()`, `getSystemLocale()`
- `src/shared/config/dateUtils.ts` — централизованные утилиты форматирования дат: `formatDateLabel`, `formatTime`, `formatScheduledAt`, `formatRelativeDate`, `formatInterval`, `getMonthLabels`, `getFullMonthNames`, `formatShortMonth`
- `src/shared/config/LocaleProvider.tsx` — React Context провайдер с хуком `useLocale()`, чтение locale из SQLite, fallback на системный язык
- `src/shared/config/__tests__/locale.test.ts` — unit-тесты для словарей и getDictionary
- `src/shared/config/__tests__/dateUtils.test.ts` — unit-тесты для всех функций форматирования дат

### Обновлены существующие файлы

- `src/shared/config/index.ts` — добавлены ре-экспорты locale, LocaleProvider, dateUtils
- `App.tsx` — приложение обёрнуто в `<LocaleProvider>`
- `src/shared/db/db.ts` — добавлена миграция №4 для нормализации voice-сообщений в нейтральный формат `[voice:N]`

### Локализованы компоненты (~20 файлов)

**Pages:**
- `pages/chat-list/ChatListScreen.tsx` — заголовок, пустое состояние, диалог удаления
- `pages/chat-list/ChatContextMenu.tsx` — пункты меню
- `pages/chat-list/GlobalSearch.tsx` — placeholder, пустой результат, locale-aware формат даты
- `pages/chat-room/ChatRoomScreen.tsx` — диалог удаления сообщения
- `pages/chat-room/DateSeparator.tsx` — заменён на `formatDateLabel` из dateUtils
- `pages/chat-room/MessageBubble.tsx` — индикатор "изменено"
- `pages/chat-room/MessageContextMenu.tsx` — пункты меню
- `pages/chat-room/MessageEditor.tsx` — все строки + `formatScheduledAt`/`formatInterval` из dateUtils
- `pages/chat-room/SearchOverlay.tsx` — placeholder, пустой результат
- `pages/scheduled/ScheduledScreen.tsx` — пустое состояние
- `pages/scheduled/ScheduledItem.tsx` — locale-aware формат даты, "каждые N мин"
- `pages/settings/SettingsScreen.tsx` — все строки (~30), включая Alert-диалоги

**Widgets:**
- `widgets/chat-form/ChatForm.tsx` — заголовок, кнопки, placeholder, ошибки
- `widgets/chat-form/EmojiGrid.tsx` — заголовок
- `widgets/message-composer/DateTimePickerModal.tsx` — шаги, кнопки
- `widgets/message-composer/MessageComposer.tsx` — placeholder, запись, голосовое сообщение
- `widgets/datetime-picker/DateTimePicker.tsx` — кнопки
- `widgets/datetime-picker/MonthRing.tsx` — locale-aware названия месяцев
- `widgets/period-picker/PeriodPicker.tsx` — пресеты, кнопки, placeholder

**Features:**
- `features/notifications/requestExactAlarmPermission.ts` — Alert через `getDictionary()`
- `features/import/importFromJSON.ts` — сообщение об ошибке через `getDictionary()`

**App:**
- `app/AppNavigator.tsx` — заголовок экрана темы

### Нейтральный формат voice-сообщений

- Формат в БД изменён с `[Голосовое Nс]` на `[voice:N]`
- Миграция №4 автоматически конвертирует старые записи
- `MessageComposer` сохраняет в новом формате
- `VoiceMessage` парсит `[voice:N]`

## Изменённые файлы

- `src/shared/config/locale.ts` — новый
- `src/shared/config/dateUtils.ts` — новый
- `src/shared/config/LocaleProvider.tsx` — новый
- `src/shared/config/index.ts` — обновлён
- `src/shared/config/__tests__/locale.test.ts` — новый
- `src/shared/config/__tests__/dateUtils.test.ts` — новый
- `App.tsx` — обёрнут в LocaleProvider
- `src/shared/db/db.ts` — миграция №4
- `src/app/AppNavigator.tsx` — локализован заголовок
- `src/pages/chat-list/ChatListScreen.tsx` — локализован
- `src/pages/chat-list/ChatContextMenu.tsx` — локализован
- `src/pages/chat-list/GlobalSearch.tsx` — локализован
- `src/pages/chat-room/ChatRoomScreen.tsx` — локализован
- `src/pages/chat-room/DateSeparator.tsx` — переписан на dateUtils
- `src/pages/chat-room/MessageBubble.tsx` — локализован
- `src/pages/chat-room/MessageContextMenu.tsx` — локализован
- `src/pages/chat-room/MessageEditor.tsx` — локализован
- `src/pages/chat-room/SearchOverlay.tsx` — локализован
- `src/pages/scheduled/ScheduledScreen.tsx` — локализован
- `src/pages/scheduled/ScheduledItem.tsx` — локализован
- `src/pages/settings/SettingsScreen.tsx` — локализован
- `src/widgets/chat-form/ChatForm.tsx` — локализован
- `src/widgets/chat-form/EmojiGrid.tsx` — локализован
- `src/widgets/message-composer/DateTimePickerModal.tsx` — локализован
- `src/widgets/message-composer/MessageComposer.tsx` — локализован
- `src/widgets/datetime-picker/DateTimePicker.tsx` — локализован
- `src/widgets/datetime-picker/MonthRing.tsx` — локализован
- `src/widgets/period-picker/PeriodPicker.tsx` — локализован
- `src/widgets/voice-message/VoiceMessage.tsx` — обновлён regex
- `src/features/notifications/requestExactAlarmPermission.ts` — локализован
- `src/features/import/importFromJSON.ts` — локализован

## Принятые решения

1. **Без внешних библиотек** — легковесная система по аналогии с ThemeProvider (Context + hook)
2. **Плоские словари** — все ключи на одном уровне, типизированные через `LocaleDictionary`
3. **Шаблонные функции** — для динамических строк (`deleteChatConfirm(title)`, `voiceMessage(sec)`)
4. **`getDictionary(locale)`** — для не-React-модулей (features, shared/lib)
5. **Нейтральный формат voice** — `[voice:N]` вместо языко-зависимого текста
6. **Системный язык** — определяется через `NativeModules`, fallback на EN
7. **DateUtils** — централизованные функции принимают `locale` и `t` как параметры

## Известные ограничения

1. **Только RU и EN** — архитектура готова для добавления новых языков (нужно добавить словарь в `dictionaries`)
2. **RTL не поддерживается** — для арабского/иврита потребуется дополнительная работа
3. **Плюрализация** — текущие шаблонные функции не обрабатывают плюральные формы (для русского/английского достаточно)
4. **Формат даты** — `DD.MM.YYYY` для RU, `MM/DD/YYYY` для EN через `toLocaleDateString`

## Тестирование

- Unit-тесты для `locale.ts`: проверка ключей, шаблонных функций, fallback
- Unit-тесты для `dateUtils.ts`: проверка форматирования для обоих локалей
- Ручная проверка: переключение языка в настройках → весь UI обновляется
