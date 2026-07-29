# Fix: свайп в Future из пустого чата

**Дата:** 2026-07-29
**Промпт/задача:** Если чат пустой, но есть future — переход свайпом не срабатывает

## Что сделано

- Выявлена причина: пустой / короткий `FlatList` всё равно держит nested `ScrollView`, который перехватывает вертикальный pan и не отдаёт его entry-жесту Future Peek.
- Добавлен хелпер `canListScroll` в `scrollEdge`: контент короче viewport → список не считается скроллируемым.
- В `ChatRoomScreen` для истории и Future: `scrollEnabled` включается только когда `canListScroll === true`.
- В `FutureTimeline` прокинут проп `scrollEnabled` на `FlatList` (empty state по-прежнему plain `View`).
- Добавлены unit/acceptance-тесты на empty/short content и gate жеста.

## Изменённые файлы

- `src/pages/chat-room/scrollEdge.ts` — `canListScroll`
- `src/pages/chat-room/ChatRoomScreen.tsx` — `historyCanScroll` / `futureCanScroll`, `scrollEnabled` на списках
- `src/pages/chat-room/FutureTimeline.tsx` — проп `scrollEnabled`
- `src/pages/chat-room/__tests__/scrollEdge.test.ts` — тесты `canListScroll`
- `src/pages/chat-room/__tests__/futurePeekAcceptance.test.ts` — сценарий empty history → peek
- `src/pages/chat-room/__tests__/futurePeekIntegration.test.ts` — scroll disabled на empty history

## Принятые решения

- Не заменять пустой history `FlatList` на отдельный empty View (как в Future): достаточно отключить scroll, пока контент не overflow — жест получает pan, при появлении длинной ленты скролл снова включается.
- Та же логика для короткого Future-списка, чтобы exit-свайп не блокировался nested scroll.

## Известные ограничения

- Конфликт pan + nested scroll при **длинной** ленте у края (overscroll при `scrollEnabled=true`) по-прежнему может потребовать тонкой настройки composition жестов — этот фикс закрывает empty/short case.
- Ручная проверка на устройстве желательна: пустой чат с scheduled → swipe up → Future.

## Тестирование

- `npm test -- --testPathPattern='scrollEdge|futurePeek|FutureTimeline|chat-future-peek'` — PASS (6 suites, 40 tests)
- Покрыто: empty/short = not scrollable + atBottom; overflowing = scrollable; acceptance empty history peek gate
