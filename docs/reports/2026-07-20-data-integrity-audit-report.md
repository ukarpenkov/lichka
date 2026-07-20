# Ревизия данных: обновления, ZIP/Drive, БД, поиск

**Дата:** 2026-07-20  
**Промпт/задача:** Проверить уязвимости при обновлениях, экспорт/импорт ZIP, Google Drive; ревизия схемы БД и миграций; поиск по сообщениям; недочёты → `docs/tasks` + исправления + отчёт.

## Что сделано

### Аудит
Полная ревизия слоёв данных: SQLite-миграции 1–7, ZIP/JSON backup, Google Drive JSON, поиск сообщений. Найденные проблемы зафиксированы в `docs/tasks/2026-07-20-data-integrity-audit.md`.

### Исправления (P0–P2)

1. **Целостность БД**
   - `PRAGMA foreign_keys = ON` при открытии БД
   - `deleteChat` явно удаляет messages + `chat_read_markers`
   - Миграция **8**: `body_lc`, индексы, FK на `chat_read_markers` (с очисткой orphan markers)

2. **Экспорт / импорт (гибкость обновлений)**
   - Формат бэкапа `schema_version: 2` (`isSystem`, `readMarkers`)
   - Импорт принимает v1–v2, отклоняет неизвестные версии
   - Транзакция + rollback; replace чистит markers
   - Валидация `type` сообщений; `saved-messages` всегда `is_system=1`
   - `body_lc` заполняется при create/update/import

3. **Поиск**
   - Unicode case-insensitive через `body_lc` (кириллица)
   - Escape `%`/`_` в LIKE
   - Фильтр видимости как в ленте (без будущих / periodic templates)
   - `buildSearchListItems` + DateSeparator; sticky date скрыт при поиске

4. **Google Drive**
   - Предупреждение: бэкап без медиа
   - Удаление temp JSON после upload
   - Follow-up T9: ZIP в Drive (не в этом промпте)

5. **Документация схемы**
   - Reference SQL `004`–`008` в `src/shared/db/migrations/`

## Изменённые файлы

- `src/shared/db/db.ts` — FK, миграция 8, JS after-hook
- `src/shared/db/search.ts`, `normalizeSearchText.ts`
- `src/shared/db/migrations/004–008_*.sql`
- `src/features/export/buildExportData.ts`, `index.ts`
- `src/features/import/importFromJSON.ts`
- `src/features/google-drive/googleDrive.ts`
- `src/entities/chat/model/chatRepository.ts`
- `src/entities/message/model/messageRepository.ts`, `index.ts`
- `src/pages/chat-room/SearchOverlay.tsx`, `ChatRoomScreen.tsx`
- `src/pages/settings/SettingsScreen.tsx`
- `src/shared/config/locale.ts`
- `docs/tasks/2026-07-20-data-integrity-audit.md`
- тесты: db, search, export, import, SearchOverlay

## Принятые решения

- Версия **экспорта** (`schema_version`) отделена от версий **миграций БД** — документировано в коде константами MIN/MAX.
- FTS5 не включали заново (нет FTS5 в текущей сборке op-sqlite); вместо этого `body_lc` + индексы.
- Drive остаётся JSON-only с явным UX-предупреждением; полный бэкап = ZIP.

## Известные ограничения

- Drive по-прежнему без медиа (задача T9)
- OAuth client ID — placeholder
- FTS5 отключён до `op-sqlite.json`
- Нет авто-sync (по ТЗ)

## Тестирование

- Unit: миграции 6/8, normalizeSearchText, search LIKE, importFromJSON (версия/транзакция/is_system/типы), export ZIP/JSON schema v2, `buildSearchListItems`
- Все 31 связанных теста — green
