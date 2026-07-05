# Ревью staged-изменений: ImageViewer pinch-to-zoom fix

**Дата:** 2026-07-05
**Промпт/задача:** Проверить staged-изменения и оценить, будет ли работать pinch-to-zoom

## Что сделано

- Проведён ревью staged-диффа `src/features/image-viewer/ImageViewer.tsx`
- Проанализированы 3 корневые причины неработающего pinch-to-zoom

## Изменённые файлы

- `src/features/image-viewer/ImageViewer.tsx` — GestureHandlerRootView, maxPointers(1), runOnJS(resetZoom)
- `docs/reports/2026-07-05-image-viewer-pinch-zoom-fix.md` — отчёт об исправлении

## Анализ изменений

### 1. GestureHandlerRootView внутри Modal (строки 247-284)
Критическое исправление. Modal рендерится вне дерева приложения, без GestureHandlerRootView жесты RNGH не работают. Паттерн уже используется в DateTimePicker.

### 2. maxPointers(1) вместо maxPointers(2) на imagePanGesture (строка 149)
Pan с двумя пальцами конкурировал с Pinch. Теперь Pan только для 1 пальца — конфликт устранён.

### 3. runOnJS(resetZoom)(true) в pinchGesture.onEnd (строка 142)
Прямой вызов JS-функции из worklet ломал обработку жеста в новых версиях Reanimated.

## Вердикт

Pinch-to-zoom заработает. Все три изменения устраняют реальные корневые причины. Связка GestureHandlerRootView + maxPointers(1) + runOnJS — стандартное решение для этой проблемы в RNGH.

## Известные ограничения

- Ручная проверка на устройстве не выполнена — рекомендуется проверить перед мержем
- `dismiss` содержит двойной `runOnJS` — избыточно, но не ломает

## Тестирование

- ESLint: 0 ошибок
- Ревью кода: корректность подтверждена
- Ручное тестирование на устройстве: требуется
