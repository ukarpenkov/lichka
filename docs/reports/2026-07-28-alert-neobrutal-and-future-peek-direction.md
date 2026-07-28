# UI и жест Future Peek — правки

**Дата:** 2026-07-28
**Промпт/задача:** (1) кнопки AlertDialog разного размера + меню Edit/Delete не в neo-brutal; (2) вход в Future сейчас свайпом сверху вниз — нужен снизу вверх

## Что сделано

### AlertDialog и меню Edit/Delete
- Кнопки Cancel/Delete выровнены по ширине и высоте: face растягивается на слот, единый `variant="button"`
- `ChatContextMenu` и `MessageContextMenu` переведены на neo-brutal (2px border + hard offset shadow), как у AlertDialog

### Направление жеста Future Peek
- Вход в Future: у низа истории — свайп **снизу вверх** (естественный overscroll)
- Выход: у верха Future — свайп **сверху вниз** (зеркало)
- Обновлены a11y-строки RU/EN

## Изменённые файлы
- `src/shared/ui/AlertDialog.tsx` — равные кнопки, stretch face
- `src/pages/chat-list/ChatContextMenu.tsx` — neo-brutal card
- `src/pages/chat-room/MessageContextMenu.tsx` — neo-brutal card
- `src/features/chat-future-peek/peekGestureState.ts` — инверсия enter/exit pull
- `src/features/chat-future-peek/useFuturePeekGesture.ts` — `activeOffsetY` для pull up/down
- `src/shared/config/locale.ts` — `futurePeekA11y` / `futureExitA11y`
- `src/features/chat-future-peek/__tests__/peekGestureState.test.ts`
- `src/pages/chat-room/__tests__/futurePeekAcceptance.test.ts`

## Принятые решения
- Hard shadow в context menus локально (без выноса HardShadowBox), по тому же паттерну что AlertDialog
- Enter = pull up у `atBottom`, exit = pull down у `atTop` — совпадает с нативным overscroll у краёв ленты
- Overlay-якоря без смены: enter снизу, exit сверху

## Известные ограничения
- Proposal `chat-future-peek` / task prompts всё ещё описывают старый «pull down» entry — документацию не синхронизировали в этом проходе
- Одновременность pan + nested scroll на устройстве может потребовать тонкой настройки

## Тестирование
- `npm test -- --testPathPattern='chat-future-peek|futurePeek|locale'` — PASS (5 suites, 41 tests)
- AlertDialog / context menus — ручная проверка на устройстве
