# Chat Future Peek — шаг 1: локализация

**Дата:** 2026-07-28
**Промпт/задача:** Добавить RU/EN ключи Future Peek в locale.ts и обновить locale.test.ts

## Что сделано
- Добавлены ключи `futureMode`, `futureEmptyTitle`, `futureScheduleCta`, `futurePeekA11y`, `futureExitA11y` в интерфейс и словари RU/EN
- Обновлён список обязательных ключей в `locale.test.ts`
- UI чата не менялся; ключи доступны через существующий `useLocale` / public API `shared/config`

## Изменённые файлы
- `src/shared/config/locale.ts` — типы и строки Future Peek
- `src/shared/config/__tests__/locale.test.ts` — required keys

## Принятые решения
- `futureExitA11y`: «Потяните вверх, чтобы вернуться к истории чата» / `Pull up to return to chat history`
- Секция `// Future Peek` рядом с Scheduled — по смыслу продукта

## Известные ограничения
- Ключи пока не подключены к UI (шаги 4–7)

## Тестирование
- `npm test -- --testPathPattern=locale.test` — PASS
- Полный `npm test`: связанные suites PASS; 2 падения вне scope (`db.test` SIGSEGV, `SeamlessDateChip` / AlertDialog `spacing`) — не связаны с этим шагом
