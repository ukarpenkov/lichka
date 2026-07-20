# VT323 для page titles

**Дата:** 2026-07-20  
**Промпт/задача:** Для заголовков основных страниц использовать шрифт VT323 (Google Fonts).

## Что сделано
- Скачан и подключен [VT323](https://fonts.google.com/specimen/VT323) (`VT323-Regular.ttf` + OFL).
- Токен `typography.display` → `fontFamily: VT323-Regular`, size 32 / line 36.
- Body / chat / UI остаются на JetBrains Mono.
- Обновлены `DESIGN.md`, `lichka-design-system.md`, задача редизайна.

## Изменённые файлы
- `assets/fonts/VT323-Regular.ttf`, `assets/fonts/OFL-VT323.txt`
- `android/app/src/main/assets/fonts/VT323-Regular.ttf`
- `src/shared/config/tokens.ts` — `fonts.display`, display metrics
- `src/shared/config/__tests__/tokens.test.ts`
- docs: `DESIGN.md`, `lichka-design-system.md`, `terminal-cli-redesign-task.md`

## Принятые решения
- VT323 только для `PageHeader` / `display`, не для chat title и body.
- Size 32 — pixel face читается крупнее, чем JetBrains 26.

## Известные ограничения
- **VT323 не содержит кириллицы** (проверено по cmap: 0 глифов в блоке U+0400–04FF).  
  RU-заголовки («Чаты», «Запланировано», «Настройки») зависят от system glyph-fallback и могут выглядеть неоднородно. Для чистого pixel на RU нужен другой шрифт.

## Тестирование
- `tokens` unit: display → VT323-Regular / 32
