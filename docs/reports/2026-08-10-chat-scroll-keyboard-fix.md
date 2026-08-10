# Исправление: невозможность скролла к старым сообщениям при открытой клавиатуре

**Дата:** 2026-08-10
**Баг:** `docs/bugs/chat-cannot-scroll-older-messages-with-keyboard.md`
**Промпт/задача:** При открытой клавиатуре в чате нельзя проскроллить к сообщениям прошлых дней — история «обрезана» сверху. При свёрнутой клавиатуре скролл работает.

## Что сделано

- Выявлена корневая причина: на Android с `adjustNothing` анимированный `paddingBottom` на `chatArea` (через `useAnimatedStyle` / reanimated) сжимает viewport FlatList на UI-потоке. `onLayout` на `AnimatedFlatList` (`Animated.createAnimatedComponent(RNGH_FlatList)`) не срабатывает при изменении родительского padding через reanimated — JS-поток не получает уведомления об изменении layout.
- Без `onLayout` не вызывается `updateHistoryEdges` → `historyCanScroll` остаётся в stale-состоянии. Если до открытия клавиатуры контент помещался в viewport (`historyCanScroll = false`), `scrollEnabled={false}` блокирует скролл, хотя viewport уже сжат и контент переполняет экран.
- `scrollEnabled` изменён с `{historyCanScroll}` на `{historyCanScroll || keyboardOpen}`: при открытой клавиатуре скролл всегда разрешён, независимо от `historyCanScroll`.
- `pointerEvents` аналогично вычисляется с учётом `keyboardOpen`.
- Обновлена карточка бага: добавлена корневая причина, описание исправления, статус → `fixed`.

## Изменённые файлы

- `src/pages/chat-room/ChatRoomScreen.tsx:766-769` — `scrollEnabled` и `pointerEvents` учитывают `keyboardOpen`
- `docs/bugs/chat-cannot-scroll-older-messages-with-keyboard.md` — корневая причина, исправление, статус

## Принятые решения

- **Не менять логику `historyCanScroll` / `wrapHistoryNativeScroll` / `contentContainerStyle`** — они используются для Future Peek gesture, и их зависимость от `historyCanScroll` (а не `keyboardOpen`) корректна: при открытой клавиатуре entry peek отключён, поэтому stale `historyCanScroll = false` в этих местах безопасен.
- **Минимальный diff:** только `scrollEnabled` и `pointerEvents` получают `|| keyboardOpen`. Остальной layout и gesture-логика не затронуты.
- **Не увеличивать таймаут `scrollToBottom` / не добавлять `onLayout` на `chatArea`** — это борьба с симптомом, а не причиной. Корневая проблема — stale `historyCanScroll`, и она решена прямым разрешением скролла при открытой клавиатуре.

## Известные ограничения

- При очень коротком чате (1-2 сообщения) скролл будет разрешён при открытой клавиатуре, но скроллить некуда — визуально без изменений.
- Требуется ручная проверка на Android-устройстве: открыть чат с историей за несколько дней → открыть клавиатуру → проскроллить вверх до первого сообщения.

## Тестирование

- `npm test -- --testPathPattern='ChatRoomScreen|scrollEdge|futurePeek'` — 5 suites, 34 tests PASS
- `npx tsc --noEmit` — без ошибок в ChatRoomScreen
- `npx eslint src/pages/chat-room/ChatRoomScreen.tsx` — без новых ошибок (1 pre-existing warning)
