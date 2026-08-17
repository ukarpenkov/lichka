# Google Drive ZIP Backup — промты

**Источник требований:** `docs/features/google-drive-zip-backup-proposal.md`  
**Дата:** 2026-07-27  
**Статус proposal:** draft → выполнять после approve или по явной команде

> **Правило выполнения:** брать следующий шаг только если предыдущий `[x]`.  
> После каждого шага — отчёт `docs/reports/YYYY-MM-DD-google-drive-zip-step-<N>.md` и коммит (Conventional Commits).  
> **М** = делает человек вручную (результаты скидывать в чат). **А** = делает агент в коде.

---

## Порядок работ (кратко)

| # | Тип | Шаг | Что нужно от тебя в чате |
|---|-----|-----|--------------------------|
| 0 | **М** | GCP: проект + Drive API + consent screen | «готово» или скрин/ошибка |
| 1 | **М** | SHA-1 debug + Android + Web OAuth clients | **Web Client ID** + подтверждение Android client |
| 2 | **А** | Подставить `webClientId` в код | ID из шага 1 |
| 3 | **А** | `exportToZIP` → опция temp-пути (cache) | — |
| 4 | **А** | `uploadBackup` → ZIP в Drive | — |
| 5 | **А** | `downloadBackup` + Settings restore ZIP | — |
| 6 | **А** | Локализация (убрать «без медиа») | — |
| 7 | **А** | Unit-тесты google-drive | — |
| 8 | **М** | Ручной прогон на устройстве | что видишь: OK / текст ошибки Sign-In / restore |

Без шагов **0–1** кнопка в приложении **не заработает** (OAuth). Код **3–7** можно писать параллельно с GCP, но Sign-In проверится только после **2**.

---

## Статусы

| Шаг | Статус |
|-----|--------|
| 0. [М] GCP проект, Drive API, consent screen | [x] 2026-08-17 |
| 1. [М] SHA-1 + OAuth Web/Android clients | [x] 2026-08-17 |
| 2. [А] webClientId в `googleSignIn.ts` | [x] 2026-08-17 |
| 3. [А] Temp ZIP export для Drive | [x] 2026-08-17 |
| 4. [А] uploadBackup → ZIP | [x] 2026-08-17 |
| 5. [А] downloadBackup + Settings restore | [x] 2026-08-17 |
| 6. [А] Локализация Drive ZIP | [x] 2026-08-17 |
| 7. [А] Тесты google-drive | [x] 2026-08-17 |
| 8. [М] Ручная проверка на устройстве | [x] 2026-08-17 (Save+Restore OK; медиа — доп. проверка) |

---

## Общие правила (для каждого промта А)

```
## Общие правила
- Читай ВСЕ изменяемые файлы перед правкой
- Требования: docs/features/google-drive-zip-backup-proposal.md
- FSD: зависимости только вниз; public API через index.ts
- Не трогай локальный Export/Import в Settings (кнопки файла) кроме текстов Drive
- Не добавляй auto-sync / WorkManager / шифрование
- Unit-тесты на изменённые модули; прогони npm test
- Отчёт: docs/reports/<YYYY-MM-DD>-google-drive-zip-step-<N>.md
- Коммит: feat(google-drive): ... / test(google-drive): ... / chore(google-drive): ...
- Без Co-Authored-By и AI-trailers в коммитах
- НЕ добавляй комментарии в код без явной просьбы
```

---

# Блок М — ручные шаги (человек + чат)

> Когда доходим до шага **М**, агент **останавливается** и пишет в чат:  
> `Сейчас делаем вручную: шаг N — …`  
> Ты выполняешь инструкцию ниже и скидываешь в чат результат / вопросы / скрин ошибки.

---

## Шаг 0. [М] GCP: проект, Drive API, OAuth consent

**Статус:** [x] готово (2026-08-17)

> **Консоль обновлена (2026):** OAuth consent теперь в **Google Auth platform** (console.developers.google.com), а не в старом «APIs & Services → OAuth consent screen». Вход: https://me.developers.google.com/.

### Что делает человек
1. Войти в https://me.developers.google.com/ (Google Developer Program) → Google Cloud console.
2. Проект: выбрать существующий `lichka` (или создать).
3. **Google Drive API → Enable:** открыть https://console.cloud.google.com/flows/enableapi?apiid=drive.googleapis.com и выбрать проект `lichka`.
4. **Google Auth platform → Branding:** https://console.developers.google.com/auth/branding
   - Если «Google Auth platform not configured yet» → **Get Started**:
     - App Information: App name `Lichka`, User support email — свой.
     - Audience: **External**.
     - Contact information: email → Next → согласиться с Google API Services: User Data Policy → Continue → **Create**.
   - Лого 120×120 (опционально): `design/icons/oauth-consent-logo-120.png`.
