# Создание entity Settings

**Дата:** 2026-05-24
**Промпт/задача:** Создать entity Settings с типом AppSettings и CRUD-репозиторием

## Что сделано
- Создан тип `AppSettings` с полями: `themePresetId`, `hapticEnabled`, `soundEnabled`, `locale`
- Реализован `settingsRepository` с функциями `getSettings()` и `updateSettings(partial)`
- Настройки хранятся в таблице `settings` (key-value) через SQLite
- Boolean-значения сериализуются как `'1'`/`'0'`
- `updateSettings` использует `ON CONFLICT DO UPDATE` (upsert)
- Дефолты: `light` тема, haptic/sound включены, locale `en`
- Созданы unit-тесты (11 сценариев)

## Изменённые файлы
- `src/entities/settings/model/types.ts` — тип `AppSettings`
- `src/entities/settings/model/settingsRepository.ts` — `getSettings()`, `updateSettings(partial)`
- `src/entities/settings/index.ts` — public API
- `src/entities/settings/__tests__/settingsRepository.test.ts` — unit-тесты

## Принятые решения
- Boolean хранятся как `'1'`/`'0'` в текстовом поле — совместимо с SQLite без отдельного типа
- Имена ключей в БД в snake_case (`theme_preset_id`), в коде — camelCase (`themePresetId`)
- `getSettings()` всегда возвращает полный объект с дефолтами — не может вернуть null
- `updateSettings` возвращает актуальное состояние после обновления

## Известные ограничения
- Нет миграции для дефолтных значений — дефолты заданы в коде

## Тестирование
- 11 unit-тестов: дефолты, чтение из БД, partial update, upsert, пустой partial
