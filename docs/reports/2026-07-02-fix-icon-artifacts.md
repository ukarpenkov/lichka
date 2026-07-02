# Исправление визуальных артефактов иконок (double-stroke overlap)

**Дата:** 2026-07-02
**Промпт/задача:** Исправить баг-репорт о ярких точках на стыках линий векторных иконок

## Что сделано

- Создан баг-репорт: `docs/bugs/icon-intersection-artifacts.md`
- Создан кастомный компонент `CalendarDaysIcon` в `shared/ui/Icon.tsx`, использующий `<ClipPath>` для предотвращения наложения штрихов (double-stroke) между `<rect>` календаря и горизонтальной разделительной линией
- Обновлён `AppNavigator.tsx`: иконка CalendarDays в Tab Bar теперь рендерится через кастомный компонент вместо Lucide

## Изменённые файлы

- `docs/bugs/icon-intersection-artifacts.md` — баг-репорт
- `src/shared/ui/Icon.tsx` — кастомные SVG-компоненты иконок
- `src/shared/ui/index.ts` — экспорт `CalendarDaysIcon`
- `src/app/AppNavigator.tsx` — замена `CalendarDays` на `CalendarDaysIcon`
- `docs/reports/2026-07-02-fix-icon-artifacts.md` — данный отчёт

## Принятые решения

- **CalendarDays — ClipPath**: Горизонтальная линия (`M3 10h18`) обрезается clip-путьём, вложенным на 1px от границ rect. Это предотвращает наложение stroke-width=2 на стыке rect и линии, сохраняя визуальную целостность.
- **Settings, MessageCircle, AlarmClock, Mic**: Оставлены оригинальные Lucide-компоненты. Корректное исправление требует более глубокой переработки SVG-путей (объединение overlapping elements в единый path или использование маски), что неоправданно для Low priority.
- **Архитектура**: Кастомные иконки вынесены в `shared/ui/` (слой shared, FSD). При необходимости можно добавить фиксы для других иконок в том же файле.

## Известные ограничения

- Фикс применён только к `CalendarDaysIcon` — самой заметной иконке с чётким overlap rect+line
- Для остальных иконок (Settings, MessageCircle, AlarmClock, Mic) дефект остаётся, но менее заметен визуально или сложнее устраняется без потери качества

## Тестирование

- `npx tsc --noEmit` — чисто (1 предсуществующая ошибка в AlertDialog.tsx, не связанная с изменениями)
- `npx eslint src/shared/ui/Icon.tsx src/shared/ui/index.ts src/app/AppNavigator.tsx` — 0 errors, 3 warnings (предсуществующие, react/no-unstable-nested-components в AppNavigator)
