# Усиление виньетки и центрирование pinch

**Дата:** 2026-07-22
**Промпт/задача:** Сделать виньетку картинки в сообщении заметнее и устранить смещение полноэкранной картинки вниз после pinch-to-zoom.

## Что сделано
- Усилено затемнение краёв превью картинки в чате: центр остаётся прозрачным, максимальная opacity в углах увеличена до 0.36
- При старте pinch сбрасывается накопленный swipe-down offset контейнера
- Отменяются незавершённые анимации возврата контейнера и восстанавливается полная opacity фона
- Добавлены регрессионные проверки параметров виньетки и состояния контейнера на старте pinch

## Изменённые файлы
- `src/widgets/image-message/ImageMessage.tsx` — усиленные стопы SVG-виньетки
- `src/widgets/image-message/__tests__/ImageMessage.test.tsx` — ожидаемые параметры градиента
- `src/features/image-viewer/ImageViewer.tsx` — сброс dismiss-состояния перед pinch
- `src/features/image-viewer/viewerGestureState.ts` — состояние контейнера для старта pinch
- `src/features/image-viewer/__tests__/viewerGestureState.test.ts` — регрессионный тест центрирования
- `docs/bugs/image-viewer-blink-and-gestures.md` — описание причины и решения дефекта #7
- `docs/reports/2026-07-22-strengthen-vignette-fix-pinch-offset.md` — отчёт

## Принятые решения
- Виньетка применяется только в `ImageMessage`; полноэкранный `ImageViewer` не получает визуальных эффектов
- Смещение устраняется в момент активации pinch, до расчёта focal zoom
- Pixel-space radial-gradient сохранён, чтобы не вернуть дефект сплошной чёрной заливки

## Известные ограничения
- Визуальную интенсивность виньетки желательно проверить на светлом и тёмном изображениях на устройстве
- Ручная проверка pinch на физическом Android/iOS устройстве в рамках сессии не выполнялась

## Тестирование
- `npm test -- --runInBand src/features/image-viewer/__tests__/viewerGestureState.test.ts src/features/image-viewer/__tests__/useImageViewer.test.ts src/widgets/image-message/__tests__/ImageMessage.test.tsx src/__tests__/image-messages.integration.test.ts` — 4 suites, 26 тестов пройдено
- `npx eslint src/features/image-viewer/ImageViewer.tsx src/features/image-viewer/viewerGestureState.ts src/features/image-viewer/__tests__/viewerGestureState.test.ts src/widgets/image-message/ImageMessage.tsx src/widgets/image-message/__tests__/ImageMessage.test.tsx` — ошибок нет
- `git diff --check` — ошибок нет
