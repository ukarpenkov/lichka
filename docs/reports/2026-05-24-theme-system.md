# Реализация системы тем (задача 2.1)

**Дата:** 2026-05-24
**Промпт/задача:** Реализовать систему тем (11 пресетов + light/dark) — задача 2.1 из промтов

## Что сделано

- Создан `src/shared/config/theme.ts` с типом `ThemePreset`, 11 пресетами из ТЗ (#5), дефолтными light/dark, функцией `getTheme(id)` и экспортом `THEME_PRESETS`, `DEFAULT_LIGHT`, `DEFAULT_DARK`
- Создан `src/shared/config/ThemeProvider.tsx` с React Context, хуком `useTheme()` и компонентом `ThemeProvider`. При монтировании загружает тему из SQLite таблицы `settings`, при переключении — сохраняет
- Добавлена миграция `003` в `src/shared/db/db.ts` — таблица `settings` (key TEXT PRIMARY KEY, value TEXT)
- Создан справочный SQL-файл `src/shared/db/migrations/003_settings.sql`
- Обновлён barrel `src/shared/config/index.ts` — экспорт всех тематических сущностей
- Написаны unit-тесты: 12 тестов для `theme.ts` + 7 тестов для `ThemeProvider.tsx` (все 19 проходят)

## Изменённые файлы

- `src/shared/db/db.ts` — добавлена миграция 3 (таблица settings)
- `src/shared/db/migrations/003_settings.sql` — новый, справочный SQL
- `src/shared/config/theme.ts` — новый, типы + пресеты + getTheme
- `src/shared/config/ThemeProvider.tsx` — новый, контекст + хук + провайдер
- `src/shared/config/index.ts` — обновлён barrel
- `src/shared/config/__tests__/theme.test.ts` — новый, 12 тестов
- `src/shared/config/__tests__/ThemeProvider.test.tsx` — новый, 7 тестов

## Принятые решения

- Загрузка темы при старте — синхронный `executeSync` в `useEffect`, так как таблица `settings` уже существует к моменту рендера (миграции запускаются раньше)
- `getTheme` возвращает `DEFAULT_LIGHT` для неизвестного id (fallback)
- Map для O(1) поиска пресета по id
- Хранение в SQLite `settings` (key-value) как указано в ТЗ, без AsyncStorage

## Известные ограничения

- `ThemeProvider` зависит от `shared/db` — миграции должны быть выполнены до рендера провайдера (будет решено в задаче 4.1/17.1 при настройке App.tsx)
- AsyncStorage не используется для кэша темы (cold start flicker) — добавить при необходимости

## Тестирование

- `theme.test.ts`: 12 тестов — дефолтные темы, количество пресетов, уникальность id, валидность hex-цветов, getTheme по id + fallback
- `ThemeProvider.test.tsx`: 7 тестов — дефолтная light, загрузка из БД, переключение, сохранение в SQLite, множественное переключение, fallback для неизвестного id
- Покрытие: ~100% на модуль theme.ts и ThemeProvider.tsx
