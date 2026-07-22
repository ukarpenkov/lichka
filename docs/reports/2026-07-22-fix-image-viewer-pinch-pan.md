# Плавные pinch и pan в ImageViewer

**Дата:** 2026-07-22
**Промпт/задача:** Устранить рывок изображения после pinch-to-zoom и случайный сброс увеличения до 1× при панорамировании картинки в чате.

## Что сделано
- Pan после pinch продолжает движение от текущей позиции без повторного применения накопленного смещения
- Для Android включён расчёт Pan относительно центра касаний через `averageTouches(true)`
- Одиночный тап увеличенного изображения больше не сбрасывает zoom; сброс по-прежнему доступен через double-tap
- Добавлены регрессионные тесты перехода pinch → pan и поведения single-tap
- Обновлено описание дефектов ImageViewer

## Изменённые файлы
- `src/features/image-viewer/ImageViewer.tsx` — rebasing Pan после pinch и безопасное поведение single-tap
- `src/features/image-viewer/viewerGestureState.ts` — чистые функции состояния жестов
- `src/features/image-viewer/__tests__/viewerGestureState.test.ts` — регрессионные unit-тесты
- `docs/bugs/image-viewer-blink-and-gestures.md` — причины и решение дефектов #5–#6
- `docs/reports/2026-07-22-fix-image-viewer-pinch-pan.md` — отчёт

## Принятые решения
- Накопленное `translationX/Y` Pan хранится отдельно и перебазируется в момент завершения pinch
- Single-tap при масштабе больше 1× игнорируется, чтобы короткое движение не приводило к неожиданному reset
- Математика перехода жестов вынесена в отдельный внутренний модуль feature-слайса

## Последующая проверка
- Дополнительный read-only анализ подтвердил обе исправленные первопричины: повторное применение накопленного Pan translation и конкурирующий single-tap reset
- Реализованные rebasing Pan и игнорирование single-tap при zoom покрывают описанные пользовательские сценарии; дополнительных изменений кода не требуется
- Snap к 1× после практически нулевого pinch (`scale <= 1.02`) оставлен как ожидаемая нормализация пограничного масштаба

## Известные ограничения
- Ручная проверка на физическом Android/iOS устройстве в рамках сессии не выполнялась
- Полный `tsc --noEmit` блокируется существующими ошибками в других модулях
- Полный Jest run блокируется существующей ошибкой мока `monoWeight` в `SeamlessDateChip.test.tsx`

## Тестирование
- `npm test -- --runInBand src/features/image-viewer/__tests__/viewerGestureState.test.ts src/features/image-viewer/__tests__/useImageViewer.test.ts` — 2 suites, 6 тестов пройдено
- `npm test -- --runInBand` — 33 suites пройдено, 1 несвязанная suite упала; 289 тестов пройдено
- `npx eslint src/features/image-viewer/ImageViewer.tsx src/features/image-viewer/viewerGestureState.ts src/features/image-viewer/__tests__/viewerGestureState.test.ts` — ошибок нет
- `git diff --check` — ошибок нет
