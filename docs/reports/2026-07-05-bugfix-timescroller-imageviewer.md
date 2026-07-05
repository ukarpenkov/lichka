# Исправление багов: TimeScroller + ImageViewer

**Дата:** 2026-07-05
**Промпт/задача:** Исправить два бага после доработок:
1. ImageViewer — pinch-to-zoom не работает
2. TimeScroller — зацикливание сломало определение времени (выделяется не тот час)

## TimeScroller — баг с offset

### Причина

При переходе от null-паддинговой модели к three-copy модели, `dataIdxForHour(h)` возвращал `MIDDLE_COPY * HOUR_COUNT + h`, а `scrollToOffset(offset * ITEM_HEIGHT)` позиционирует элемент на верхнюю границу видимой области (offset 0). Но highlight (визуальный индикатор выбранного элемента) находится на 1 позицию ниже — на `top: ITEM_HEIGHT`.

Из-за этого элемент с индексом `24 + h` оказывался **на верхней строке**, а не на highlight. Подсветка падала на элемент `h + 1` вместо `h`.

Пример: для `hour = 5`:
- Старый код: offset = `(24 + 5) * 46 = 1334` → элемент 5 вверху, элемент 6 на highlight ✗
- Новый код: offset = `(24 + 5 - 1) * 46 = 1288` → элемент 4 вверху, элемент 5 на highlight ✓

### Исправление

1. `dataIdxForHour` → `MIDDLE_COPY * HOUR_COUNT + h - 1` (отступ на 1 вверх)
2. `dataIdxForMinute` → `MIDDLE_COPY * MIN_COUNT + m - 1`
3. `normalizeHour/Minate` → `(Math.round(dataIdx + 1) % COUNT + COUNT) % COUNT` — компенсация +1 в обратном преобразовании

## ImageViewer — pinch-to-zoom не работает

### Причина 1: конфликт жестов

Внешний GestureDetector (overlay) имел `Gesture.Exclusive(Tap, Pan)`, где `Pan` не имел ограничений по количеству пальцев. При 2-пальцевом pinch-жесте на картинке:
1. Внешний `Pan` активировался первым (без maxPointers)
2. Это блокировало внутренний `Pinch + Pan` в Simultaneous-композиции
3. Pinch-жест не получал события → зум не работал

### Причина 2: обрезка увеличенного изображения

`imageWrapper` имел `overflow: 'hidden'`. При масштабировании через `transform: [{ scale }]`, GPU-трансформ применяется после клиппинга — увеличенная картинка обрезалась по границам wrapper'а.

### Причина 3: dismiss при начале pinch

Внутренний `imagePanGesture` при `scale = 1` активировал dismiss (свайп вниз). В момент начала pinch-а scale ещё равен 1, и Pan-жест начинал двигать контейнер вниз — визуальный артефакт «съезжания».

### Исправления

1. Добавлено `.maxPointers(1)` на `backgroundPanGesture` — внешний жест не захватывает 2-пальцевые касания
2. Убран `overflow: 'hidden'` с `imageWrapper`
3. В `imagePanGesture`: dismiss только когда `e.numberOfPointers < 2` (1 палец), иначе жест игнорируется (позволяет Pinch работать без помех)

## Изменённые файлы

- `src/widgets/datetime-picker/TimeScroller.tsx` — исправлены `dataIdxForHour`, `dataIdxForMinute`, `normalizeHour`, `normalizeMinute`
- `src/features/image-viewer/ImageViewer.tsx` — `maxPointers(1)` на backgroundPanGesture, убран `overflow: hidden`, проверка `numberOfPointers` в imagePanGesture

## Тестирование

- TypeScript: `npx tsc --noEmit` — 0 ошибок в изменённых файлах
- ESLint: 0 errors (только pre-existing warning за inline styles в TimeScroller)
- Ручное тестирование требуется:
  - TimeScroller: проверить, что зацикливание 23→00, 59→00 работает, и выделяется правильное значение
  - ImageViewer: проверить pinch-to-zoom, двойной тап, свайп-вниз для dismiss
