# Google Drive backup — DEVELOPER_ERROR + PATCH 403 parents

**Дата:** 2026-08-17
**Симптом:** «Сохранить в Google Drive» → выбор аккаунта → диалог «Не удалось сохранить бэкап».

## Причина 1 — DEVELOPER_ERROR (code 10)

GMS возвращал `DEVELOPER_ERROR` при `GoogleSignin.signIn()`. Лог GMS (`logcat`, tag `Auth`):

```
[GetTokenResponseHandler] Server returned error: You must use a Web client as the server client ID.
```

`webClientId` в `googleSignIn.ts` был валидным Web-клиентом (проверено через OAuth endpoint), но проверка GMS на шаге GetToken (ID-токен) отклоняла его — признак несоответствия проекта Android-клиента и Web-клиента в GCP.

**Фикс:** приложение ID-токен не использует — Drive нужен только access token. `webClientId` оставлен только для iOS (`Platform.OS === 'ios'`), на Android sign-in идёт scope-only (`drive.appdata`). GMS при этом не выполняет шаг GetToken с server client.

**Открытый вопрос для GCP:** проверить, что OAuth-клиент Android (`com.lichka`, SHA-1 `5E:8F:…:F6:25`) и Web-клиент `968016048983-idm80idaavnentgb1rn8fpvu6f8hf7r9.apps.googleusercontent.com` находятся в **одном проекте** `lichka`. Если нет — ID-токен-флоу (iOS, будущее) не заработает.

## Причина 2 — PATCH 403 `fieldNotWritable`

Первый POST (новый файл) — 200. Повторный save шёл PATCH на существующий файл и падал:

```
403: The parents field is not directly writable in update requests.
     Use the addParents and removeParents parameters instead.
```

В multipart-metadata для PATCH передавался `parents: ['appDataFolder']` — Drive запрещает менять `parents` напрямую при update.

**Фикс:** в PATCH metadata передаётся только `{ name }`, `parents` — только при POST нового файла.

## Причина 3 — повреждённый ZIP при download (restore)

`downloadBackup` читал файл через `response.text()` и писал с `utf8` — бинарные байты ZIP терялись (573 символа вместо 590 байт), `unzip` в `importFromZIP` падал при выборе режима merge/replace.

**Фикс:** `response.arrayBuffer()` → `Buffer.from(...).toString('base64')` → `RNFS.writeFile(path, base64, 'base64')`. После фикса размер скачанного файла = 590 байт, restore проходит.

## Изменённые файлы

- `src/features/google-drive/googleSignIn.ts` — `webClientId` только для iOS; логи `hasPreviousSignIn`, token length, тип ответа signIn.
- `src/features/google-drive/googleDrive.ts` — логи всех шагов upload/list/download; metadata без `parents` для PATCH; URL-encoding `q` и `orderBy` в `findExistingFile`; бинарная загрузка ZIP.
- `src/pages/settings/SettingsScreen.tsx` — лог полной ошибки в catch save/restore и в `performDriveImport`.
- `src/features/google-drive/__tests__/googleDrive.test.ts` — тест PATCH без `parents`; бинарная запись (base64); ожидания закодированных URL.

## Проверка на устройстве

- Save (первый, POST): 200 — успех.
- Save (повторный, PATCH): 200 — успех.
- Restore (zip, merge/replace): 200, импорт прошёл — успех.
- Restore медиа с реальными вложениями — стоит проверить отдельно (в тесте бэкап без медиа).
