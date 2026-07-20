# Замена иконок на пиксельные (npm / Iconify)

**Дата:** 2026-07-20  
**Промпт/задача:** Заменить все lucide-иконки на пиксельные Streamline Pixel через npm (обход лимита Figma MCP).

## Что сделано
- Установлен `@iconify-json/streamline-pixel` (CC BY 4.0, 662 иконки — тот же набор, что в Figma Community).
- Удалён `lucide-react-native`.
- Добавлен слой `src/shared/ui/pixel/`: `PixelIcon` + named exports с API `{ color, size, style? }`.
- Все экраны/виджеты переведены на pixel-иконки.
- `AlarmClockIcon` / `MicIcon` теперь из pixel-набора (stopwatch / microphone).
- Jest: `moduleNameMapper` → `__mocks__/pixelIcons.js`.

## Изменённые файлы
- `package.json` / `package-lock.json` — iconify вместо lucide
- `src/shared/ui/pixel/*` — новый модуль
- `src/shared/ui/Icon.tsx` — удалён
- `src/shared/ui/index.ts` — реэкспорт pixel
- Импорты во всех pages/widgets/features, где были lucide
- `jest.config.js`, `__mocks__/pixelIcons.js`

## Маппинг (основное)
| Было (lucide) | Стало (streamline-pixel) |
|---|---|
| MessageCircle | interface-essential-message |
| CalendarDays | interface-essential-calendar-date |
| Settings | interface-essential-setting-cog |
| Send | interface-essential-send-mail |
| Bell | interface-essential-alarm-bell-sleep |
| Repeat | interface-essential-synchronize-arrows-square-1 |
| Search | interface-essential-search-1 |
| Plus / X / Pause | custom pixel glyphs (в наборе нет прямых аналогов) |

Цвета: `fill={color}` — подхватывают `ink` / `muted` / `destructive` темы.

## Принятые решения
- Источник: npm Iconify JSON, не Figma MCP (лимит Starter).
- Кастомные plus/close/pause на том же 32px grid.
- Attribution CC BY 4.0: Streamline Pixel via Iconify.

## Известные ограничения
- Plus / close / pause — не из оригинального набора.
- `Cloud` → `internet-network-cloud-off` (форма облака; не Drive-logo).

## Тестирование
- `npx tsc --noEmit` (ошибки иконок исправлены; прочие pre-existing остаются)
- Jest с mock pixel icons
