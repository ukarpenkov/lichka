# Фикс белой линии и виньетки у превью картинок в чате

**Дата:** 2026-07-22
**Промпт/задача:** У превью картинок в чате снизу белая линия; виньетка с жёстким тёмным овалом — сделать равномернее, темнее в углах.

## Что сделано
- Убрана субпиксельная высота/ширина кадра (`Math.round`) — дробные bounds + `overflow: 'hidden'` + `borderRadius` давали 1px щель
- Картинка растянута с 1px bleed за край клипа (`absoluteFill` с inset `-1`)
- У кадра тёмный `backgroundColor: '#000'`, чтобы AA-шов не подсвечивался canvas `#FAFAFA`
- Виньетка: вместо одного center radial (жёсткое овальное кольцо) — 4 мягких радиала из углов; максимум затемнения в углах, к центру прозрачно

## Изменённые файлы
- `src/widgets/image-message/ImageMessage.tsx` — анти-hairline клип + corner vignette
- `src/widgets/image-message/__tests__/ImageMessage.test.tsx` — размеры с frame; тест на bleed

## Принятые решения
- Эффект только в ленте (`ImageMessage`); fullscreen `ImageViewer` не трогали
- Corner gradients вместо center radial — без «ореола», ближе к фото-виньетке
- Opacity ~0.42 в углу, мягкий спад — без прежних 0.72 и резкого скачка на 65%

## Известные ограничения
- Bleed обрезает ~1px по периметру исходника в превью (незаметно при cover)
- На очень широких/высоких кадрах mid-edge чуть светлее углов (ожидаемо для corner vignette)

## Тестирование
- `npm test -- --testPathPattern='image-message' --no-coverage` — 18 passed
