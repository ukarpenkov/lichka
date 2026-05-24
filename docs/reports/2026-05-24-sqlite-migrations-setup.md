# Настройка SQLite и миграций

**Дата:** 2026-05-24
**Промпт/задача:** Выполнить шаг 1.2 — создать систему миграций SQLite в `src/shared/db/`

## Что сделано

- Создана директория `src/shared/db/` с модулем инициализации БД
- Создан файл миграции `migrations/001_initial.sql` (как reference)
- SQL-миграция заэмбеджена как константа в `db.ts` (React Native не поддерживает чтение файлов из бандла через fs)
- Реализована функция `runMigrations()` с транзакционным применением миграций
- Реализована функция `getDatabase()` с singleton-паттерном
- Обновлён `src/shared/index.ts` для реэкспорта db-модуля

## Изменённые файлы

- `src/shared/db/migrations/001_initial.sql` — создание таблиц chats, messages, schema_migrations
- `src/shared/db/db.ts` — модуль инициализации БД через op-sqlite
- `src/shared/db/index.ts` — barrel-файл с public API
- `src/shared/index.ts` — добавлен реэкспорт `./db`

## Принятые решения

- **SQL как константа, а не чтение файлов:** React Native не позволяет читать файлы из бандла через `fs`. Миграции захардкожены в объекте `MIGRATIONS: Record<number, string>`. Файл `.sql` оставлен как reference для документации.
- **Singleton для getDatabase():** БД открывается один раз, повторные вызовы возвращают тот же инстанс.
- **Транзакции для миграций:** Каждая миграция применяется в `BEGIN/COMMIT`, при ошибке — `ROLLBACK`.
- **Синхронный API (`executeSync`):** Миграции должны выполниться до старта приложения, поэтому использован синхронный API op-sqlite.

## Схема БД

### chats
| Поле | Тип | Ограничения |
|------|-----|-------------|
| id | TEXT | PRIMARY KEY NOT NULL |
| title | TEXT | NOT NULL |
| avatar_path | TEXT | nullable |
| created_at | TEXT | NOT NULL, UTC ISO8601 |
| updated_at | TEXT | NOT NULL, UTC ISO8601 |

### messages
| Поле | Тип | Ограничения |
|------|-----|-------------|
| id | TEXT | PRIMARY KEY NOT NULL |
| chat_id | TEXT | NOT NULL, FK → chats.id ON DELETE CASCADE |
| type | TEXT | NOT NULL, CHECK in simple/reminder/alarm/periodic |
| body | TEXT | NOT NULL DEFAULT '' |
| scheduled_at | TEXT | nullable, UTC |
| interval_minutes | INTEGER | nullable |
| enabled | INTEGER | nullable, 0/1 |
| payload | TEXT | nullable, JSON |
| created_at | TEXT | NOT NULL, UTC |
| updated_at | TEXT | NOT NULL, UTC |

### schema_migrations
| Поле | Тип | Ограничения |
|------|-----|-------------|
| version | INTEGER | PRIMARY KEY |

## Известные ограничения

- Миграции захардкожены в коде; при добавлении новых миграций нужно добавлять записи в объект `MIGRATIONS`
- Тесты на миграции не написаны (требуют запуска на устройстве/эмуляторе с нативным модулем op-sqlite)

## Тестирование

- TypeScript-проверка (`tsc --noEmit`) — ошибок в `shared/db/` нет
- Тесты на БД требуют нативного окружения (op-sqlite — JSI-модуль), unit-тесты на Jest без мока нативного модуля невозможны
