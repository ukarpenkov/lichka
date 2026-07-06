# Исправление позиционирования и подсветки выбранного времени в TimeScroller

**Дата:** 2026-07-06
**Промпт/задача:** Баг — некорректная работа TimeScroller с позиционированием и подсветкой
выбранного времени: минуты смещены относительно центра и не попадают в голубую область выбора,
для часов голубым подсвечивается предыдущее значение вместо текущего.

## Что сделано

Приведена к единому непротиворечивому виду индексная модель центрирования и подсветки.
Накопленные три off-by-one поправки (`-1` в `dataIdxForHour` от `ee328c2`, `(dataIdx - 1)` в
`scrollToDataIndex` от `f888ab7`, и `centerHourIdx = idx` из staged-изменений) взаимно
компенсировались/конфликтовали, из-за чего в голубую область выбора попадал `h - 1`, а голубой
цвет — элемент верхней строки.

Точечные правки (6 строк):

- `dataIdxForHour` → `MIDDLE_COPY * HOUR_COUNT + h` (убран `-1`).
- `dataIdxForMinute` → `MIDDLE_COPY * MIN_COUNT + m` (убран `-1`).
- `handleHourScroll` / `handleHourScrollEnd` → `setCenterHourIdx(idx + 1)` (центральная строка = верх + 1).
- `handleMinuteScroll` / `handleMinuteScrollEnd` → `setCenterMinIdx(idx + 1)`.

`normalizeHour`/`normalizeMinute` (`(idx + 1) % N`), `scrollToDataIndex` (`(dataIdx - 1) * H`),
`recenter*` и `handleHourPress`/`handleMinutePress` не менялись — они корректны в рамках
приведённой модели.

## Изменённые файлы

- `src/widgets/datetime-picker/TimeScroller.tsx` — 6 точечных правок (dataIdxForHour/Minute, setCenterHourIdx/MinIdx в 4 обработчиках скролла).
- `docs/bugs/timescroller-center-position-and-highlight.md` — описание бага.

## Принятые решения

- Выбрана минимальная правка, приводящая к одной непротиворечивой модели, вместо отката к
  value-подсветке `item === hour` (которая была в `ee328c2`). Индексная подсветка через
  `centerHourIdx` даёт живой отклик во время скролла (до обновления prop `hour`/`minute`
  через `onHourChange`), что предпочтительнее value-подсветки, зависящей от родительского state.
- `normalizeHour`/`normalizeMinute` сохранены: `+1` корректно отражает связь «центральная
  строка = верхняя + 1» при `highlight` на `top: ITEM_HEIGHT * 1`.
- Guard `if (centered !== dataIdx)` в `recenter*` оставлен как есть: он «всегда истинен»
  (off-by-one), но в средней копии скроллит в ту же позицию (no-op), а при уходе в крайние
  копии корректно возвращает в середину. Изменение guard на `centered !== dataIdx + 1` выглядело
  бы чище, но выходит за рамки бага и не несёт поведенческой пользы.

## Известные ограничения

- Поведение проверяется только статикой; ручная проверка на устройстве обязательна
  (зацикливание 23→00, 59→00, точное центрирование, живая подсветка при скролле).
- Тестов на `TimeScroller` нет (см. предыдущие отчёты).

## Тестирование

- TypeScript: `npx tsc --noEmit` — в `TimeScroller.tsx` ошибок нет. Ошибки в других файлах
  (`AlarmScreen.tsx`, `MessageBubble.test.tsx`, `ScheduledItem.tsx`, `imageCompress.ts`,
  `AlertDialog.tsx`, `ImageMessage.test.tsx`) — pre-existing, не связаны с правкой.
- ESLint: `npx eslint src/widgets/datetime-picker/TimeScroller.tsx` — 0 ошибок, 1 pre-existing
  warning `react-native/no-inline-styles` (не связан с изменением).
