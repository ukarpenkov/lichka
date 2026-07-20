# Пиксельная контурная аватарка чата

**Дата:** 2026-07-21  
**Промпт/задача:** Завести фичу: фото чата → пиксельные контуры с цветом, локально и быстро; в духе Streamline Pixel / эмодзи-иконок.

## Что сделано

- Proposal: `docs/features/pixel-contour-avatar-proposal.md` (status: implemented).
- Референс сохранён: `docs/design/refs/pixel-contour-avatar-example.png`.
- Feature `src/features/pixel-avatar/`:
  - чистый алгоритм `processPixelContourBuffer` (crop → contrast → Sobel → dilate → pixel grid → posterize → NN upscale);
  - режимы `color` (default) и `mono`;
  - JPEG decode (`jpeg-js`) + PNG encode с альфой (`pako`);
  - API `createPixelContourAvatar` / `createPixelContourAvatarFromBase64`.
- `ChatForm`: после выбора фото сразу строит пиксельный контур, превью на фоне темы, сохранение PNG.
- `saveAvatarPng` в `mediaPath` (+ удаление legacy `.jpg`).
- `Avatar`: фото/PNG на том же tint-фоне, что иконки (прозрачные контуры читаются).

## Изменённые файлы

- `docs/features/pixel-contour-avatar-proposal.md` — proposal
- `docs/design/refs/pixel-contour-avatar-example.png` — референс
- `src/features/pixel-avatar/**` — фича + тесты
- `src/widgets/chat-form/ChatForm.tsx` — интеграция
- `src/shared/lib/mediaPath.ts`, `index.ts`, `__tests__/mediaPath.test.ts`
- `src/shared/ui/Avatar.tsx`
- `package.json` / `package-lock.json` — `jpeg-js`, `pako`, `@types/*`

## Принятые решения

- **Не Nitro в v1:** в проекте нет first-party Nitro; после даунскейла работа на сетке ~32×32, TS достаточно быстр для save. API готов к переносу ядра в C++/Nitro (v2).
- **Default color contours + transparent bg** — ближе к паку иконок на теме; `mono` = как на референсе Ч/Б.
- Хранение `media/avatars/{id}.png` с альфой.

## Известные ограничения

- Decode: JPEG и PNG (sniff по magic bytes). WebP пока не поддержан — на Android лучше брать файл с `uri` пикера (resized), а не `asset.base64` оригинала.
- Нет face-detect кадрирования (можно добавить позже: Vision / ML Kit).
- Нет UI-переключателя mono/color — сейчас defaults; опции есть в API.

## Тестирование

- Unit: crop, downsample, NN upscale, transparent bg, mono/color, PNG signature, PNG decode round-trip, `createPixelContourAvatar`, `saveAvatarPng`.
- Ручное: Android gallery → фото → превью контуров без ошибки decode.

## Fix 2026-07-21 (Android gallery)

- Ошибка `expected JPEG` была **маскирующей**: любой сбой декода показывался так же — даже для реального JPG.
- Частые причины на JPG/Android: base64 через глобальный `atob`/`Buffer`, non-contiguous buffer, original full-res вместо resized uri.
- Harden: `buffer` package для base64, contiguous copy + `useTArray` для jpeg-js, чтение temp/`content://`, понятные ошибки с hex-head.