5. **Audience → Test users:** https://console.developers.google.com/auth/audience → Add users → свой Gmail → Save (пока Publishing status = Testing).
6. **Data Access → Scopes:** https://console.developers.google.com/auth/scopes → Add or Remove Scopes → добавить `https://www.googleapis.com/auth/drive.appdata` → Save.

### Что скинуть в чат
- `[x] шаг 0 готово` **или**
- текст/скрин ошибки (нет доступа, другой аккаунт, уже есть проект и т.д.).

### Промт агенту (когда человек написал «готово»)
```
Шаг 0 Google Drive ZIP (ручной) отмечен выполненным человеком.
Обнови статус в docs/tasks/google-drive-zip-backup-prompts.md → шаг 0 [x].
Краткий отчёт docs/reports/YYYY-MM-DD-google-drive-zip-step-0.md.
Коммит: docs(google-drive): mark gcp project step done
Дальше НЕ начинай шаг 1 код — жди ручной шаг 1 или команду продолжить.
```

---

## Шаг 1. [М] SHA-1 + OAuth Client IDs

**Статус:** [x] готово (2026-08-17)

### Что делает человек

**1a. SHA-1 (можно попросить агента выполнить команду):**
```bash
cd android && ./gradlew signingReport
```
Нужен SHA-1 из блока **Variant: debug** / **Config: debug** (строка `SHA1:`).

**1b. Web client**
- **Google Auth platform → Clients:** https://console.developers.google.com/auth/clients
- **Create Client** → Application type: **Web application**
- Имя: `Lichka Web`
- Authorized JavaScript origins / Redirect URIs — **не нужны** для react-native-google-signin
- Create → скопировать **Client ID** вида `xxxxx.apps.googleusercontent.com`  
  (Client Secret для нашего Sign-In **не нужен**)

**1c. Android client**
- Там же: **Create Client** → Application type: **Android**
- Name: `Lichka Android Debug`
- Package name: **`com.lichka`** (как в `android/app/build.gradle`)
- SHA-1 certificate fingerprint: из 1a
- Create

### Что скинуть в чат (обязательно)
```
Web Client ID: <вставь сюда ….apps.googleusercontent.com>
Android client: создан (да/нет)
SHA-1 использовал: <xx:xx:…>
```
Если ошибка «SHA-1 already exists» / «package mismatch» — скинь текст ошибки.

### Промт агенту
```
Шаг 1 Google Drive ZIP: человек прислал Web Client ID и подтвердил Android client.
1) При необходимости сам сними SHA-1 через ./gradlew signingReport и сверь с тем что прислал человек.
2) Обнови статус шага 1 [x] в docs/tasks/google-drive-zip-backup-prompts.md.
3) Отчёт docs/reports/YYYY-MM-DD-google-drive-zip-step-1.md (без секретов; Client ID можно указать частично …xxxx).
4) Коммит docs. Затем сразу или по команде — шаг 2 (подставить ID в код).
```

---

# Блок А — кодовые промты

---

## Шаг 2. [А] Подставить webClientId

**Статус:** [x] 2026-08-17

### Промт
```
## Задача
Шаг 2 Google Drive ZIP backup. Источник: docs/features/google-drive-zip-backup-proposal.md (A7).

В src/features/google-drive/googleSignIn.ts замени плейсхолдер
YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
на Web Client ID, который пользователь прислал на шаге 1.

Scope оставь: https://www.googleapis.com/auth/drive.appdata
Не коммить Client Secret (его нет/не нужен).
Убери или обнови TODO про placeholder.

Обнови статус шага 2 в docs/tasks/google-drive-zip-backup-prompts.md.
Отчёт: docs/reports/YYYY-MM-DD-google-drive-zip-step-2.md
Коммит: chore(google-drive): set OAuth webClientId

## Общие правила
- Читай файлы перед правкой
- FSD, index.ts
- Отчёт + коммит без AI-trailers
```

---

## Шаг 3. [А] Temp ZIP для Drive (без Download)

**Статус:**  

