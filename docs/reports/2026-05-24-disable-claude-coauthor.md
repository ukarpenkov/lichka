# Отключение Claude co-author в будущих коммитах

**Дата:** 2026-05-24
**Промпт/задача:** Не добавлять Claude как co-author в следующих коммитах (без переписывания истории)

## Что сделано
- `.claude/settings.json` — `"attribution": { "commit": "", "pr": "" }`
- Правила в `.cursor/rules/lichka-commits.mdc`, `CLAUDE.md`, `development-and-release-rules.md`
- Git hook `.githooks/commit-msg` + `strip-ai-attribution.mjs`
- `package.json` → `"prepare": "git config core.hooksPath .githooks"`

## Изменённые файлы
- `.claude/settings.json`
- `.cursor/rules/lichka-commits.mdc`
- `CLAUDE.md`
- `docs/rules/development-and-release-rules.md`
- `.githooks/commit-msg`, `.githooks/strip-ai-attribution.mjs`
- `package.json`

## Принятые решения
- Старые 4 коммита с Co-Authored-By **не трогаем**
- Страховка: hook удаляет Claude/Anthropic trailers при каждом commit
- `npm install` / `npm run prepare` активирует hooks локально

## Известные ограничения
- Hook срабатывает только после `npm run prepare` (или ручной `git config core.hooksPath .githooks`)
- Cursor Composer может игнорировать `.claude/settings.json` — правила + hook покрывают это

## Тестирование
- `strip-ai-attribution.mjs` — Co-Authored-By строка удаляется из тестового сообщения
