# Экспорт/импорт в ZIP в доступную директорию (с медиа)

**Дата:** 2026-07-06
**Промпт/задача:** Завести баг по экспорту в недоступную директорию и исправить экспорт/импорт с учётом голосовых записей и картинок. Выбран формат ZIP-архив.

## Что сделано
- Заведён баг-репорт `docs/bugs/export-file-private-directory.md`: файл сохранялся в приватную внутреннюю директорию `/data/user/0/com.lichka/files/`, плюс медиа вообще не попадали в бэкап.
- Создан proposal `docs/features/zip-backup-proposal.md` с обоснованием выбора ZIP (vs base64-in-JSON, vs папка с файлами), описанием flow экспорта/импорта и влияния на FSD-слои.
- Установлена нативная зависимость `react-native-zip-archive@8.0.1` (поддерживает New Architecture / RN 0.85).
- `buildExportData.ts` — вынесен общий сбор данных (используется и JSON-экспортом для Google Drive, и ZIP-экспортом). Поведение `exportToJSON` для Google Drive **не изменено**.
- `exportToZIP.ts` — собирает staging-папку (`backup.json` + `media/` с referenced аватарами/картинками/голосом), архивирует через `zip()`. Целевая директория: сначала `RNFS.DownloadDirectoryPath` (публичная Download), при ошибке `EACCES` (scoped storage Android 11+) — fallback на `RNFS.ExternalDirectoryPath` (`/storage/emulated/0/Android/data/com.lichka/files/`, всегда доступна без разрешений). Staging очищается. Возвращает реальный путь.
- `importFromZIP.ts` — распаковывает ZIP во временную папку, читает `backup.json`, делегирует БД-импорт в существующее ядро `importFromJSON`, копирует `media/` в `MEDIA_DIR` (рекурсивно, с `ensureDir`), считает `mediaRestored`, очищает temp (в `finally`).
- `SettingsScreen.tsx`: «Экспорт» теперь вызывает `exportToZIP` (иконка `FileArchive`). «Импорт» определяет `.zip`/`.json` по имени файла: для ZIP копирует `content://` URI во временный файл (RNFS `copyFile` поддерживает content URI через ContentResolver) и вызывает `importFromZIP`; для `.json` — легаси `importFromJSON` (обратная совместимость со старыми бэкапами). Добавлен helper `formatImportResult` с поддержкой `mediaRestored`.
- Локализация (RU/EN): добавлены `mediaRestored`, `importFailed`, `notBackupFile`.
- `shared/lib` реэкспортирует `MEDIA_DIR`.
- `jest.setup.js`: добавлен глобальный мок `react-native-zip-archive` (ESM-модуль, без мока ломал транзитивный импорт через `features/index`).
- Тесты: `exportToZIP.test.ts` (6 сценариев: запись backup.json + zip в Download, копирование avatar/image/voice, пропуск отсутствующих файлов, игнор uri вне `media/`, cleanup staging, fallback на External при EACCES); `importFromZIP.test.ts` (4 сценария: unzip + импорт БД + восстановление медиа с подсчётом, NOT_A_BACKUP когда нет backup.json, cleanup temp при ошибке, 0 медиа когда нет папки media). Существующие `exportToJSON`-тесты и integration-тесты остались зелёными.

## Изменённые файлы
- `docs/bugs/export-file-private-directory.md` — **новый**, баг-репорт
- `docs/features/zip-backup-proposal.md` — **новый**, proposal
- `package.json` / `package-lock.json` — `+ react-native-zip-archive@^8`
- `src/features/export/buildExportData.ts` — **новый**, общий сбор `ExportData`
- `src/features/export/exportToJSON.ts` — рефактор: использует `buildExportData` (поведение неизменно)
- `src/features/export/exportToZIP.ts` — **новый**, ZIP-экспорт со staging + медиа
- `src/features/export/index.ts` — реэкспорт `exportToZIP`
- `src/features/import/importFromZIP.ts` — **новый**, ZIP-импорт + восстановление медиа
- `src/features/import/index.ts` — реэкспорт `importFromZIP`, `ZipImportResult`
- `src/features/index.ts` — реэкспорт новых функций и типов
- `src/pages/settings/SettingsScreen.tsx` — Export→ZIP, Import определяет zip/json, `formatImportResult`
- `src/shared/config/locale.ts` — `mediaRestored`, `importFailed`, `notBackupFile` (RU/EN)
- `src/shared/lib/index.ts` — реэкспорт `MEDIA_DIR`
- `jest.setup.js` — глобальный мок `react-native-zip-archive`
- `src/features/export/__tests__/exportToZIP.test.ts` — **новый**, 6 тестов
- `src/features/import/__tests__/importFromZIP.test.ts` — **новый**, 4 теста