### Промт
```
## Задача
Шаг 3 Google Drive ZIP. Proposal B2.

Сейчас exportToZIP() всегда пишет в DownloadDirectoryPath / ExternalDirectoryPath
(src/features/export/exportToZIP.ts). Для Drive нужен ZIP только во временный cache,
чтобы не дублировать файл в публичной папке.

Сделай одно из (предпочтительно минимальный API):
- exportToZIP(options?: { targetDir?: string }): Promise<string>
  — если targetDir задан → zip туда (например CachesDirectoryPath), имя licka-backup-<ts>.zip или фиксированное для upload;
  — если не задан → текущее поведение (Download → fallback External) без регрессий для Settings «Экспорт в файл».

Либо отдельный exportToZIPForUpload() в том же модуле, реэкспорт через features/export/index.ts и features/index.ts.

Покрой unit-тестами: с targetDir пишет в cache; без options — прежнее поведение (моки RNFS/zip как в существующих exportToZIP.test.ts).

Отчёт: docs/reports/YYYY-MM-DD-google-drive-zip-step-3.md
Статус шага 3 [x] в docs/tasks/google-drive-zip-backup-prompts.md
Коммит: feat(export): allow temp targetDir for Drive ZIP upload

## Общие правила
- Читай ВСЕ изменяемые файлы
- FSD, public API через index.ts
- npm test
- Без лишних комментариев
```

---

## Шаг 4. [А] uploadBackup → ZIP в appDataFolder

**Статус:**  

### Промт
```
## Задача
Шаг 4 Google Drive ZIP. Proposal B1–B2.

Файл: src/features/google-drive/googleDrive.ts

Сейчас uploadBackup:
- вызывает exportToJSON()
- грузит licka-backup.json текстом multipart в appDataFolder

Нужно:
1. Собрать ZIP через exportToZIP({ targetDir: CachesDirectoryPath }) или exportToZIPForUpload().
2. Имя файла в Drive: licka-backup.zip (MIME application/zip).
3. findExistingFile — искать q=name='licka-backup.zip' в spaces=appDataFolder.
4. Upload: multipart или media; для MVP допустим readFile base64 + multipart с Content-Type application/zip.
   Если размер большой — можно добавить простой лимит с понятной ошибкой (resumable — optional follow-up, не блокер).
5. PATCH существующего id или POST нового (как сейчас для JSON).
6. finally: удалить temp ZIP (и staging если остался).
7. Убрать зависимость upload от exportToJSON.

index.ts — без ломания лишних экспортов.

Отчёт + статус шага 4 [x]
Коммит: feat(google-drive): upload ZIP backup to appDataFolder

## Общие правила
- Proposal: docs/features/google-drive-zip-backup-proposal.md
- FSD: google-drive → export (вниз) OK
- Тесты можно отложить на шаг 7, но не ломай сборку
- npm test существующих
```

---

## Шаг 5. [А] downloadBackup + Settings restore

**Статус:**  

### Промт
```
## Задача
Шаг 5 Google Drive ZIP. Proposal B3–B4.

1) googleDrive.ts — downloadBackup(token) больше НЕ возвращает string JSON.
   Вернуть тип например:
   { path: string; kind: 'zip' | 'json' }
   - Искать сначала licka-backup.zip, иначе fallback licka-backup.json (legacy).
   - Скачать alt=media в CachesDirectoryPath/lichka-drive-restore-<ts>.zip|.json
   - NO_BACKUP если ничего нет.

2) src/features/google-drive/index.ts — экспортировать тип результата.

3) src/pages/settings/SettingsScreen.tsx — секция Drive:
   - Save: после uploadBackup показывать t.backupSaved (НЕ backupSavedNoMedia).
   - Restore: downloadBackup → диалог merge/replace.
     - kind==='zip' → importFromZIP(path, mode); в summary учесть mediaRestored; cleanup path.
     - kind==='json' → importFromJSON(содержимое файла, mode) + предупреждение driveRestoreNoMedia.
   - Не ломай локальный Export/Import ZIP файла.

4) Обновить любые callers downloadBackup.

Отчёт + статус шага 5 [x]
Коммит: feat(google-drive): restore ZIP from Drive with JSON fallback

## Общие правила
- Читай SettingsScreen целиком перед правкой
- FSD
- Без AI-trailers в коммите
```

---

## Шаг 6. [А] Локализация

**Статус:**  

