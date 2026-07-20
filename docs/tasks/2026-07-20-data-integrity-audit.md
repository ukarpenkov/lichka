# Ревизия данных: обновления, ZIP, Google Drive, поиск

**Дата:** 2026-07-20  
**Статус:** fixed (T9 follow-up open)  
**Источник:** полная ревизия БД / бэкапов / поиска по сообщениям

## P0 — целостность и обновления

- [x] **T1** Включить `PRAGMA foreign_keys = ON`; при удалении чата чистить messages + `chat_read_markers`
- [x] **T2** Экспорт/импорт: `isSystem`, `schema_version: 2`, валидация версии, транзакция, очистка markers в replace
- [x] **T3** Миграция 8: индексы + `body_lc` для Unicode-поиска; синхронизация reference SQL
- [x] **T4** После replace/import форсировать `saved-messages.is_system = 1`

## P1 — поиск по сообщениям

- [x] **T5** Cyrillic case-insensitive через `body_lc` + escape `%`/`_` в LIKE
- [x] **T6** Не показывать в поиске будущие/невидимые сообщения (как в ленте)
- [x] **T7** Дописать `buildSearchListItems` + скрыть sticky date поверх SearchOverlay

## P2 — Google Drive

- [x] **T8** Предупреждение: Drive-бэкап без медиа; удаление temp JSON после upload
- [ ] **T9** (follow-up) Загружать ZIP с медиа в Drive вместо JSON-only

## Известные ограничения (не в этом промпте)

- FTS5 по-прежнему отключён в op-sqlite (ожидает `op-sqlite.json`)
- OAuth client ID для Google — placeholder до конфигурации
- Авто-синхронизация Drive не реализована (по ТЗ — ручной бэкап)

**Отчёт:** `docs/reports/2026-07-20-data-integrity-audit-report.md`
