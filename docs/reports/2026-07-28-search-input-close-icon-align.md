# Баг: Текст поиска и иконка закрытия не на одной горизонтали

**Дата:** 2026-07-28
**Промпт/задача:** Завести баг в `docs/bugs/` и отчёт в `docs/reports/` — в поиске текст/placeholder и крестик закрытия не на одной горизонтальной линии по центру.

## Что сделано
- Заведён баг-файл `docs/bugs/search-input-close-icon-misaligned.md`.
- Исправлен `GlobalSearch`: убран `lineHeight`, добавлены `paddingVertical: 0`, `textAlignVertical="center"`, на Android — `includeFontPadding: false`.
- То же исправление применено в `SearchOverlay` (поиск внутри чата) для единого поведения.

## Изменённые файлы
- `docs/bugs/search-input-close-icon-misaligned.md` — баг-репорт.
- `src/pages/chat-list/GlobalSearch.tsx` — вертикальное центрирование текста в search input.
- `src/pages/chat-room/SearchOverlay.tsx` — тот же фикс.

## Принятые решения
- Ряд уже был с `alignItems: 'center'`; править layout `IconButton` не нужно — проблема во внутреннем выравнивании текста `TextInput`.
- `lineHeight` на однострочном `TextInput` с фиксированной высотой убран: он типично ломает вертикальное центрирование на RN.
- Фикс продублирован в `SearchOverlay`, чтобы не оставлять тот же дефект в поиске чата.

## Известные ограничения
- Визуальную проверку на устройстве/симуляторе нужно подтвердить вручную (особенно iOS с JetBrains Mono в `GlobalSearch`).
- Отдельный unit-тест на стили search input не добавлялся.

## Тестирование
- Ручная проверка: открыть глобальный поиск → placeholder и X на одной горизонтали.
- Ручная проверка: поиск внутри чата → то же выравнивание.