### Промт
```
## Задача
Шаг 6 Google Drive ZIP. Proposal B5.

В src/shared/config/locale.ts (и тестах locale при необходимости):
- Happy-path Drive save → backupSaved (уже есть).
- backupSavedNoMedia / driveRestoreNoMedia оставить только для legacy JSON restore пути.
- При желании: driveRestoreDone с mediaRestored уже есть через mediaRestored(n) — переиспользуй.
- RU + EN синхронно.
- Обнови locale.test.ts если проверяет ключи.

Отчёт + статус шага 6 [x]
Коммит: fix(locale): Drive ZIP backup success copy

## Общие правила
- Не удаляй ключи, которые ещё использует JSON-fallback без замены вызовов
```

---

## Шаг 7. [А] Unit-тесты google-drive

**Статус:**  

### Промт
```
## Задача
Шаг 7 Google Drive ZIP. Proposal B6.

Добавь src/features/google-drive/__tests__/ (или рядом):
- uploadBackup: мок exportToZIP + fetch; metadata name licka-backup.zip; cleanup temp; PATCH если файл найден.
- downloadBackup: zip найден → kind zip; только json → kind json; ничего → NO_BACKUP.

Моки: react-native-fs, fetch, export модуль. Смотри jest.setup.js (уже есть мок google-signin).

Покрытие модуля ≥80%. npm test зелёный.

Отчёт + статус шага 7 [x]
В docs/tasks/2026-07-20-data-integrity-audit.md отметь T9 [x] когда upload ZIP готов (после шагов 4–7).
Коммит: test(google-drive): cover ZIP upload and download

## Общие правила
- Детерминированные тесты, без сети
```

---

## Шаг 8. [М] Ручная проверка на устройстве

**Статус:** [x] 2026-08-17 — Save OK (POST и PATCH 200), Restore OK (zip merge/replace, Xiaomi debug, truloveu@gmail.com). Restore медиа с реальными вложениями — проверить отдельно при следующем полном тесте.

Подробности найденных багов — `docs/bugs/google-drive-backup-developer-error-patch-403.md`.

### Когда начинать
После шагов 2–7 и **полного rebuild** приложения (clean/reinstall лучше после смены OAuth).

### Что делает человек
1. Войти тем Google-аккаунтом, что в **Test users**.
2. Создать чат с аватаром + image/voice сообщение.
3. Настройки → **Сохранить в Google Drive** → должен быть успех **без** текста «медиа не входят».
4. (Опционально) wipe data / второй эмулятор / clear app data.
5. **Восстановить из Google Drive** → merge или replace → медиа на месте.

### Что скинуть в чат
```
Save: OK / ошибка: <текст>
Restore: OK / ошибка: <текст>
Медиа после restore: да / нет
Sign-In: OK / DEVELOPER_ERROR / другой код
```

Частые проблемы:
- `DEVELOPER_ERROR` / `10` → неверный SHA-1 или package ≠ `com.lichka` → вернуться к шагу 1. Также возникает, если Web-клиент в другом проекте, чем Android-клиент: на Android уже не нужен (scope-only sign-in, `webClientId` только iOS), но для iOS надо починить в GCP.
- Повторный save после успешного → 403 `fieldNotWritable` (parents) — исправлено, см. `docs/bugs/google-drive-backup-developer-error-patch-403.md`.
- `Sign in cancelled` → норм, пользователь закрыл диалог.
- Аккаунт не в Test users → access denied на consent.

### Промт агенту (после результата)
```
Шаг 8 ручная проверка Google Drive ZIP: человек прислал результат: <вставить>.
Если OK — отметь шаг 8 [x], обнови proposal статус implemented в
docs/features/google-drive-zip-backup-proposal.md, финальный отчёт
docs/reports/YYYY-MM-DD-google-drive-zip-step-8.md, коммит docs.
Если ошибка — диагностируй по логу/коду, предложи фикс следующим промтом, не закрывай шаг 8.
```

---

## Готовые сообщения в чат (копипаст)

**Старт блока М:**
```
Сейчас делаем вручную: шаг 0 — GCP проект + Drive API + OAuth consent screen.
Инструкция в docs/tasks/google-drive-zip-backup-prompts.md (Шаг 0).
Когда сделаешь — напиши «шаг 0 готово» или скинь ошибку.
```

**После шага 0:**
```
Сейчас делаем вручную: шаг 1 — SHA-1 + Web/Android OAuth clients.
В чат нужно прислать Web Client ID и подтверждение Android client (package com.lichka).
Могу снять SHA-1 командой gradlew signingReport — сказать если нужно.
```

