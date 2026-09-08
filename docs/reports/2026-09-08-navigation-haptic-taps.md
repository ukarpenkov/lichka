# Короткий haptic на навигацию, модалки и настройки

**Дата:** 2026-09-08
**Промпт/задача:** Добавить минимальный haptic (короткий удар) на вход/выход из чата, на тапы, которые открывают окна или bottom sheet, и на тапы в настройках. Proposal в `docs/features`, реализация, отчёт.

## Что сделано
- Написан proposal `docs/features/navigation-haptic-taps-proposal.md`.
- `hapticTap` / `hapticLongPress` / `hapticSuccess` сами уважают `hapticEnabled` через `setHapticFeedbackEnabled`; флаг синхронизируется из `settingsRepository` и при старте в `AppInitProvider`.
- Короткий `impactLight` на вход в чат (список, глобальный поиск, Запланировано), выход (шапка и Android hardware back во вложенном стеке), открытие модалок/экранов и тапы в настройках.
- `SettingsRow`, `Switch` и опциональный проп `haptic` у `IconButton`; у композера убран дублирующий `onPressIn`.
- Экран будильника больше не вибрирует при выключенной настройке.

## Изменённые файлы
- `docs/features/navigation-haptic-taps-proposal.md` — proposal
- `src/shared/lib/haptics.ts` — гейт флага
- `src/shared/lib/index.ts` — экспорт `setHapticFeedbackEnabled`
- `src/entities/settings/model/settingsRepository.ts` — sync флага
- `src/app/AppInitProvider.tsx` — sync при старте
- `src/app/AppNavigator.tsx` — Android `goBack` + назад из ThemePicker
- `src/shared/ui/IconButton.tsx`, `Switch.tsx` — примитивы
- `src/pages/settings/SettingsRow.tsx`, `ThemePickerScreen.tsx`
- `src/pages/chat-list/ChatListItem.tsx`, `ChatListScreen.tsx`, `GlobalSearch.tsx`, `ChatContextMenu.tsx`
- `src/pages/chat-room/ChatHeader.tsx`, `ChatRoomScreen.tsx`, `MessageEditor.tsx`
- `src/pages/scheduled/ScheduledItem.tsx`
- `src/widgets/image-message/ImageMessage.tsx`
- `src/widgets/message-composer/MessageComposer.tsx`
- `jest.setup.js` — `HapticFeedbackTypes` в моке
- тесты: `haptics`, `IconButton`, `Switch`, `SettingsRow`, `ChatListItem`, `ChatHeader`, `settingsRepository`

## Принятые решения
- Тип отдачи — существующий `impactLight`, без нового API.
- Shared не читает entities: флаг инжектится сверху (`setHapticFeedbackEnabled`).
- `AnimatedPressable` без глобального haptic (таббар и будильник).
- `IconButton` haptic по умолчанию выключен, чтобы play/pause голоса не вибрировал.
- Не трогаем iOS swipe-back, табы, программный `navigateToChat`, кнопки Cancel/Done внутри уже открытого диалога.
- Gorhom Bottom Sheet в UI нет — оверлеи это `Modal`.

## Известные ограничения
- iOS swipe-back из чата / ThemePicker без haptic.
- Программное открытие чата (уведомление, виджет, share) без haptic.
- Тапы по таббару без haptic.

## Тестирование
- `npx jest --no-coverage` — 76 suites / 573 tests, все зелёные.
- Покрыто: гейт `hapticEnabled`; `IconButton` с/без `haptic`; `Switch` и `SettingsRow` на press; вход в чат и long-press меню; назад / поиск / название в `ChatHeader`; sync флага из `getSettings`.