## Принятые решения
- **Формат ZIP** (не base64-in-JSON, не папка с файлами): один файл, сжатие, стандартный формат, удобно шарить; нет +33% оверхеда и риска упасть на `JSON.parse` сотен МБ.
- **Только referenced медиа** в бэкапе (avatar_path + message.payload.uri из `media/`): orphan-файлы не тащатся — это автоматически чистит бэкап (соответствует логике `cleanupOrphanMedia`).
- **Доставка: Download → fallback External**: `targetSdk=36` + scoped storage делает direct-запись в `/storage/emulated/0/Download/` невозможной без `MANAGE_EXTERNAL_STORAGE`. Fallback на `ExternalDirectoryPath` гарантирует запись без разрешений и видимость в файловых менеджерах. Пользователю показывается реальный путь.
- **`MANAGE_EXTERNAL_STORAGE` отклонён** как избыточный для бэкапа (тяжёлое разрешение «All files access»). Share-sheet (`react-native-share`) отмечен в proposal как future enhancement для гарантированного «Save to Downloads» без разрешений.
- **Google Drive бэкап не меняется** — `exportToJSON`/`importFromJSON` оставлены как есть (JSON без медиа в `appDataFolder`). Включение медиа в GD — отдельная задача.
- **Обратная совместимость**: старые `.json` бэкапы импортируются (без медиа).
- **`importFromZIP` принимает file path**, не `content://` — SettingsScreen копирует picked URI во временный файл (`RNFS.copyFile` поддерживает content URI через ContentResolver), что keeps ядро чистым и тестируемым.

## Известные ограничения
- На Android 13+ папка `Android/data/<pkg>/files` может быть скрыта в «Files by Google» — нужен сторонний файловый менеджер или USB. Публичная `Download` доступна только при возможности записи (старый Android или `MANAGE_EXTERNAL_STORAGE`).
- Google Drive бэкап **не включает медиа** (только JSON).
- ZIP не шифруется (future: `zipWithPassword`).
- Импорт копирует медиа с перезаписью существующих файлов с тем же именем.
- Требуется пересборка Android (новая нативная зависимость `react-native-zip-archive`).

## Тестирование
- `npx jest` — 18 сьютов, 182 теста, все зелёные.
- `npx eslint` на новых/изменённых файлах — чисто (pre-existing warnings в `jest.setup.js`/`SettingsScreen` не относятся к изменению).
- `npx tsc --noEmit` — новых ошибок в изменённых файлах нет (pre-existing ошибки в нетронутых файлах: `AlarmScreen`, `MessageBubble.test`, `ScheduledItem`, `imageCompress`, `AlertDialog` — существуют на main, в `package.json` нет `typecheck`-скрипта).
- Покрытые сценарии: экспорт собирает `backup.json` + копирует referenced avatar/image/voice в staging + zip в Download; пропуск отсутствующих файлов; игнор uri вне `media/`; cleanup staging; fallback на External при EACCES; импорт распаковывает + импортирует БД + восстанавливает медиа с подсчётом; `NOT_A_BACKUP` когда нет `backup.json`; cleanup temp при ошибке; 0 медиа когда нет папки `media`.
- Ручное тестирование (рекомендация): Settings → Export → найти `licka-backup-*.zip` в файловом менеджере → Import на устройстве → медиа отображаются.
