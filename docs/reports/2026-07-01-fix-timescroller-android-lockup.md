# Fix: блокировка TimeScroller после 5-6 изменений (Android)

**Дата:** 2026-07-01
**Промпт/задача:** Баг-репорт: пикер времени перестаёт реагировать на жесты после 5–6 последовательных изменений часов/минут на Android

## Что сделано
- Устранена причина блокировки FlatList в `TimeScroller.tsx` после повторных скроллов

## Изменённые файлы
- `src/widgets/datetime-picker/TimeScroller.tsx` — исправлен `useEffect`, форсировавший `scrollToIndex` на каждый change prop

## Принятые решения
- **Root cause:** `useEffect` вызывал `scrollToIndex(hourListRef, hour, false)` при каждом изменении `hour`/`minute`. Когда пользователь скроллил, `handleHourScroll` уже обновлял `lastHourIdx.current`, затем `handleHourScrollEnd` вызывал `onHourChange` → `setHour` → ре-рендер → `useEffect` дёргал `scrollToIndex` без анимации. Эта конкурентная программная прокрутка сбивала внутреннее состояние жестовой системы FlatList на Android.
- **Fix:** `scrollToIndex` в `useEffect` теперь вызывается только когда `lastHourIdx.current !== hour` — то есть только при внешнем изменении значения, а не при пользовательском скролле (который уже обновил `lastHourIdx.current` через `handleHourScroll`).

## Известные ограничения
- Двойной вызов `handleHourScrollEnd` из `onMomentumScrollEnd` + `onScrollEndDrag` сохраняется (iOS fallback), но перестал быть опасным, т.к. `useEffect` больше не конкурирует.

## Тестирование
- TypeScript-проверка: `tsc --noEmit` — ошибок нет
- ESLint: только pre-existing warnings по inline styles, новых ошибок нет
