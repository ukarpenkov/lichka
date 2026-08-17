# Google Drive backup — фиксы после ручной проверки на устройстве

**Дата:** 2026-08-17
**Промпт/задача:** после ручной проверки на устройстве (шаг 8) устранить найденные баги: `DEVELOPER_ERROR` при sign-in на Android, 403 `fieldNotWritable` при повторном save (PATCH), повреждённый ZIP при restore.

## Что сделано
- **DEVELOPER_ERROR (code 10):** `webClientId` в `googleSignIn.ts` теперь передаётся в `GoogleSignin.configure` только для iOS; на Android sign-in идёт scope-only (`drive.appdata`) без GetToken-шага с server client, который GMS отклонял.
- **PATCH 403 `fieldNotWritable`:** в multipart-metadata для PATCH существующего файла передаётся только `{ name }`, `parents: ['appDataFolder']` — только при POST нового файла.
- **Повреждённый ZIP при restore:** `downloadBackup` читает файл через `response.arrayBuffer()` → `Buffer.from(...).toString('base64')` → `RNFS.writeFile(path, base64, 'base64')` вместо `response.text()` + `utf8`.
- **URL-encoding** параметров `q` и `orderBy` в `findExistingFile` (`modifiedTime desc` → `modifiedTime%20desc`).
- **Диагностические логи** всех шагов upload/list/download в `googleDrive.ts` и `googleSignIn.ts`, полной ошибки в catch save/restore в `SettingsScreen.tsx`.
- Обновлены тесты `googleDrive.test.ts` (PATCH без `parents`, бинарная запись base64, закодированные URL).
- `docs/features/google-drive-zip-backup-proposal.md` — статус `implemented`.
- `docs/tasks/google-drive-zip-backup-prompts.md` — шаг 8 отмечен выполненным, частые проблемы дополнены.

## Изменённые файлы
- `src/features/google-drive/googleSignIn.ts` — `webClientId` только iOS; логи `hasPreviousSignIn`, token length, тип ответа signIn.
- `src/features/google-drive/googleDrive.ts` — логи всех шагов; metadata без `parents` для PATCH; URL-encoding `q`/`orderBy`; бинарная загрузка ZIP.
- `src/pages/settings/SettingsScreen.tsx` — лог полной ошибки в catch save/restore и в `performDriveImport`.
- `src/features/google-drive/__tests__/googleDrive.test.ts` — тест PATCH без `parents`; бинарная запись (base64); ожидания закодированных URL.
- `docs/bugs/google-drive-backup-developer-error-patch-403.md` — описание причин и фиксов (новый).
- `docs/features/google-drive-zip-backup-proposal.md` — статус `implemented`.
- `docs/tasks/google-drive-zip-backup-prompts.md` — статус шага 8, частые проблемы.

## Принятые решения
- ID-токен приложению не нужен (Drive использует только access token), поэтому на Android `webClientId` не передаётся; на iOS он остаётся для будущего ID-token-флоу.
- `parents` для PATCH опускается — Drive запрещает менять `parents` в update-запросах напрямую.
- ZIP скачивается как бинарник (base64 → `RNFS` в режиме `base64`), а не как текст.

## Известные ограничения
- Открытый вопрос GCP: находятся ли Android-клиент (`com.lichka`, SHA-1 `5E:8F:…:F6:25`) и Web-клиент `968016048983-…` в одном проекте `lichka` — иначе ID-token-флоу (iOS, будущее) не заработает.
- Restore медиа с реальными вложениями — стоит проверить отдельно (в тесте бэкап без медиа).

## Тестирование
- Ручная проверка на устройстве (Xiaomi debug): Save (POST) 200, повторный Save (PATCH) 200, Restore (zip, merge/replace) — импорт прошёл, размер скачанного файла 590 байт.
- Unit-тесты `googleDrive.test.ts` обновлены и зелёные (PATCH-метаданные, бинарная запись, URL-encoding).
