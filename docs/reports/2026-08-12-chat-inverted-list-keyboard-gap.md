# Inverted лента чата, клавиатура и нижний отступ

**Дата:** 2026-08-12  
**Промпт/задача:** Убрать мерцание/анимацию ленты при open/close клавиатуры; выровнять и уменьшить зазор между последним сообщением и композером

## Что сделано

- История чата переведена на **inverted FlatList**: данные с date-separators реверсятся (`buildHistoryListItems`), index 0 = последнее сообщение у композера; offset 0 после remount / клавиатуры / Future — хвост у ввода без `scrollToEnd`
- Убраны `scrollToBottom`, `scrollToEnd` при клавиатуре, `maintainVisibleContentPosition`, stick-to-bottom на `onLayout` — источники feedback loop и «догоняния» низа
- `scrollEdge`: функции для inverted (`isInvertedListAtVisualBottom` / `Top`), гистерезис `nextCanListScroll`, `getInvertedListContentFillStyle` (`flexGrow` + `justifyContent: 'flex-end'`)
- `GestureDetector` и `FlatList` не remount-ятся при open/close клавиатуры и при flip `canScroll`; Native scroll ↔ Manual swap через постоянный wrapper
- Анимации строк: `FadeInUp` / `Layout.springify` / `FadeOutDown` заменены на простой `FadeIn`; `animateLayout` удалён; `renderItem` стабилен через `keyboardOpenRef` (не зависит от `keyboardOpen` в deps)
- `FutureTimeline`: убраны enter/layout springs; GestureDetector всегда в дереве (inert Manual при non-scrollable)
- `MESSAGE_LIST_BOTTOM_GAP` уменьшен с 8 до 4 px; padding композера `paddingTop` 8 → 4
- Обновлён баг `docs/bugs/chat-message-animation-keyboard-loop.md` (статус in progress)

## Изменённые файлы

- `docs/bugs/chat-message-animation-keyboard-loop.md` — пересборка описания: inverted list, причины, проверка
- `src/pages/chat-room/historyListItems.ts` — новый модуль: reverse хронологических rows для inverted FlatList
- `src/pages/chat-room/ChatRoomScreen.tsx` — inverted list, стабильные жесты, без scrollToEnd, inverted edges, gap padding
- `src/pages/chat-room/scrollEdge.ts` — inverted at-bottom/top, nextCanListScroll, getInvertedListContentFillStyle
- `src/pages/chat-room/MessageLine.tsx` — только FadeIn, без exiting/layout
- `src/pages/chat-room/FutureTimeline.tsx` — без Reanimated enter/layout, стабильный GestureDetector
- `src/shared/lib/keyboard.ts` — MESSAGE_LIST_BOTTOM_GAP = 4
- `src/widgets/message-composer/MessageComposer.tsx` — paddingTop 4
- `src/pages/chat-room/__tests__/historyListItems.test.ts` — порядок ключей для inverted
- `src/pages/chat-room/__tests__/scrollEdge.test.ts` — inverted edges, hysteresis, fill style
- `src/pages/chat-room/__tests__/ChatRoomScreen.keyboardFocus.test.tsx` — inverted, flex-end, list mount stable
- `src/pages/chat-room/__tests__/MessageLine.test.tsx` — гейт enter без layout
- `src/pages/chat-room/__tests__/futurePeekIntegration.test.ts` — inverted remount at offset 0

## Принятые решения

- Вернуть inverted + reverse данных вместо ASC + scrollToEnd — корневой фикс пина хвоста и remount после Future
- `flexGrow: 1` не togglить с `canScroll` (предотвращает layout loop); для inverted добавить `justifyContent: 'flex-end'`, чтобы leftover не сидел над композером
- Закрытие клавиатуры не должно remount-ить ячейки и не должно анимировать ленту — стабильный `renderItem`, без `FadeOutDown`, без `maintainVisibleContentPosition`
- Peek rubber-band остаётся на `listPane` при открытой клавиатуре; peek reset на keyboard hide

## Известные ограничения

- Ручная проверка на Android: скролл к старым сообщениям при открытой клавиатуре, Future peek, kill app → reopen
- Enter-анимация нового сообщения только при закрытой клавиатуре (гейт через ref)

## Тестирование

- `historyListItems.test.ts` — latest first, date separators в визуальном порядке
- `scrollEdge.test.ts` — inverted edges, nextCanListScroll, getInvertedListContentFillStyle, stick-to-bottom helpers
- `ChatRoomScreen.keyboardFocus.test.tsx` — composer/list не remount при keyboard; inverted + flex-end
- `MessageLine.test.tsx` — render с `animateEnter={false}`
- `futurePeekIntegration.test.ts` — inverted offset 0 = at bottom для peek
- `keyboard.test.ts`, `MessageComposer.test.tsx`, `FutureTimeline.test.tsx` — без регрессий

## Статус нижнего отступа (не решено)

**Проблема с нижним отступом не решена.**

На устройстве зазор между последним сообщением и полем ввода при **закрытой** клавиатуре **не равен** зазору при **открытой** клавиатуре. В обоих состояниях отступ в целом **слишком большой** — последнее сообщение визуально «плавает» далеко над композером, особенно когда клавиатура закрыта.

Предпринятые меры (`justifyContent: 'flex-end'`, уменьшение `MESSAGE_LIST_BOTTOM_GAP` до 4 px, симметричный paddingTop/paddingBottom в list content, убран padding композера) не дали ожидаемого визуального результата. Требуется дополнительная диагностика: возможные источники — `flexGrow` + inverted + Android `scale: -1`, padding композера / tab bar / `androidKeyboardPad`, взаимодействие `peekHost` и высоты list pane.
