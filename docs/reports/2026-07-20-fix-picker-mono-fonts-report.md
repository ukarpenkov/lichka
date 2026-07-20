# Исправление system-шрифтов (пикер даты + аудит UI)

**Дата:** 2026-07-20  
**Промпт/задача:** В пикере даты выбранные часы/минуты в скролле имели стандартный шрифт вместо mono; проверить приложение, чтобы везде были только mono или pixel.

## Что сделано
- Исправлен `TimeScroller`: выбранные (center) значения часов/минут больше не задают `fontWeight: '700'` поверх кастомного family — на Android это давало fallback на system sans.
- Добавлен хелпер `monoWeight()` в `shared/config/tokens` — безопасный выбор JetBrains Mono face без faux-bold.
- Пройден аудит UI: убраны утечки system sans / numeric `fontWeight` без face-файла (пикер даты/года, PeriodPicker, Badge, SearchOverlay, GlobalSearch, MessageEditor, Settings, ChatForm, ErrorBoundary, nav theme).
- SearchOverlay больше не форсирует `sans-serif` на Android.

## Изменённые файлы
- `src/shared/config/tokens.ts` — `monoWeight`
- `src/shared/config/index.ts` — экспорт
- `src/shared/config/__tests__/tokens.test.ts` — тест `monoWeight`
- `src/widgets/datetime-picker/TimeScroller.tsx` — mono для часов/минут/двоеточия
- `src/widgets/datetime-picker/DateTimePicker.tsx`, `YearPicker.tsx`, `YearGridModal.tsx`, `BezelLabel.tsx`
- `src/widgets/period-picker/PeriodPicker.tsx`
- `src/shared/ui/Badge.tsx`, `HighlightedBody.tsx`
- `src/features/seamless-chat/SeamlessDateChip.tsx`
- `src/pages/chat-room/SearchOverlay.tsx`, `MessageEditor.tsx`
- `src/pages/chat-list/GlobalSearch.tsx`
- `src/pages/settings/SettingsScreen.tsx`
- `src/widgets/chat-form/ChatForm.tsx`
- `src/app/ErrorBoundary.tsx`, `AppNavigator.tsx`

## Принятые решения
- Вес mono всегда через отдельный файл (`JetBrainsMono-Bold` и т.д.), не через `fontWeight` на Android.
- Pixel (`PressStart2P`) остаётся только для display/заголовков; UI body — JetBrains Mono.

## Известные ограничения
- React Navigation `theme.fonts` всё ещё требует поле `fontWeight` в типе — на Android ставим `'normal'` вместе с weight-specific `fontFamily`.

## Тестирование
- Unit: `tokens.test.ts` (включая `monoWeight`) — pass
- Ручная проверка на устройстве: скролл часов/минут в DateTimePicker — выбранное значение должно быть JetBrains Mono Bold
