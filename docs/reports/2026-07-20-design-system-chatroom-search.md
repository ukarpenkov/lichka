# ChatRoom + GlobalSearch — продолжение DS

**Дата:** 2026-07-20  
**Промпт/задача:** продолжить дизайн-систему на ChatRoom и GlobalSearch по той же канве, что root tabs

## Что сделано

- **ChatHeader** — высота 56, без hairline, title `typography.title`, press soft-tint на title row.
- **MessageBubble** — fill `surfaceStrong` / highlight ink@18%, meta `micro` + muted tones, radii.lg, без локальных fontSize; TYPE_ICON без `any`.
- **DateSeparator** — только caption по центру, без hairline-линий.
- **GlobalSearch** + **SearchOverlay** — поле на `surfaceSoft` (без outline-рамки), результаты без dividers, ритм как у chat rows.
- **MessageContextMenu** / **ChatContextMenu** — без border/divider, scrim/destructive из tokens, press soft-tint.
- **MessageEditor** — убран `#4A9EFF`, CTA = ink, input soft fill.
- **MessageComposer** — без top hairline, input soft fill, recording/destructive из tokens.
- **HighlightedBody** — highlight через `withAlpha`, не hex-concat.
- **ChatRoomScreen** — canvas/ink semantic colors.

## Изменённые файлы

- `src/pages/chat-room/ChatHeader.tsx`
- `src/pages/chat-room/MessageBubble.tsx`
- `src/pages/chat-room/DateSeparator.tsx`
- `src/pages/chat-room/SearchOverlay.tsx`
- `src/pages/chat-room/MessageContextMenu.tsx`
- `src/pages/chat-room/MessageEditor.tsx`
- `src/pages/chat-room/ChatRoomScreen.tsx`
- `src/pages/chat-list/GlobalSearch.tsx`
- `src/pages/chat-list/ChatContextMenu.tsx`
- `src/widgets/message-composer/MessageComposer.tsx`
- `src/shared/ui/HighlightedBody.tsx`
- `src/shared/config/index.ts`
- `docs/design/lichka-design-system.md`
- `docs/reports/2026-07-20-design-system-chatroom-search.md` (этот файл)

## Принятые решения

- Date separator без линий — тише и согласовано с no-hairline правилом; иерархию даёт caption + воздух.
- Search field: soft fill вместо bordered outline — меньше «форм» на цветных темах.
- Context menus без внутренних dividers: destructive цвет иконок/текста достаточная граница.
- Composer и in-chat search включены в тот же проход — это chrome ChatRoom, не отдельный продукт.

## Известные ограничения

- `DateTimePicker` / `PeriodPicker` всё ещё с `#4A9EFF`.
- Voice/Image widgets частично на hex-concat — вне прямого chrome.
- Device screenshots light/dark/mint/cream ещё нужны.

## Тестирование

- `MessageBubble`, tokens, color, ThemeProvider — passed
