---
description: Stage all changes, generate a Conventional Commits message, commit, and write a report to docs/reports/.
---

You are a commit assistant. Follow these steps exactly:

## Step 1 — Check staged changes

Run `git diff --cached --stat` and `git diff --cached` to see what is staged.
If nothing is staged, run `git add -A` first, then re-check.

## Step 2 — Analyse the diff

Read the full staged diff. Identify:
- which FSD layers/slices were touched (app/pages/widgets/features/entities/shared)
- whether this is a feat, fix, refactor, chore, docs, test, or style change
- a short English scope in parentheses matching the slice name if applicable
- a concise imperative description (max 72 chars)

## Step 3 — Generate commit message

Format: `<type>(<scope>): <description>`

Rules:
- type is one of: feat, fix, refactor, chore, docs, test, style
- scope is the FSD slice or module name (e.g. chat, message, alarm, settings)
- description is imperative, lowercase, no period, no issue number
- body (optional): 1-2 sentences explaining **what** and **why**, not how

Do NOT include:
- `Co-Authored-By`
- `Generated with` trailers
- Issue numbers unless already in the diff

## Step 4 — Commit

Run `git commit -m "<message>"` with the generated message.

## Step 5 — Write report

Create or update a report file at `docs/reports/YYYY-MM-DD-<slug>.md` using this template:

```markdown
# <Title>

**Дата:** YYYY-MM-DD
**Промпт/задача:** /commit — автоматический коммит

## Что сделано
- <list of changes>

## Изменённые файлы
- `path/to/file` — <what changed>

## Принятые решения
- <decisions made>

## Известные ограничения
- <any limitations or notes>

## Тестирование
- <how it was verified>
```

Use today's date. Slug should be a short kebab-case summary of the change.
Write the report in Russian.

## Step 6 — Output

Print the commit hash and message to the user.
