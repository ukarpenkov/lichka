# Обновление дизайн-системы (root tabs)

**Дата:** 2026-07-20  
**Промпт/задача:** реализовать `docs/design/lichka-design-system.md` с контролем lead designer / UX architect / Android senior / frontend — без «нейро-слопа»

## Что сделано

- Подключены роли: explore codebase, lead designer (APPROVED WITH TWEAKS), UX architect, Android senior, frontend QA, финальный designer PASS WITH NOTES.
- Введены semantic tokens: `withAlpha`, `resolveSemanticColors`, spacing/radii/typography/`listRow`/`fabShadow` в `shared/config/tokens.ts`.
- `ThemeProvider` отдаёт `colors`; `Text` расширен вариантами + `tone`.
- Добавлен единый `PageHeader` (фиксированная высота 56, gutter 20).
- Три корневых таба выровнены: одинаковый display-title, без hairline-разделителей, измеренные плотности строк.
- Tab bar без top hairline; FAB — платформенная тень (iOS shadow / Android elevation 3) без clipping.
- Section labels Settings — sentence case; Switch/locale на semantic tokens.
- Документ DS синхронизирован с контрактом реализации.

## Изменённые файлы

- `src/shared/lib/color.ts` — `withAlpha`
- `src/shared/config/tokens.ts` — токены DS
- `src/shared/config/ThemeProvider.tsx` — `colors`
- `src/shared/ui/Text.tsx`, `PageHeader.tsx`, `IconButton.tsx`
- `src/pages/chat-list/*`, `scheduled/*`, `settings/*`
- `src/app/SwipeablePager.tsx`, `AppNavigator.tsx`
- `src/shared/config/locale.ts` — `scheduled`, sentence-case sections
- `docs/design/lichka-design-system.md`
- тесты: `color.test.ts`, `tokens.test.ts`, обновлены ThemeProvider/locale

## Принятые решения

- Gutter **20** и плотности строк **12/14/56** — по lead designer (не blanket 16v из черновика DS).
- Press = `surfaceSoft` @ 6%, не opacity fade на list rows.
- Radii только 12 / 16 / full.
- Soft shadow только у FAB; dialogs без тени.
- Date grouping в Scheduled — отложено (UX follow-up), header уже устраняет «безымянность».

## Известные ограничения

- ChatRoom / GlobalSearch / context menus ещё на старых hairline/hex-concat стилях.
- Навигационный bar Android (`ThemeModule`) не трогали в этом проходе.
- Нужен device review на light / dark / mint / cream (+ остальные 9 пресетов).

## Тестирование

- Unit: `withAlpha`, tokens, ThemeProvider semantic colors, locale keys — **35 passed**
- Ручной прогон на устройстве — ⬜
