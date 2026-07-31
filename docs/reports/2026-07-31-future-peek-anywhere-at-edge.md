# Future Peek: жест с любой точки списка у края + stick-to-bottom при клавиатуре

**Дата:** 2026-07-31
**Промпт/задача:** Отчёт по staged-изменениям Future Peek (композиция Native+Pan, arm с любой точки списка при atEdge, сохранение at-bottom при сжатии viewport)

## Что сделано

- Entry/exit peek больше не конкурируют с nested scroll «за эксклюзивный touch»: `Gesture.Pan` работает одновременно с `Gesture.Native` списка (`.simultaneousWithExternalGesture`), а после активации pan блокирует scroll (`.blocksExternalGesture`).
- Hook `useFuturePeekGesture` экспортирует `nativeGesture` для обёртки `FlatList`/`ScrollView`; на UI-потоке `atEdge` синхронизируется в `atEdgeSV`, чтобы worklet не тянул pull, если край уже потерян.
- History и Future списки переведены на `FlatList` из `react-native-gesture-handler`; вокруг них — `GestureDetector` с `nativeGesture` (в Future — через проп `nativeScrollGesture`).
- При сжатии viewport (клавиатура / composer) добавлен `shouldStickToBottomOnLayoutShrink`: если пользователь был внизу, `atBottom` остаётся true и список пинится к концу — peek остаётся armed по всей видимой ленте.
- На `keyboardDidShow` сразу выставляется `setAtBottom(true)` перед `scrollToBottom`.
- Jest-мок RNGH расширен: chainable API + `Gesture.Native` + экспорт `FlatList`.

## Изменённые файлы

- `src/features/chat-future-peek/useFuturePeekGesture.ts` — `nativeGesture`, composition Pan↔Native, `atEdgeSV`
- `src/pages/chat-room/ChatRoomScreen.tsx` — RNGH `FlatList`, обёртка `entryPeek.nativeGesture`, stick-to-bottom в `onLayout`, `setAtBottom` на keyboard show; `nativeScrollGesture` для Future
- `src/pages/chat-room/FutureTimeline.tsx` — RNGH `FlatList` + `nativeScrollGesture` / `wrapNativeScroll`
- `src/pages/chat-room/scrollEdge.ts` — `shouldStickToBottomOnLayoutShrink`
- `jest.setup.js` — мок Gesture chainable + Native + FlatList
- `src/features/chat-future-peek/__tests__/useFuturePeekGesture.test.ts` — формулировка про native scroll composition
- `src/pages/chat-room/__tests__/scrollEdge.test.ts` — тесты stick-to-bottom
- `src/pages/chat-room/__tests__/futurePeekAcceptance.test.ts` — 6b keyboard stick + 6c peek anywhere at bottom
- `src/pages/chat-room/__tests__/futurePeekIntegration.test.ts` — keep armed при shrink viewport

## Принятые решения

- Гейт активации остаётся **edge-based** (`atBottom` / `atTop`), а не «только нижняя полоса экрана»: при `atEdge` pan может стартовать с любого ряда списка за счёт Native-композиции.
- Stick-to-bottom только при **уменьшении** `layoutHeight` и только если до этого уже были внизу — расширение viewport не форсирует низ.
- После активации pan блокируем native scroll, чтобы не было fight rubber-band vs scroll у края.

## Известные ограничения

- Поведение composition зависит от RNGH на устройстве: нужен ручной smoke на iOS/Android (длинная лента у низа → swipe вверх с середины видимых сообщений; то же с открытой клавиатурой; exit Future с top).
- Empty/short content по-прежнему опирается на `scrollEnabled={canListScroll(...)}` из предыдущего фикса — этот diff закрывает long-list / keyboard-layout case.

## Тестирование

- Unit/acceptance покрывают:
  - `shouldStickToBottomOnLayoutShrink` (shrink / grow / not at bottom)
  - keyboard shrink → peek остаётся armed
  - at bottom → entry gate без привязки к touch Y
  - экспорт entry/exit hooks с native scroll composition
- Рекомендуемый прогон: `npm test -- --testPathPattern='scrollEdge|futurePeek|useFuturePeekGesture' --no-coverage`
- Ручная проверка: чат внизу → pull Future с любого видимого сообщения; открыть клавиатуру → peek всё ещё доступен; Future at top → exit с любого ряда
