# Google Drive Backup в ZIP (с медиа)

**Статус:** implemented

## Название фичи
Ручной бэкап в Google Drive по кнопке в Настройках: ZIP с медиа вместо JSON-only.

## Описание проблемы
Кнопки «Сохранить / Восстановить из Google Drive» в Настройках уже есть, но:

1. **OAuth не настроен** — в `googleSignIn.ts` стоит плейсхолдер `YOUR_WEB_CLIENT_ID`; Sign-In на устройстве не работает.
2. **В Drive уходит только JSON** (`licka-backup.json` в `appDataFolder`) — без фото, голоса и аватаров. Локальный ZIP-экспорт (`exportToZIP` / `importFromZIP`) уже умеет медиа, Drive — нет (задача T9).

Цель: по нажатию кнопки бэкап реально сохраняется в Google Drive пользователя как ZIP (с медиа) и так же восстанавливается.

## Предлагаемое решение

Два блока работ: **A) GCP credentials** (без этого кнопка мёртвая) и **B) код: JSON → ZIP** в Drive.

---

### A. Google Cloud Console (обязательно до/вместе с кодом)

| Шаг | Действие | Детали |
|-----|----------|--------|
| A1 | Создать проект | [Google Cloud Console](https://console.cloud.google.com/) → New Project → имя `lichka` (или существующий) |
| A2 | Включить API | APIs & Services → Library → **Google Drive API** → Enable |
| A3 | OAuth consent screen | External (или Internal для Workspace) → App name `Lichka` → support email → scopes: добавить `https://www.googleapis.com/auth/drive.appdata` → Test users: свой Google-аккаунт (пока статус Testing) |
| A4 | Web client ID | Credentials → Create credentials → OAuth client ID → Application type **Web application** → скопировать Client ID (`….apps.googleusercontent.com`) |
| A5 | SHA-1 debug | В репо: `cd android && ./gradlew signingReport` → взять SHA-1 у `Variant: debug` / `Config: debug` |
| A6 | Android client | Credentials → OAuth client ID → type **Android** → package name `com.lichka` → SHA-1 из A5 → Create |
| A7 | Подставить ID в код | `src/features/google-drive/googleSignIn.ts`: заменить `YOUR_WEB_CLIENT_ID…` на Web Client ID из A4. Предпочтительно вынести в конфиг/env (не коммитить секреты лишний раз; сам Client ID не секрет, но лучше единая точка) |
| A8 | Пересборка | Полный rebuild Android-приложения после смены credentials |
| A9 | (Release) | Отдельный Android OAuth client с SHA-1 **release**-keystore, когда пойдём в Play |

**Стоимость:** бесплатно (квоты Drive API + место в Drive пользователя).  
**Публикация в Production** на consent screen — позже; для теста достаточно Testing + test users.

---

### B. Код: Drive upload/download ZIP

Переиспользовать существующие `exportToZIP` / `importFromZIP`. Меняем только слой `features/google-drive` и вызовы в Settings.

#### B1. Имя файла и MIME
- Имя в Drive: `licka-backup.zip` (одно «последнее» состояние в `appDataFolder`, как сейчас с JSON).
- MIME: `application/zip`.
- Старый `licka-backup.json` при restore: поддержка fallback (см. B4).

#### B2. `uploadBackup(token)`
Текущий flow (JSON text в multipart body) заменить на:

1. `const zipPath = await exportToZIP(...)` — либо отдельный хелпер, который пишет ZIP во **временный** путь (`CachesDirectoryPath`), без копирования в Download (чтобы не дублировать файл в публичной папке при Drive-бэкапе).
   - **Рекомендация:** добавить опцию/параметр в `exportToZIP({ targetDir?: string })` или `exportToZIPForUpload()` → только cache; публичный Export в Settings без изменений.
2. Прочитать ZIP как binary (`RNFS.readFile(zipPath, 'base64')`) и собрать multipart upload с `Content-Type: application/zip` **или** использовать resumable / `uploadType=media` + metadata отдельно (для больших архивов предпочтительнее **resumable upload**).
3. `findExistingFile` по имени `licka-backup.zip` → `PATCH` или `POST` в `appDataFolder`.
4. `finally`: удалить temp ZIP.
5. Убрать зависимость upload от `exportToJSON`.

**Resumable (рекомендуется при медиа):**  
для архивов > ~5–10 МБ multipart в памяти рискован — init resumable session → `PUT` чанками/файлом. Минимальный MVP: multipart base64 для маленьких бэкапов + явный лимит/ошибка; v1.1 — resumable.

#### B3. `downloadBackup(token)`
Сейчас возвращает `string` (JSON text). Нужен путь к локальному ZIP:

1. Найти файл: сначала `licka-backup.zip`, иначе fallback `licka-backup.json` (legacy).
2. Скачать `alt=media` в `CachesDirectoryPath/lichka-drive-restore-<ts>.zip` (или `.json`).
3. Вернуть `{ path, kind: 'zip' | 'json' }` (сломать сигнатуру — обновить Settings).

#### B4. Restore в Settings
Текущий код: `downloadBackup` → `importFromJSON(json, mode)`.

Новый:

1. `getGoogleToken()` → `downloadBackup(token)`.
2. Если `kind === 'zip'`: `importFromZIP(path, mode)` → показать `mediaRestored`.
3. Если `kind === 'json'`: `importFromJSON` (старые бэкапы без медиа) + предупреждение.
4. Cleanup temp файла.
5. Убрать копирайт «без медиа» для ZIP-пути; оставить только для legacy JSON.

#### B5. Локализация
- Обновить/убрать `backupSavedNoMedia`, `driveRestoreNoMedia` для happy-path ZIP.
- При желании: `backupSaved`, `driveRestoreDone(mediaCount)`.

#### B6. Тесты
- Unit: `uploadBackup` мокает `exportToZIP` + `fetch` (metadata name = `licka-backup.zip`).
- Unit: `downloadBackup` — zip найден / json fallback / `NO_BACKUP`.
- Settings не обязательно RTL; достаточно модульных тестов google-drive + существующие ZIP-тесты.

---

### Пошаговый чеклист «чтобы кнопка заработала»

```
[ ] A1–A3  Проект GCP + Drive API + consent screen + test user
[ ] A4–A6  Web + Android OAuth clients (package com.lichka, SHA-1)
[ ] A7     WEB_CLIENT_ID в googleSignIn.ts
[ ] A8     Rebuild приложения
[ ] B2     uploadBackup → ZIP (temp export + upload)
[ ] B3–B4  downloadBackup → importFromZIP (+ JSON fallback)
[ ] B5     Локали (убрать «без медиа» для ZIP)
[ ] B6     Тесты
[ ] Ручной прогон: Настройки → Сохранить в GD → другой эмулятор/wipe → Восстановить → медиа на месте
```

Порядок: **A можно сделать параллельно с B**; без A7 кнопка всё равно упадёт на Sign-In.

## Влияние на архитектуру (FSD)

| Слой | Файл | Изменение |
|------|------|-----------|
| `features/google-drive` | `googleSignIn.ts` | реальный `webClientId` |
| `features/google-drive` | `googleDrive.ts` | ZIP upload/download; имя `licka-backup.zip`; API результат download |
| `features/google-drive` | `index.ts` | типы результата download при необходимости |
| `features/export` | `exportToZIP.ts` | опция temp-only target (для Drive, без Download) |
| `features/export` | `index.ts` | при новом хелпере — реэкспорт |
| `pages/settings` | `SettingsScreen.tsx` | restore через ZIP; тексты успеха |
| `shared/config` | `locale.ts` | строки бэкапа Drive |
| `docs/tasks` | `2026-07-20-data-integrity-audit.md` | закрыть T9 после реализации |

**Не трогаем:** локальный Export/Import файла, схему БД, auto-sync, шифрование.

Зависимости вниз: `google-drive` → `export` / `import` (уже так для JSON) — ок по FSD.

## Альтернативы

### 1. Оставить JSON в Drive, медиа отдельно файлами в appDataFolder
**Отклонено:** сложный mapping, много запросов, риск рассинхрона. ZIP уже есть локально.

### 2. ZIP через share sheet «сохранить в Drive» (без Drive API)
**Отклонено для этой кнопки:** другой UX, нет гарантированного restore «одной кнопкой»; OAuth+appDataFolder даёт скрытый бэкап в приложении.

### 3. Несколько версий бэкапов в Drive (история)
**Отложено:** MVP — один файл `licka-backup.zip` (overwrite), как сейчас с JSON.

### 4. Только GCP без ZIP (сначала «оживить» JSON-кнопку)
**Возможно как промежуточный шаг**, но целевой продукт по запросу — ZIP с медиа; делать сразу ZIP, чтобы не мигрировать UI дважды.

## Оценка сложности

| Компонент | Часы |
|-----------|------|
| GCP setup + SHA-1 + webClientId | 1–2 |
| `exportToZIP` temp target | 1 |
| `uploadBackup` ZIP (+ опционально resumable) | 2–4 |
| `downloadBackup` + Settings restore | 2 |
| Legacy JSON fallback | 0.5 |
| Локализация | 0.5 |
| Тесты | 2–3 |
| Документация / отчёт | 0.5 |
| **Итого** | **~9–13 часов** |

**Риски:**
- **Высокий (блокер):** неверный SHA-1 / package → Sign-In error; лечится A5–A6.
- **Средний:** большие ZIP в память при multipart — mitigations: resumable или лимит размера с понятной ошибкой.
- **Низкий:** старые JSON в Drive — закрывается fallback B4.
- **Низкий:** OAuth scope уже `drive.appdata` — менять не нужно.

## Тестирование
- Unit: upload пишет ZIP, ищет/патчит `licka-backup.zip`, чистит temp.
- Unit: download zip / json fallback / NO_BACKUP.
- Ручное: test user → Save → в Drive (appData не видно в UI Drive — ок) → Restore на чистом профиле → чаты + медиа.
- Регресс: локальный Export/Import ZIP без Drive.

## Известные ограничения
- Auto-sync / WorkManager — не в MVP.
- Шифрование ZIP — post-MVP.
- appDataFolder не видна в обычном UI Google Drive (только через API / приложение) — это ожидаемо.
- Пока consent screen в Testing — только добавленные test users.
- iOS credentials — когда появится iOS-таргет.

## Связанные документы
- `docs/features/zip-backup-proposal.md` — локальный ZIP (approved / реализован)
- `docs/reports/2026-06-28-google-drive-backup-investigation.md` — root cause placeholder client ID
- `docs/tasks/2026-07-20-data-integrity-audit.md` — T9 open
- `docs/spec/white-requirements.md` — #51, #64, #82 manual Drive backup
