# Theme-pixel chat avatar

**Статус:** implemented  
**Заменяет:** contour MVP (`pixel-contour-avatar`) — см. `docs/bugs/pixel-avatar-contour-mush.md`

## Название фичи

`theme-pixel-avatar` — локальная генерация слегка пиксельной аватарки из фото в палитре текущей темы (`background` ↔ `text`).

## Описание проблемы

Фотореалистичный JPEG выбивается из terminal / pixel UI. Контурный Sobel-пайплайн на реальных gallery-фото давал «кашу» без face ROI. Нужен стабильный pixel-look, нативно совместимый с двухцветными темами Lichka.

## Предлагаемое решение

### UX

1. Пользователь жмёт «Фото» в `ChatForm`.
2. Системный пикер → изображение (до 512×512).
3. Под капотом строится theme-pixel версия в цветах активной темы.
4. Превью и список чатов показывают PNG.
5. Выбор иконки из пака без изменений.

### Алгоритм (ядро)

Вход: RGBA-буфер + цвета темы. Выход: непрозрачный PNG.

1. Center-crop в квадрат.
2. Box-downsample до `pixelGrid` (64–128, default 96) — лёгкая пиксельность.
3. Luminance + мягкий контраст.
4. Posterize в 8–32 уровня яркости (default 16).
5. Уровни → duotone-ramp: тёмный полюс темы ↔ светлый (не «text всегда = тёмный»).
6. Nearest-neighbor upscale до `outputSize` (default 256).

Контурный режим (Sobel / GameBoy ink) отложен до face-detect; не входит в MVP.

### API / опции

| Опция | Default | Описание |
|-------|---------|----------|
| `pixelGrid` | `96` | Сетка пикселей (64–128), мягкая пикселизация |
| `outputSize` | `256` | Размер PNG |
| `contrast` | `1.1` | Мягкий контраст luminance |
| `posterizeLevels` | `16` | Оттенков на ramp (8–32), duotone «как ЧБ фото» |
| `background` | `#FAFAFA` | Один полюс палитры |
| `text` | `#000000` | Другой полюс палитры |

Ramp: тёмные области фото → более тёмный из `background`/`text`, светлые → более светлый (на green-on-black: чёрный→зелёный).

```ts
createThemePixelAvatar(input, { background, text }): PixelAvatarResult
```

Старые имена `createPixelContourAvatar*` / `processPixelContourBuffer` оставлены как deprecated aliases.

### Хранение

- Файл: `media/avatars/{chatId}.png` — **grayscale luminance mask** (не запечённая тема).
- При показе `ChatAvatar` / `useThemePixelAvatarUri` красит маску в `background`↔`text` текущей темы (кэш по path+цветам).
- Старые запечённые PNG тоже перекрашиваются через luminance (приближённо).
- Иконки пака без изменений.

## Влияние на архитектуру (FSD)

| Слой | Изменение |
|------|-----------|
| `features/pixel-avatar` | `processThemePixelBuffer` + `createThemePixelAvatar` |
| `widgets/chat-form` | Передаёт тему; сохраняет mask; превью live-tint |
| `widgets/chat-avatar` | `ChatAvatar` — live recolor PNG при смене темы |
| `shared/ui/Avatar` | Иконки / emoji / fallback; PNG-фото идут через ChatAvatar |
| `shared/lib/mediaPath` | `saveAvatarPng` без смены контракта |

## Альтернативы

| Вариант | Решение |
|---------|---------|
| Довести Sobel + face ROI | Отложено (optional later) |
| Обычный JPEG | Отвергнуто — не pixel |
| Live re-tint при смене темы | **Implemented** — grayscale mask + paint on display |

## Оценка сложности

S — чистый TS-буферный пайплайн + unit-тесты + проводка темы в ChatForm.

## Тестирование

- Unit: crop, downsample, NN upscale, posterize, palette-only pixels, PNG/JPEG decode.
- Ручное: портрет на кухне / сложный фон; смена темы и новый pick.