**Старт кода:**
```
Делай шаг 2 из docs/tasks/google-drive-zip-backup-prompts.md
Web Client ID: <вставить>
```

---

## Связанные файлы кода (ориентир)

| Файл | Роль |
|------|------|
| `src/features/google-drive/googleSignIn.ts` | placeholder `WEB_CLIENT_ID` |
| `src/features/google-drive/googleDrive.ts` | upload/download JSON → ZIP |
| `src/features/export/exportToZIP.ts` | локальный ZIP; нужен temp target |
| `src/features/import/importFromZIP.ts` | restore медиа |
| `src/pages/settings/SettingsScreen.tsx` | кнопки Drive |
| `src/shared/config/locale.ts` | `backupSaved` / `*NoMedia` |
| `android/app/build.gradle` | `applicationId "com.lichka"` |
| `android/app/debug.keystore` | debug signing; SHA-1 снят отсюда |
| `design/icons/oauth-consent-logo-120.png` | лого 120×120 для consent screen |

---

# Handoff — продолжение в новом чате

**Обновлено:** 2026-07-27 (вечер)  
**Стартовое сообщение в новый чат (копипаст):**

```
Продолжаем Google Drive ZIP backup.
Читай docs/tasks/google-drive-zip-backup-prompts.md — секция Handoff в конце.
Где остановились и что делать дальше — там. Ведём с текущего ручного шага.
```

## Где остановились (2026-07-27)

Делали **ручной блок М** (GCP). Код шагов 2–7 **ещё не начинали**.

### Уже сделано человеком
- GCP проект создан: `lichka` → https://console.cloud.google.com/welcome?project=lichka
- OAuth user type: **External** (не Internal)
- Logo на consent: загружен `design/icons/oauth-consent-logo-120.png` (сгенерирован из launcher)
- Открыта форма **Create OAuth client → Android** (плейсхолдеры `com.example` / фейковый SHA-1 — **не сохранять так**)
- Debug SHA-1 снят агентом с `android/app/debug.keystore`:
  - **SHA-1:** `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
  - Package: **`com.lichka`**
  - Name для клиента: `Lichka Android Debug`
  - Verify ownership — пропустить
- `./gradlew signingReport` в этом окружении **падает** из‑за release signing (нет keystore.properties) — для SHA-1 используем `keytool` на `android/app/debug.keystore`, не gradlew

### Не подтверждено / проверить при продолжении
- Включён ли **Google Drive API** (Enable)
- Добавлен ли scope `https://www.googleapis.com/auth/drive.appdata` на consent
- Добавлен ли Gmail в **Test users**
- Сохранён ли branding/consent после логотипа
- **Android OAuth client** — Create ещё не подтверждён пользователем в чате
- **Web OAuth client** — ещё не создан; **Web Client ID в код не подставляли** (`googleSignIn.ts` всё ещё `YOUR_WEB_CLIENT_ID…`)

### Документы
- Требования: `docs/features/google-drive-zip-backup-proposal.md` (статус **draft**)
- Промты: этот файл
- Отчёты сессии: `docs/reports/2026-07-27-google-drive-backup-status.md`, `…-zip-backup-proposal.md`, `…-zip-backup-prompts.md`

## Что сделать сразу при продолжении

1. **Добить шаг 1 (М):**
   - На форме Android: package `com.lichka`, SHA-1 выше → **Create**
   - Затем Create OAuth client → **Web application** → `Lichka Web` → Create
   - В чат: `Web Client ID: ….apps.googleusercontent.com` + «Android client создан»
2. Если Drive API / scope / test user не уверены — быстро проверить (шаг 0), отметить `[x]`
3. **Шаг 2 (А):** подставить Web Client ID в `src/features/google-drive/googleSignIn.ts`
4. Дальше по порядку шаги **3 → 7** (код ZIP Drive), потом **8** ручной прогон на устройстве

## Важно для агента
- Не путать: Android client нужен для Sign-In на устройстве; в код идёт именно **Web** Client ID (`webClientId` в Google Sign-In)
- После смены OAuth — полный rebuild приложения
- Release SHA-1 / Play App Signing — позже (A9), сейчас только debug
- Коммиты без Co-Authored-By; отчёт после каждого шага
- Пользователь скидывает результаты ручных шагов в чат — агент ждёт и не «закрывает» М-шаги сам без подтверждения
