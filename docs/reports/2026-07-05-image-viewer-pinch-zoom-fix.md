# Исправление pinch-to-zoom в ImageViewer

**Дата:** 2026-07-05
**Промпт/задача:** Пинч ту зум не работает при просмотре изображений

## Что сделано

- Добавлен `GestureHandlerRootView` внутрь `Modal` — Modal рендерится вне основного дерева приложения, без отдельного root-view жесты RNGH не работают (паттерн уже используется в `DateTimePicker`)
- Изменён `imagePanGesture`: `maxPointers(1)` вместо `maxPointers(2)` — Pan с двумя пальцами конкурировал с Pinch за те же touch-события
- Исправлен вызов `resetZoom` в `pinchGesture.onEnd` через `runOnJS` — прямой вызов JS-функции из worklet мог ломать обработку жеста

## Изменённые файлы

- `src/features/image-viewer/ImageViewer.tsx` — GestureHandlerRootView, maxPointers(1) на pan, runOnJS для resetZoom

## Принятые решения

- Оставлена вложенная структура GestureDetector (outer: tap/dismiss фона, inner: pinch/pan/double-tap на картинке) — достаточно точечных правок без рефакторинга композиции жестов
- Dismiss свайпом остаётся только для одного пальца; pinch всегда использует два

## Известные ограничения

- Ручная проверка на устройстве/эмуляторе не выполнялась в этой сессии

## Тестирование

- ESLint: 0 ошибок в `ImageViewer.tsx`
- Ручное тестирование:
  - Открыть картинку в чате → pinch-to-zoom 1x–5x
  - Double-tap 1x ↔ 2x
  - Свайп вниз одним пальцем → dismiss
  - Pan при zoom > 1x
