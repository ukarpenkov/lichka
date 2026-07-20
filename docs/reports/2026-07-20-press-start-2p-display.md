# Press Start 2P для page titles (кириллица)

**Дата:** 2026-07-20  
**Промпт/задача:** Какой pixel-шрифт с русской кириллицей; предложено Press Start 2P.

## Что сделано
- Проверена кириллица у кандидатов (cmap):
  - **Press Start 2P** — YES (178 cyr glyphs; «Чаты» / «Запланировано» / «Настройки» OK)
  - **Tiny5** — YES (альтернатива, тоже Google OFL)
  - **DotGothic16** — YES (частично; JP-pixel feel)
  - VT323 / Silkscreen — NO
- `display` переключён VT323 → **Press Start 2P** (`PressStart2P-Regular`, size **18/28** — широкий face).
- VT323 удалён из assets.
- Docs обновлены.

## Изменённые файлы
- `assets/fonts/PressStart2P-Regular.ttf`, `OFL-PressStart2P.txt`
- `android/.../assets/fonts/PressStart2P-Regular.ttf`
- `src/shared/config/tokens.ts`, tokens test
- `DESIGN.md`, `lichka-design-system.md`, `terminal-cli-redesign-task.md`

## Принятые решения
- Press Start 2P выбран как запрошенный pixel с Cyrillic.
- Size 18 (не 32): иначе длинные RU-заголовки обрезаются в header 56.

## Известные ограничения
- Шрифт «игровой» / chunky — характер сильнее VT323; если слишком аркадный — запасной вариант **Tiny5**.

## Тестирование
- cmap: RU titles OK
- `tokens` unit: display → PressStart2P-Regular / 18
