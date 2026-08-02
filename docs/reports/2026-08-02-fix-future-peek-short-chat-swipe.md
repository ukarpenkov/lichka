# Fix: Future Peek свайп в коротком/односообщенном чате

**Дата:** 2026-08-02
**Промпт/задача:** Когда в чате одно сообщение или скроллить вниз некуда, свайп для переключения на Future блокируется и срабатывает только над клавиатурой. Если скролл невозможен, жест должен перехватываться по всей площади экрана.

## Что сделано

- Выявлена причина: при коротком/пустом чате `scrollEnabled={false}` уже отключал nested scroll, но `Gesture.Native` по-прежнему оборачивал `FlatList` и участвовал в touch arena, конкурируя с внешним `Gesture.Pan` Future Peek. Жест активировался только в «пустой» полосе над composer/клавиатурой.
- Добавлен хелпер `shouldAttachNativeScrollGesture(canScroll)` в `scrollEdge.ts`: Native↔Pan composition включается только когда список реально скроллится.
- History: обёртка `entryPeek.nativeGesture` через `wrapHistoryNativeScroll` — только при `historyCanScroll === true`.
- Future: `nativeScrollGesture` передаётся в `FutureTimeline` только при `futureCanScroll === true`; `wrapNativeScroll` не вешает `GestureDetector`, если scroll отключён.
- Обновлены JSDoc в `useFuturePeekGesture` и `FutureTimeline` — зафиксирована политика attach Native.
- Расширены acceptance/integration/unit-тесты на сценарии empty history, single-message chat, short vs overflowing list.

## Изменённые файлы

- `src/pages/chat-room/scrollEdge.ts` — `shouldAttachNativeScrollGesture`
- `src/pages/chat-room/ChatRoomScreen.tsx` — условная обёртка history FlatList, условный `nativeScrollGesture` для Future
- `src/pages/chat-room/FutureTimeline.tsx` — `wrapNativeScroll(..., scrollEnabled)`, empty state без Native
- `src/features/chat-future-peek/useFuturePeekGesture.ts` — уточнён контракт `nativeGesture`
- `src/pages/chat-room/__tests__/scrollEdge.test.ts` — тесты `shouldAttachNativeScrollGesture`
- `src/pages/chat-room/__tests__/futurePeekIntegration.test.ts` — short vs overflowing composition
- `src/pages/chat-room/__tests__/futurePeekAcceptance.test.ts` — single-message chat scenario

## Принятые решения

- Не менять логику гейта `canActivatePeekGesture` / `atBottom` — проблема была в touch ownership, а не в edge detection.
- Сохранить Native↔Pan composition для **длинных** лент у края (фикс 2026-07-31): при `canScroll === true` поведение не меняется.
- Для short/empty списков outer Pan владеет всей `listPane` без nested Native — минимальный diff без замены FlatList на отдельный empty View.
- `shouldAttachNativeScrollGesture` — тонкая обёртка над `canScroll`, чтобы политика была явной и тестируемой.

## Известные ограничения

- На устройстве возможен residual конфликт с RN `Pressable` в `MessageLine` при long-press на строке сообщения — не входит в этот diff; основной кейс (swipe по всей площади при невозможности scroll) закрыт снятием Native wrapper.
- Поведение composition по-прежнему зависит от RNGH на iOS/Android для **скроллируемых** лент — нужен smoke на длинном чате у низа и с открытой клавиатурой.

## Тестирование

- `npm test -- --testPathPattern='scrollEdge|futurePeek|FutureTimeline|chat-future-peek' --no-coverage` — PASS (6 suites, 48 tests)
- Покрыто:
  - `shouldAttachNativeScrollGesture(false|true)`
  - empty history + single-message chat → peek armed, Native не attach
  - overflowing list at bottom → Native composition сохраняется
- Рекомендуемая ручная проверка:
  - чат с 1 сообщением → swipe up с любой точки ленты → Future
  - пустой history с scheduled → swipe up → Future
  - длинная лента внизу → swipe up с видимого сообщения → Future (регрессия 2026-07-31)
