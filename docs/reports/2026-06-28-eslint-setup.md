# Настройка ESLint в проекте

**Дата:** 2026-06-28
**Промпт/задача:** Настроить линтер в проекте и запустить проверку

## Что сделано
- Мигрировал с `.eslintrc.js` (ESLint 8) на `eslint.config.js` (ESLint 9 flat config)
- Подключил `@react-native/eslint-config/flat`
- Отключил несовместимый плагин `ft-flow` (Flow, не используется в проекте)
- Добавил env для тестовых файлов (jest globals)
- Исправлена 73 ошибки:
  - Неиспользуемые импорты (12 файлов)
  - Пропущенные зависимости в useCallback/useEffect (8 файлов)
  - Неиспользуемые переменные (6 файлов)
  - Обёрнуты массивы/объекты в useMemo (SharedElementAvatar, PeriodPicker)

## Изменённые файлы
- `eslint.config.js` — новый конфиг для ESLint 9
- `.eslintrc.js` — удалён (заменён на flat config)
- `src/pages/chat-room/ChatRoomScreen.tsx` — добавлен `t` в deps
- `src/pages/chat-room/DateSeparator.tsx` — удалён неиспользуемый `LinearTransition`
- `src/pages/chat-list/ChatListItem.tsx` — удалён неиспользуемый `View`
- `src/pages/chat-list/ChatListScreen.tsx` — добавлен `t` в deps
- `src/pages/scheduled/ScheduledItem.tsx` — удалён неиспользуемый `formatRelativeDate`
- `src/pages/settings/SettingsScreen.tsx` — добавлен `t` в deps, удалена неиспользуемая переменная
- `src/features/voice-record/useVoiceRecorder.ts` — удалён неиспользуемый `DocumentDirectoryPath`
- `src/features/voice-play/useVoicePlayer.ts` — удалена лишняя зависимость `cleanup`
- `src/shared/config/LocaleProvider.tsx` — удалены неиспользуемые `useEffect`, `getDictionary`
- `src/shared/ui/Text.tsx` — удалён неиспользуемый `StyleSheet`
- `src/shared/ui/Button.tsx` — удалён неиспользуемый `TextStyle`
- `src/shared/ui/SharedElementAvatar.tsx` — удалены неиспользуемые импорты, `frames` обёрнут в `useMemo`
- `src/entities/settings/model/settingsRepository.ts` — удалена неиспользуемая переменная `now`
- `src/widgets/chat-form/ChatForm.tsx` — добавлен `t` в deps
- `src/widgets/chat-form/EmojiGrid.tsx` — удалён неиспользуемый `useTheme`
- `src/widgets/message-composer/MessageComposer.tsx` — добавлен `t` в deps
- `src/widgets/period-picker/PeriodPicker.tsx` — `PRESETS` обёрнут в `useMemo`
- `src/shared/config/__tests__/ThemeProvider.test.tsx` — удалены неиспользуемые импорты
- `src/shared/config/__tests__/theme.test.ts` — удалён неиспользуемый `ThemePreset`

## Принятые решения
- Используем `eslint.config.js` (flat config) — стандарт для ESLint 9+
- `ft-flow` отключён — проект использует TypeScript, не Flow
- Inline styles оставлены как warnings — многие из них динамические (зависят от темы)
- `no-bitwise` warnings оставлены — побитовые операции используются для генерации ID

## Итог
- **До:** 118 проблем (74 errors, 44 warnings)
- **После:** 45 проблем (1 error, 44 warnings)
- 1 ошибка — в `jest.setup.js` (особенность lint для моков)
