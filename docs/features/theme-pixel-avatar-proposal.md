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
2. Box-downsample до `pixelGrid` (32–48, default 40).
3. Luminance + мягкий контраст.
4. Posterize в 2–4 уровня яркости.
5. Уровни → lerp палитры: самый тёмный = `text`, самый светлый = `background`, середины — смеси.
6. Nearest-neighbor upscale до `outputSize` (default 224).

Контурный режим (Sobel / GameBoy ink) отложен до face-detect; не входит в MVP.

### API / опции

| Опция | Default | Описание |
|-------|---------|----------|
| `pixelGrid` | `40` | Сетка пикселей (32–48) |
| `outputSize` | `224` | Размер PNG |
| `contrast` | `1.35` | Контраст luminance |
| `posterizeLevels` | `4` | Уровней яркости (2–4) |
| `background` | `#FAFAFA` | Светлый полюс палитры |
| `text` | `#000000` | Тёмный полюс палитры |

```ts
createThemePixelAvatar(input, { background, text }): PixelAvatarResult
```

Старые имена `createPixelContourAvatar*` / `processPixelContourBuffer` оставлены как deprecated aliases.

### Хранение

- Файл: `media/avatars/{chatId}.png`
- Цвета запекаются на момент выбора фото (перекраска при смене темы — later, через luminance-маску).

## Влияние на архитектуру (FSD)

| Слой | Изменение |
|------|-----------|
| `features/pixel-avatar` | `processThemePixelBuffer` + `createThemePixelAvatar` |
| `widgets/chat-form` | Передаёт `background` / `text` из `useTheme` |
| `shared/ui/Avatar` | Подложка PNG = theme `background` |
| `shared/lib/mediaPath` | `saveAvatarPng` без смены контракта |

## Альтернативы

| Вариант | Решение |
|---------|---------|
| Довести Sobel + face ROI | Отложено (optional later) |
| Обычный JPEG | Отвергнуто — не pixel |
| Live re-tint при смене темы | Later |

## Оценка сложности

S — чистый TS-буферный пайплайн + unit-тесты + проводка темы в ChatForm.

## Тестирование

- Unit: crop, downsample, NN upscale, posterize, palette-only pixels, PNG/JPEG decode.
- Ручное: портрет на кухне / сложный фон; смена темы и новый pick.
