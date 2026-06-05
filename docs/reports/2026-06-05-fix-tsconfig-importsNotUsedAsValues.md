# Исправление tsconfig: замена устаревших опций compilerOptions

**Дата:** 2026-06-05
**Промпт/задача:** Ошибки компиляции — удалённые и устаревшие опции TypeScript в `document-picker/tsconfig.json`

## Что сделано
- Заменена удалённая опция `importsNotUsedAsValues: "error"` на `verbatimModuleSyntax: true`
- Заменена устаревшая опция `moduleResolution: "node"` на `"bundler"` (node10 deprecated в TS 7.0)

## Изменённые файлы
- `document-picker/tsconfig.json` — замена двух опций compilerOptions

## Принятые решения
- `verbatimModuleSyntax` — прямая замена `importsNotUsedAsValues`, рекомендована TypeScript 5.0+. Контролирует удаление неиспользуемых импортов типов.
- `moduleResolution: "bundler"` — стандарт для проектов с Metro/webpack/Vite. Работает в паре с `module: "esnext"`. Вместо `ignoreDeprecations: "6.0"` (заглушка) — полный переход на актуальную опцию.

## Известные ограничения
- `verbatimModuleSyntax` требует явных `import type` для типов — могут потребоваться правки импортов в `.ts`/`.tsx` файлах
- `moduleResolution: "bundler"` не поддерживает `require()` — но в RN/Metro это не актуально

## Тестирование
- Проверить запуск `tsc --noEmit` в директории `document-picker/`
