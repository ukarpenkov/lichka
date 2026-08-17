# Google Drive Backup — план работ

**Дата актуализации:** 2026-08-17
**Источник требований:** `docs/features/google-drive-zip-backup-proposal.md`
**Промты по шагам:** `docs/tasks/google-drive-zip-backup-prompts.md`

> Цель: кнопки «Сохранить / Восстановить из Google Drive» в Настройках реально работают, бэкап в `appDataFolder` — ZIP с медиа (не JSON-only).

## Текущий статус

| # | Шаг | Кто | Статус | Что мешает |
|---|-----|-----|--------|------------|
| 0 | GCP: проект + Drive API + consent screen + test users | М | [x] 2026-08-17 | — |
| 1 | OAuth clients: Web + Android (SHA-1) | М | [x] 2026-08-17 | — |
| 2 | `webClientId` в `googleSignIn.ts` | А | [x] 2026-08-17 | — |
| 3 | `exportToZIP({ targetDir })` — temp-ZIP | А | [x] 2026-08-17 | — |
| 4 | `uploadBackup` → ZIP в `appDataFolder` | А | [x] 2026-08-17 | — |
| 5 | `downloadBackup` → ZIP + restore в Settings | А | [x] 2026-08-17 | — |
| 6 | Локализация (убрать «без медиа» для ZIP) | А | [x] 2026-08-17 | — |
| 7 | Unit-тесты google-drive | А | [x] 2026-08-17 | — |
| 8 | Ручная проверка на устройстве | М | не начат | нужен полный rebuild приложения |

**Факты по коду (проверено):**

- `src/features/google-drive/googleSignIn.ts:4` — плейсхолдер `YOUR_WEB_CLIENT_ID.apps.googleusercontent.com`.
- `src/features/google-drive/googleDrive.ts` — upload/download только `licka-backup.json` (multipart text), медиа нет.
- `src/features/export/exportToZIP.ts:44` — сигнатура `exportToZIP(): Promise<string>` без опций, пишет в Download/External.
- Тестов на `features/google-drive` нет (каталог `__tests__` отсутствует).
- Локали: `backupSavedNoMedia` / `driveRestoreNoMedia` активны во всех 6 локалях (ru/en/es/pt/fr/de).

## План

### Фаза 1 — GCP (человек, блокер)

> **Консоль обновилась (2026):** OAuth consent screen теперь в разделе **Google Auth platform**, а не в старых «APIs & Services → OAuth consent screen». Вход: https://me.developers.google.com/ (Google Developer Program) или напрямую https://console.developers.google.com/.

1. **Шаг 0, добить:**
   - **Drive API:** https://console.cloud.google.com/flows/enableapi?apiid=drive.googleapis.com → выбрать проект `lichka` → Enable.
   - **Branding** (https://console.developers.google.com/auth/branding): если «Google Auth platform not configured yet» → Get Started: App name `Lichka`, User support email, Audience = **External**, contact email, согласиться с User Data Policy → Create. Лого 120×120 — `design/icons/oauth-consent-logo-120.png` (опционально).
   - **Audience** (https://console.developers.google.com/auth/audience): Test users → Add users → свой Gmail → Save.
   - **Data Access** (https://console.developers.google.com/auth/scopes): Add or Remove Scopes → добавить `https://www.googleapis.com/auth/drive.appdata` → Save.
2. **Шаг 1 — Clients** (https://console.developers.google.com/auth/clients → Create Client):
   - **Android:** type Android, name `Lichka Android Debug`, package `com.lichka`, SHA-1 `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25` → Create.
   - **Web:** type Web application, name `Lichka Web` (redirect URIs не нужны, Client Secret не используется) → Create → **Web Client ID (`….apps.googleusercontent.com`) прислать в чат**.
3. Отметить шаги 0–1 `[x]` в `google-drive-zip-backup-prompts.md`.

### Фаза 2 — код (агент, после Web Client ID)

4. **Шаг 2:** подставить `webClientId` в `googleSignIn.ts`.
5. **Шаг 3:** `exportToZIP({ targetDir? })` — temp-ZIP в `CachesDirectoryPath` без записи в Download; без опций — прежнее поведение. Реэкспорт через `features/export/index.ts`.
6. **Шаг 4:** `uploadBackup` — ZIP (`licka-backup.zip`, MIME `application/zip`) в `appDataFolder`: find existing → PATCH/POST multipart, `finally` — удалить temp. Отвязать от `exportToJSON`. MVP: лимит размера с понятной ошибкой (resumable — follow-up).
7. **Шаг 5:** `downloadBackup` → `{ path, kind: 'zip' | 'json' }`: искать `licka-backup.zip`, fallback `licka-backup.json`; Settings: zip → `importFromZIP(path, mode)`, json → `importFromJSON` + предупреждение; cleanup temp.
8. **Шаг 6:** локали: happy-path ZIP → `backupSaved` (без NoMedia); NoMedia-строки только для legacy JSON fallback. Все 6 локалей + тесты locale.
9. **Шаг 7:** unit-тесты `features/google-drive/__tests__/`: upload (имя файла, PATCH/POST, cleanup temp), download (zip / json fallback / `NO_BACKUP`). Покрытие ≥80%, `npm test` зелёный.

### Фаза 3 — приёмка

10. **Шаг 8 (человек):** полный rebuild приложения (clean install после смены OAuth) → вход тестовым аккаунтом → Save в Drive → wipe/второй эмулятор → Restore → чаты + медиа на месте.
11. Если OK: статус proposal → implemented, закрыть T9 в `docs/tasks/2026-07-20-data-integrity-audit.md`, финальный отчёт.

## Критерии готовности

- Save в Drive: success-сообщение **без** «медиа не входят».
- Restore с Drive: merge/replace, медиа (фото, голос, аватары) восстановлены.
- Регресс: локальный Export/Import ZIP работает как раньше.
- Legacy: старый `licka-backup.json` в Drive по-прежнему восстанавливается (с предупреждением).

## Ограничения (не входят в MVP)

- Auto-sync / WorkManager, шифрование ZIP, история версий, resumable upload, release SHA-1 (A9), iOS.
