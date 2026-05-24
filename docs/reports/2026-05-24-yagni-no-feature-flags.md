# Schema YAGNI и без feature flags (#79–#80)

**Дата:** 2026-05-24
**Промпт/задача:** Tags/streaks/mood не в schema; feature flags не нужны

## Что сделано
- **#79:** YAGNI — tags, streaks, mood не в MVP schema
- **#80:** без feature flags; тест на реальном устройстве (#70)

## Изменённые файлы
- `docs/spec/white-requirements.md` — #79, #80, changelog

## Принятые решения
- Не резервируем metadata/JSON под будущие tags/streaks/mood
- Experimental — через dogfooding на устройстве, не через toggles

## Известные ограничения
- #81 без ответа

## Тестирование
- Не применимо (только документация)
