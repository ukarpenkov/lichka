# Terminal / CLI редизайн — реализация

**Дата:** 2026-07-20  
**Промпт/задача:** Реализовать редизайн по `DESIGN.md` с ролями Lead Designer + UI Architect + senior FE; сохранить фичи, пересобрать UI под terminal-концепцию.

## Что сделано

### Lead Designer (решения)
- Mono font: **JetBrains Mono** (OFL, Cyrillic + tabular digits).
- Timestamp: **`[HH:MM:SS]`**.
- Подтверждены: MessageLine без flag, prompt `>`, иконки типов, pixel — later.

### UX / UI Architect
- FSD: токены в `shared/config`, `MessageLine` в `pages/chat-room`, composer в `widgets`.
- Soft DS помечен superseded; `lichka-design-system.md` = terminal-контракт.

### Senior FE (фазы 1–4)
- Подключены шрифты (`assets/fonts` + android assets + `react-native.config.js`).
- Typography scale на JetBrains Mono + variant `mono-meta`.
- `MessageBubble` → `MessageLine` (лог-строки, a11y типов).
- Date separator: `── label ──`.
- Composer: prefix `>`, flat mono input (без soft pill).
- CLI-density list rows; settings section labels ALL CAPS.
- Nav theme fonts → mono.

## Изменённые файлы
- `assets/fonts/*` + `android/.../assets/fonts/*` + `react-native.config.js` — JetBrains Mono
- `src/shared/config/tokens.ts` — fonts, mono typography, radii.none/sm, denser listRow
- `src/shared/ui/Text.tsx`, `Input.tsx`, `Button.tsx`, `AlertDialog.tsx`
- `src/pages/chat-room/MessageLine.tsx` (новый), удалён `MessageBubble.tsx`
- `src/pages/chat-room/DateSeparator.tsx`, `ChatRoomScreen.tsx`
- `src/widgets/message-composer/MessageComposer.tsx`
- `src/app/AppNavigator.tsx`, `src/pages/settings/*`, locale a11y keys
- `DESIGN.md`, `docs/design/lichka-design-system.md`, `terminal-cli-redesign-task.md`

## Принятые решения
- Один visual language, без dual-mode bubble|line.
- Weight через отдельные TTF (не синтез fontWeight на Android).
- Edited marker: короткий `(изм.)` / `(edited)` в суффиксе строки.
- Highlight = `surfaceSoft`, не заливка-bubble.

## Известные ограничения
- Device QA / скриншоты 5 тем — ещё не сняты (нужен rebuild с линковкой шрифтов).
- После `npx react-native-asset` / rebuild Android шрифты подхватятся; уже скопированы в `android/.../assets/fonts`.
- DateTimePicker ещё содержит legacy accent `#4A9EFF` (вне scope этого прохода, noted в старом DS).

## Тестирование
- `tokens`, `MessageLine`, `MessageComposer` — PASS
- Сценарии MessageLine: simple / reminder / image / voice / edited / timestamp format
- Composer: prompt `>` + 4 send actions
