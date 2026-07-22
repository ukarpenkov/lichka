# Фикс чёрных превью картинок в чате

**Дата:** 2026-07-22
**Промпт/задача:** Картинки в чате чёрные / не видны после правок виньетки и белой линии.

## Что сделано
- Убран чёрный `backgroundColor: '#000'` у кадра — при проблемах с отрисовкой Image он давал сплошной чёрный прямоугольник
- Картинке снова заданы явные `width`/`height` (+1px bleed через margin), вместо `absoluteFill` без размеров
- Виньетка переведена на `gradientUnits="userSpaceOnUse"` с пиксельным радиусом — процентные `rx/ry` в RN SVG часто заливали весь кадр чёрным
- Ослаблены стопы виньетки (макс. opacity ~0.22), центр полностью прозрачный

## Изменённые файлы
- `src/widgets/image-message/ImageMessage.tsx` — видимое превью + безопасная виньетка
- `src/widgets/image-message/__tests__/ImageMessage.test.tsx` — bleed и отсутствие чёрного фона кадра

## Принятые решения
- Анти-hairline через bleed картинки, без чёрной подложки
- Pixel-space radial вместо percentage gradient — совместимость с react-native-svg
- Fullscreen `ImageViewer` не трогали

## Известные ограничения
- Если AA-шов белой линии вернётся на каком-то устройстве — смотреть bleed / integer bounds, не возвращать `#000` underlay

## Тестирование
- `npm test -- --testPathPattern='image-message' --no-coverage` — 19 passed
