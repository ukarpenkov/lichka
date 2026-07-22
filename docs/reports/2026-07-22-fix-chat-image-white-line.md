# Фикс белой линии и виньетки у превью картинок в чате

**Дата:** 2026-07-22
**Промпт/задача:** У превью картинок в чате снизу белая линия; виньетка с жёстким тёмным овалом — сделать равномернее, темнее в углах. После 4 corner-overlays превью стало абсолютно чёрным — откатить/исправить.

## Что сделано
- Убрана субпиксельная высота/ширина кадра (`Math.round`) — дробные bounds + `overflow: 'hidden'` + `borderRadius` давали 1px щель
- Картинка растянута с 1px bleed за край клипа (`absoluteFill` с inset `-1`)
- У кадра тёмный `backgroundColor: '#000'`, чтобы AA-шов не подсвечивался canvas `#FAFAFA`
- Виньетка: один мягкий radial `rx/ry=92%` с плавными стопами (0 → 0.1 → 0.28 → 0.48); углы темнее за счёт расстояния от центра, без жёсткого кольца
- Откат 4 corner-overlays — на RN SVG они заливали превью почти чёрным

## Изменённые файлы
- `src/widgets/image-message/ImageMessage.tsx` — анти-hairline клип + soft center vignette
- `src/widgets/image-message/__tests__/ImageMessage.test.tsx` — размеры с frame; тест на bleed

## Принятые решения
- Эффект только в ленте (`ImageMessage`); fullscreen `ImageViewer` не трогали
- Soft large-radius center radial вместо corner stack — совместимо с react-native-svg и читаемо
- Макс. opacity 0.48 (было 0.72) — без «дырки» по центру

## Известные ограничения
- Bleed обрезает ~1px по периметру исходника в превью (незаметно при cover)
- Mid-edge чуть светлее углов (геометрия center radial) — ожидаемо

## Тестирование
- `npm test -- --testPathPattern='image-message' --no-coverage` — 18 passed
