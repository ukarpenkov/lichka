# Theme-pixel avatar вместо контурного MVP

**Дата:** 2026-07-22  
**Промпт/задача:** Внедрить theme-pixel (выход из бага `pixel-avatar-contour-mush`), затем по фидбеку на реальном фото — больше оттенков и мягче пикселизация.

## Что сделано

- Контурный Sobel-пайплайн заменён на **theme-pixel**: center crop → box downsample → luminance quantize → duotone-ramp темы → NN upscale.
- API: `createThemePixelAvatar` / `FromBytes` / `FromBase64`, `processThemePixelBuffer` (+ deprecated contour aliases).
- `ChatForm` передаёт `background` + `text` из `useTheme`.
- `Avatar`: подложка PNG = theme `background`.
- Баг → **resolved**; proposal `theme-pixel-avatar`; contour proposal → rejected.

### Тюнинг по фидбеку (duotone «как ЧБ», но черно-зелёный)

На green-on-black фото ребёнка давало ~4 плоских бэнда и крупную сетку (~40) + инверсию (светлая кожа → чёрный).

| Параметр | Было | Стало |
|----------|------|-------|
| `pixelGrid` | 40 (32–48) | **96** (64–128) — лёгкая пиксельность |
| `posterizeLevels` | 4 (2–4) | **16** (8–32) — много оттенков |
| `contrast` | 1.35 | **1.1** — мягче midtones |
| `outputSize` | 224 | **256** |
| Ramp | светлый→bg, тёмный→text | **тёмный→более тёмный цвет темы, светлый→более светлый** (phosphor: чёрный→зелёный) |

## Изменённые файлы

- `src/features/pixel-avatar/model/types.ts`
- `src/features/pixel-avatar/model/processThemePixelBuffer.ts` — `themeRampEnds` + алгоритм
- `src/features/pixel-avatar/model/createThemePixelAvatar.ts`
- `src/features/pixel-avatar/index.ts`
- `src/features/pixel-avatar/__tests__/processThemePixelBuffer.test.ts`
- `src/widgets/chat-form/ChatForm.tsx`
- `src/shared/ui/Avatar.tsx`, `__tests__/Avatar.test.tsx`
- `src/shared/lib/mediaPath.ts`
- `docs/features/theme-pixel-avatar-proposal.md`
- `docs/features/pixel-contour-avatar-proposal.md`
- `docs/bugs/pixel-avatar-contour-mush.md`
- `docs/reports/2026-07-22-theme-pixel-avatar-fix.md`

## Принятые решения

- Won't-fix contour MVP; цель — duotone-фото в палитре темы, не GameBoy ink.
- Цвета запекаются при pick (live re-tint — later).

## Известные ограничения

- Смена темы не перекрашивает сохранённые PNG.
- Center crop без face-detect.
- Переснять аватар в форме, чтобы увидеть новый пайплайн.

## Тестирование

- Unit (16): crop/downsample/upscale, palette-only, green-on-black polarity (bright→green), mild defaults, PNG/JPEG.
- `./node_modules/.bin/jest src/features/pixel-avatar` — PASS.
