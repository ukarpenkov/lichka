# Мягкая виньетка картинки в сообщении

**Дата:** 2026-07-22
**Промпт/задача:** Добавить небольшую виньетку на картинку в сообщении чата, не применяя её в полноэкранном просмотре.

## Что сделано
- Настроено плавное затемнение краёв и углов превью картинки в сообщении
- Центр изображения оставлен полностью прозрачным
- Полноэкранный `ImageViewer` не изменялся и продолжает показывать оригинал без виньетки
- Тест фиксирует точки и прозрачность SVG-градиента

## Изменённые файлы
- `src/widgets/image-message/ImageMessage.tsx` — мягкие стопы radial-gradient для превью
- `src/widgets/image-message/__tests__/ImageMessage.test.tsx` — проверка параметров виньетки
- `docs/reports/2026-07-22-tune-chat-image-vignette.md` — отчёт

## Принятые решения
- Эффект реализован внутри `ImageMessage`, поэтому не затрагивает feature `image-viewer`
- Максимальная прозрачность чёрного слоя ограничена 0.26 только в самых дальних краях
- Сохранён pixel-space gradient, чтобы не вернуть дефект сплошного чёрного превью

## Известные ограничения
- Точная визуальная интенсивность зависит от пропорций изображения

## Тестирование
- `npm test -- --runInBand src/widgets/image-message/__tests__/ImageMessage.test.tsx src/__tests__/image-messages.integration.test.ts` — 2 suites, 19 тестов пройдено
- `npx eslint src/widgets/image-message/ImageMessage.tsx src/widgets/image-message/__tests__/ImageMessage.test.tsx` — ошибок нет
- `git diff --check` — ошибок нет
