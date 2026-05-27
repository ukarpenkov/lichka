# Импорт из JSON (merge)

**Дата:** 2026-05-27
**Промпт/задача:** Реализовать импорт из JSON с merge по id и опцией «Заменить всё»

## Что сделано

- Создан feature slice `src/features/import/` с функцией `importFromJSON`
- Два режима импорта:
  - `merge` — сравнение по `id`, если запись уже есть — keep newer `updated_at`, новые — добавляем
  - `replace` — удаление всех данных и вставка из файла
- Валидация формата JSON (schema_version, наличие массива chats)
- Импорт настроек через существующий `updateSettings`
- Кнопка «Импорт из файла» на экране настроек с выбором режима через Alert
- Режим «Заменить всё» имеет дополнительное подтверждение (destructive action)
- Установлена зависимость `react-native-document-picker`

## Изменённые файлы

- `src/features/import/importFromJSON.ts` — функция импорта с merge/replace
- `src/features/import/index.ts` — public API
- `src/features/index.ts` — добавлен экспорт `importFromJSON`
- `src/pages/settings/SettingsScreen.tsx` — кнопка импорта в секции «Резервная копия»
- `package.json` — добавлен `react-native-document-picker`

## Принятые решения

- Используется прямой SQL вместо репозиторных функций `createChat`/`createMessage`, чтобы сохранить оригинальные `id` из бэкапа
- Сравнение `updatedAt` для определения более новой записи (строковое сравнение ISO-дат корректно)
- `DocumentPicker` для выбора файла, `RNFS.readFile` для чтения
- `enabled` конвертируется из boolean в INTEGER (0/1) при вставке

## Известные ограничения

- Медиафайлы (аватары, голосовые) не импортируются — только пути из JSON
- Нет валидации внутренней структуры каждого сообщения (type, поля)
- `react-native-document-picker` требует нативной настройки (autolinking)

## Тестирование

- TypeScript компиляция без ошибок в новых файлах
- Ручное тестирование: экспорт → импорт (merge) → проверка что данные не дублируются
- Ручное тестирование: экспорт → импорт (replace) → проверка что старые данные удалены
