# Исправление crash при прокрутке кольца дня в DateTimePicker

**Дата:** 2026-05-31
**Промпт/задача:** Ошибка `[Worklets] Tried to synchronously call a non-worklet function 'dayStep' on the UI thread` при вращении кольца дня в datepicker.

## Что сделано
- В функцию `dayStep` добавлена директива `'worklet'`, чтобы её можно было вызывать из gesture handlers (`onTouchesDown`, `onTouchesMove`, `onTouchesUp`) на UI-потоке Reanimated.

## Изменённые файлы
- `src/widgets/datetime-picker/DateTimePicker.tsx` — `dayStep` помечена как worklet.

## Принятые решения
- Оставлена отдельная функция `dayStep` (а не инлайн `360 / count`), чтобы не дублировать формулу в трёх местах жеста и в `useEffect`.
- `MONTH_STEP` — константа, вызывается без функции; менять не требуется.

## Известные ограничения
- Ручная проверка на устройстве/симуляторе не выполнялась в этой сессии.

## Тестирование
- Автотестов для `DateTimePicker` нет; рекомендуется открыть picker и прокрутить кольцо дня — crash не должен воспроизводиться.
