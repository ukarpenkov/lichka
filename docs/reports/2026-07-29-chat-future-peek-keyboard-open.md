# Future Peek при открытой клавиатуре

**Дата:** 2026-07-29
**Промпт/задача:** В чате при открытой клавиатуре нельзя посмотреть Future (жест peek недоступен)

## Что сделано
- Убрана блокировка entry-жеста Future Peek по флагу `keyboardOpen`
- Удалены JS-листенеры `keyboardDidShow` / `keyboardDidHide` и state `keyboardOpen`, использовавшиеся только для этого гейта
- При commit в Future по-прежнему вызывается `Keyboard.dismiss()` в `enterFuture`
- Обновлён edge case в proposal: жест доступен при открытой клавиатуре
- Добавлены/обновлены unit-тесты на доступность peek при открытой клавиатуре

## Изменённые файлы
- `src/pages/chat-room/ChatRoomScreen.tsx` — entry gesture: `enabled` без `!keyboardOpen`; удалены state и listeners
- `docs/features/chat-future-peek-proposal.md` — граничный случай «Клавиатура открыта»
- `src/pages/chat-room/__tests__/futurePeekIntegration.test.ts` — сценарий peek при keyboard open
- `src/pages/chat-room/__tests__/futurePeekAcceptance.test.ts` — acceptance 6b: keyboard open → entry activatable

## Принятые решения
- Не требовать предварительного закрытия клавиатуры перед жестом: UX хуже, чем «потянул → Future + dismiss»
- Dismiss клавиатуры оставляем на момент commit (`enterFuture`), а не на начало жеста — rubber-band и порог работают поверх открытой клавиатуры
- Search по-прежнему блокирует жест (`!searchVisible`)

## Известные ограничения
- На устройстве возможны конфликты pan-жеста списка с фокусом composer при очень коротком pull — нужен ручной smoke на Android/iOS
- Exit-жест Future не зависел от клавиатуры (composer в future скрыт) — изменений там нет

## Тестирование
- `npm test -- --testPathPattern='futurePeek' --no-coverage` — 3 suites, 15 tests passed
- Сценарии:
  - entry только at bottom / не busy
  - entry при `keyboardOpen === true` разрешён
  - exit только at top
  - acceptance MVP (1–7 + 6b keyboard)
- Ручная проверка: открыть чат → фокус в поле ввода → внизу ленты pull в Future → клавиатура закрывается, режим Future
