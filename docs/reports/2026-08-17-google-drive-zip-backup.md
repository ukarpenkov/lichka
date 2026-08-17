# Google Drive ZIP backup — OAuth и код (шаги 0–7)

**Дата:** 2026-08-17
**Промпт/задача:** довести ручной бэкап в Google Drive до рабочего состояния: GCP/OAuth настройка, ZIP с медиа вместо JSON-only, restore из Drive.

## Что сделано
- Закрыты ручные шаги GCP: проект `lichka`, Drive API, Google Auth platform (branding, Audience External + test users, scope `drive.appdata`), OAuth-клиенты Android (`com.lichka`, debug SHA-1) и Web.
- Получен Web Client ID и подставлен в `googleSignIn.ts` (плейсхолдер убран).
- `exportToZIP` получил опцию `targetDir` — temp-ZIP в cache без дублирования в Download.
- `uploadBackup` теперь грузит `licka-backup.zip` (MIME `application/zip`) в `appDataFolder`: PATCH существующего / POST нового, лимит 25 МБ с ошибкой `BACKUP_TOO_LARGE`, cleanup temp-файла.
- `downloadBackup` возвращает `{ path, kind: 'zip' | 'json' }`: поиск `licka-backup.zip`, fallback на legacy `licka-backup.json`, скачивание в cache, `NO_BACKUP` при отсутствии.
- Settings: restore из Drive для ZIP идёт через `importFromZIP` (медиа восстанавливаются, summary через `mediaRestored`), для legacy JSON — `importFromJSON` с предупреждением; temp-файл удаляется. Успех Save — без «медиа не входят».
- Локализация: удалён неиспользуемый ключ `backupSavedNoMedia` (6 локалей + тип), `driveRestoreNoMedia` остался только для legacy JSON-пути.
- Инструкции в доках актуализированы под новую консоль (Google Auth platform: Branding / Audience / Data Access / Clients).

## Изменённые файлы
- `src/features/google-drive/googleSignIn.ts` — реальный `webClientId`.
- `src/features/google-drive/googleDrive.ts` — ZIP upload/download, `DriveBackupDownload`, лимит размера.
- `src/features/google-drive/index.ts` — экспорт `DriveBackupDownload`.
- `src/features/export/exportToZIP.ts` — `ExportToZIPOptions { targetDir? }`.
- `src/features/export/index.ts` — реэкспорт `ExportToZIPOptions`.
- `src/features/index.ts` — экспорт `DriveBackupDownload`.
- `src/pages/settings/SettingsScreen.tsx` — Drive restore через `performDriveImport`, тексты успеха.
- `src/shared/config/locale/*` — удалён `backupSavedNoMedia` из типа и 6 локалей.
- `src/features/google-drive/__tests__/googleDrive.test.ts` — 9 unit-тестов.
- `src/features/export/__tests__/exportToZIP.test.ts` — 2 теста на `targetDir`.
- `docs/tasks/google-drive-backup-plan.md` — план работ (новый).
- `docs/tasks/google-drive-zip-backup-prompts.md` — статусы шагов, актуальные инструкции по новой консоли.

## Принятые решения
- OAuth Client ID не секрет (публичный идентификатор, вшит в клиент); Client Secret не создавали и не используем.
- Имя файла в Drive — `licka-backup.zip` (одно «последнее» состояние в `appDataFolder`), legacy `licka-backup.json` поддерживается на restore.
- MVP-upload — multipart base64 с лимитом 25 МБ; resumable — follow-up.
- `googleSignIn.ts` не покрыт unit-тестами (тонкая обёртка над нативным SDK), проверяется вручную на шаге 8.

## Известные ограничения
- Auto-sync / WorkManager, шифрование ZIP, история версий, resumable upload — вне MVP.
- Release SHA-1 (Play App Signing) — позже; сейчас работает только debug.
- Consent screen в Testing — доступ только у test users.
- tsc: существующие ошибки в тестах `src/widgets/image-message/__tests__` (не относятся к задаче, не трогались).

## Тестирование
- `npm test`: 52 suite, 426 тестов — зелёные.
- Покрытие `googleDrive.ts`: 100% (statements/branches/functions/lines).
- eslint по изменённым файлам — чисто.
- Ручная проверка на устройстве (шаг 8): не выполнялась — требуется полный rebuild приложения и вход тестовым аккаунтом.
