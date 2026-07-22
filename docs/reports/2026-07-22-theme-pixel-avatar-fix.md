# Theme-pixel avatar вместо контурного MVP

**Дата:** 2026-07-22  
**Промпт/задача:** По staged-изменениям на `feat/pixel-avatar` — зафиксировать внедрение theme-pixel (выход из бага `pixel-avatar-contour-mush`).  
**Scope staged:** 15 файлов, +642 / −632

## Что сделано

- Контурный Sobel-пайплайн заменён на **theme-pixel**: center crop → box downsample (сетка 32–48) → luminance posterize (2–4 уровня) → lerp палитры темы (`background` ↔ `text`) → nearest-neighbor upscale.
- Новый API: `createThemePixelAvatar` / `FromBytes` / `FromBase64`, `processThemePixelBuffer`.
- Старые имена `createPixelContourAvatar*` / `processPixelContourBuffer` оставлены как deprecated aliases.
- `ChatForm` при генерации передаёт `background` + `text` из `useTheme`.
- `Avatar`: подложка PNG = theme `background` (вместо белой пластины под контур).
- Баг `pixel-avatar-contour-mush` → **resolved** (won't-fix contour MVP).
- Proposal: `theme-pixel-avatar` (implemented); contour proposal → rejected / superseded.

## Изменённые файлы (staged)

### Код
- `src/features/pixel-avatar/model/types.ts` — опции `background` / `text` / `posterizeLevels`; убраны `colorMode`, `edgeKeepFraction`, `whiteBackground`
- `src/features/pixel-avatar/model/processThemePixelBuffer.ts` — новый алгоритм (+ alias contour)
- `src/features/pixel-avatar/model/createThemePixelAvatar.ts` — rename/оркестрация decode → process → encode
- `src/features/pixel-avatar/index.ts` — публичные экспорты theme-pixel + deprecated aliases
- `src/features/pixel-avatar/__tests__/processThemePixelBuffer.test.ts` — unit-тесты нового пайплайна
- `src/widgets/chat-form/ChatForm.tsx` — вызов `createThemePixelAvatarFromBytes` с цветами темы
- `src/shared/ui/Avatar.tsx` — plate = `background`
- `src/shared/ui/__tests__/Avatar.test.tsx` — mock `useTheme` с `background`
- `src/shared/lib/mediaPath.ts` — комментарий к `saveAvatarPng`

### Удалено
- `src/features/pixel-avatar/model/processPixelContourBuffer.ts`
- `src/features/pixel-avatar/__tests__/processPixelContourBuffer.test.ts`

### Документация
- `docs/bugs/pixel-avatar-contour-mush.md` — статус resolved + блок «Внедрено»
- `docs/features/theme-pixel-avatar-proposal.md` — новый proposal
- `docs/features/pixel-contour-avatar-proposal.md` — rejected / архив
- `docs/reports/2026-07-22-theme-pixel-avatar-fix.md` — этот отчёт

## Принятые решения

- Won't-fix контурный MVP без face ROI; цель «как GameBoy ink-референс» снята с scope.
- Цвета запекаются в PNG в момент выбора фото (live re-tint при смене темы — later).
- Default: `pixelGrid=40`, `posterizeLevels=4`, `outputSize=224` — «чуть пиксельно», не 16×16.

## Известные ограничения

- Смена темы не перекрашивает уже сохранённые аватары.
- Center crop без face-detect: на широких кадрах лицо может быть не в центре.
- Контурный режим отложен до face-detect.

## Тестирование

- Unit: crop, downsample, NN upscale, posterize, palette-only pixels, opaque fill, PNG/JPEG decode, Avatar mock.
- `./node_modules/.bin/jest src/features/pixel-avatar src/shared/ui/__tests__/Avatar.test.tsx` — 18 passed.
