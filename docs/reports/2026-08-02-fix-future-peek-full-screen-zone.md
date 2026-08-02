# Fix: Future Peek зона свайпа по всей chatArea (включая composer и клавиатуру)

**Дата:** 2026-08-02
**Промпт/задача:** Зона свайпа на Future всё равно выше зоны клавиатуры; когда экран внутри чата пролистан до последнего сообщения, следующий вайп снизу вверх должен переходить в Future с любой точки chatArea, а не только с полосы над composer.

## Что сделано

- **Предыдущий фикс** уже отключал `Gesture.Native` для коротких лент, но зона pan всё равно была ограничена `listPane` — `MessageComposer` стоял рядом с `GestureDetector` и перехватывал касания.
- **Расширил зону жеста** до всей `chatArea`: внешний `GestureDetector` теперь оборачивает и список, и `MessageComposer` (history-режим).
- **Composer подключён к Native-композиции** через `composerNativeGesture` и `wrapComposerNativeScroll` — peek pan работает одновременно с `TextInput`/кнопками composer, когда peek armed (`atBottom`).
- **Перевёл ввод composer на GH TextInput** (`react-native-gesture-handler`) и обёртку `pointerEvents="box-none"`, чтобы пустые/фоновые касания не блокировали pan.
- **MessageLine и AnimatedPressable** переведены на `Pressable` из `react-native-gesture-handler` — строки сообщений больше не выбивают родительский pan из touch arena.
- **Для коротких/нескроллируемых списков** FlatList получает `pointerEvents="box-none"` и `contentContainerStyle` с `flexGrow` + `pointerEvents: box-none` — пустой viewport не перехватывает касания.
- **FutureTimeline** поддерживает `listPointerEvents` и non-scrollable content style для того же поведения на Future-стороне.
- **Добавлены тесты** на сценарий: long history → scroll to bottom → следующий pull-up → Future; на pointer-events и native-composition helpers.

## Изменённые файлы

- `src/pages/chat-room/ChatRoomScreen.tsx` — `GestureDetector` на `chatArea`, `peekHost`, `composerNativeGesture`, `wrapComposerNativeScroll`, `getListPointerEvents`/`getNonScrollableListContentStyle` для истории
- `src/features/chat-future-peek/useFuturePeekGesture.ts` — поддержка `extraNativeGestures` и `composerNativeGesture` в entry hook, композиция pan с несколькими Native
- `src/widgets/message-composer/MessageComposer.tsx` — `TextInput` из RNGH, `pointerEvents="box-none"` на контейнере
- `src/pages/chat-room/MessageLine.tsx` — `Pressable` из RNGH
- `src/shared/ui/AnimatedPressable.tsx` — `Pressable` из RNGH
- `src/pages/chat-room/FutureTimeline.tsx` — проп `listPointerEvents`, non-scrollable content style
- `src/pages/chat-room/scrollEdge.ts` — `getListPointerEvents`, `getNonScrollableListContentStyle`
- `src/pages/chat-room/__tests__/futurePeekAcceptance.test.ts` — сценарий scroll-to-end → next pull-up → Future
- `src/pages/chat-room/__tests__/scrollEdge.test.ts` — тесты pointer-events helpers
- `jest.setup.js` — моки `Pressable` и `TextInput` из RNGH

## Принятые решения

- Не ломаем layout chatArea / composer / keyboard: composer остаётся flex-sibling, `paddingBottom` по-прежнему обрабатывается через `chatAreaAnimatedStyle`.
- Жест вешаем на общий контейнер `chatArea`, а не на отдельный overlay — так pan получает касания от любых children, включая ввод и кнопки.
- `pointerEvents="box-none"` на composer используем только внутри обёртки `GestureDetector` (иначе кнопки в composer перестанут быть clickable); за счёт GH pressables и GH TextInput внутри обёртки клики работают, а свайпы уходят в pan.
- Для длинной ленты Native↔Pan composition остаётся (FlatList Native + composer Native), чтобы скролл и пан жили одновременно у края.
- Для short/empty ленты Native-обёртка FlatList не вешается (предыдущий фикс), а content-container пропускает касания — outer pan захватывает всё.

## Известные ограничения

- Область самой системной клавиатуры (OS overlay) по-прежнему недоступна для RN-жеста — это платформенное ограничение.
- Шапка чата (`ChatHeader`) не входит в зону жеста, поэтому свайп по заголовку не переключает Future — это ожидаемое поведение.
- На устройстве может быть тонкий residual conflict между `Pressable` внутри `MessageLine` и паном, если long-press задерживает активацию pan — потребуется ручная проверка.

## Тестирование

- `npm test -- --testPathPattern='scrollEdge|futurePeek|FutureTimeline|MessageLine|chat-future-peek|MessageComposer' --no-coverage` — PASS (8 suites, 63 tests)
- Покрыто:
  - scroll-to-end → next pull-up → Future
  - short/empty list: pan owns full pane
  - long list: Native composition kept
  - non-scrollable pointer-events helpers
  - MessageComposer и MessageLine рендерятся после перехода на GH pressables
- Ручные проверки:
  - Длинный чат → скролл до последнего сообщения → swipe up с любой точки списка (в том числе с последнего сообщения) → Future
  - Swipe up из поля ввода и с кнопок composer → Future
  - То же с открытой клавиатурой (composer над клавиатурой)
  - Future → swipe down с любой точки (кроме шапки) → history
