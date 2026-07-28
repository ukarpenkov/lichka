# Fix: краш при открытии чата (PEEK_RUBBER_BAND_MAX)

**Дата:** 2026-07-28
**Промпт/задача:** Приложение падает на открытии чата — `ReferenceError: Property 'PEEK_RUBBER_BAND_MAX' doesn't exist` в Reanimated worklet

## Что сделано
- Исправлен доступ к модульным константам в worklet-функциях `peekGestureState.ts`
- Default-параметры вида `max = PEEK_RUBBER_BAND_MAX` заменены на optional + разрешение через `??` внутри тела worklet
- То же для `PEEK_THRESHOLD` в `getPeekPhase` / `isPastThreshold`

## Изменённые файлы
- `src/features/chat-future-peek/peekGestureState.ts` — defaults перенесены из параметра в тело worklet

## Принятые решения
- Причина: Reanimated/Hermes не захватывает модульные константы из default-параметров на UI-thread; при `useAnimatedStyle` → `getRubberBandTranslateY` константа отсутствовала
- Паттерн как в уже корректном `shouldCommitPeek` (`options?.x ?? CONST`): `??` внутри тела worklet — babel-плагин захватывает closure
- Поведение и публичный API функций не менялись

## Известные ограничения
- Фикс проверен unit-тестами; ручная проверка на устройстве — после перезапуска приложения

## Тестирование
- `npm test -- --testPathPattern=chat-future-peek` — PASS (2 suites, 18 tests)
