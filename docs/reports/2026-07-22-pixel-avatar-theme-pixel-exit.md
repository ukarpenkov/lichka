# Обновление бага pixel-avatar-contour-mush

**Дата:** 2026-07-22  
**Промпт/задача:** Записать в баг выход из ситуации — лёгкая пиксельность + палитра темы вместо контуров.

## Что сделано

- В `docs/bugs/pixel-avatar-contour-mush.md` добавлен раздел **«Выход из ситуации: theme-pixel avatar»**.
- Контурный ROI/ML путь помечен как устаревший основной фикс; статус бага уточнён.

## Изменённые файлы

- `docs/bugs/pixel-avatar-contour-mush.md`
- `docs/reports/2026-07-22-pixel-avatar-theme-pixel-exit.md` — этот отчёт

## Принятые решения

- MVP: luminance → 2–4 уровня → цвета `background`/`text` темы, сетка ~32–48.
- Референс-контур — later / optional с face-detect.

## Тестирование

- Документ-only.
