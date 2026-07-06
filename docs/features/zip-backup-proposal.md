# ZIP-бэкап с медиа в доступной директории

**Статус:** approved

## Название фичи
Экспорт/импорт данных в ZIP-архив (включая медиа) с сохранением в директорию, доступную из файлового менеджера.

## Описание проблемы
Текущий экспорт (`exportToJSON`) сохраняет одиночный JSON в `RNFS.DocumentDirectoryPath` — приватную внутреннюю директорию `/data/user/0/com.lichka/files/`, невидимую в файловом менеджере. Пользователь не может найти файл для импорта. Кроме того, в бэкап попадают **только данные БД** (пути вида `media/images/<id>.jpg`), сами медиафайлы (картинки, голосовые записи, аватары) не экспортируются — импорт на другом устройстве даёт битые ссылки. См. `docs/bugs/export-file-private-directory.md`.

## Предлагаемое решение

### Формат: ZIP-архив
Один файл `licka-backup-<YYYY-MM-DDTHH-MM-SS>.zip` со структурой:
```
licka-backup-<ts>.zip
├── backup.json          # { schema_version, exported_at, chats[], settings }
└── media/
    ├── avatars/<chatId>.jpg
    ├── images/<messageId>.jpg
    └── voice/<id>.m4a
```

Почему ZIP (а не base64 в JSON и не папка с файлами):
- **Один файл** — удобно шарить, передавать, искать в файловом менеджере.
- **Сжатие** — медиа и JSON сжимаются; размер меньше base64-варианта.
- **Стандартный формат** — открывается любой программой на любой ОС.
- В отличие от base64-in-JSON: нет +33% оверхеда, нет риска упасть на `JSON.parse` сотен МБ, нет роста памяти.
- В отличие от «папка + JSON + файлы»: один файл (DocumentPicker выбирает один файл), не нужно тащить папку.

### Доступная директория сохранения
Попытка записи в `RNFS.DownloadDirectoryPath` (`/storage/emulated/0/Download/`) — истинно публичная папка. При ошибке `EACCES` (scoped storage на Android 11+, `targetSdk=36`, нет `MANAGE_EXTERNAL_STORAGE`) — fallback на `RNFS.ExternalDirectoryPath` (`/storage/emulated/0/Android/data/com.lichka/files/`), которая:
- всегда доступна для записи **без разрешений**;
- видна в файловых менеджерах на большинстве устройств (Samsung My Files, Solid Explorer и т.п.) и через USB/MTP.

Пользователю показывается **реальный путь** в сообщении об успехе.

### Экспорт (flow)
1. Собрать данные через существующую логику `exportToJSON` (переиспользуем сборку `ExportData`, но пишем во staging).
2. Создать staging-папку в `RNFS.CachesDirectoryPath/lichka-export-staging-<ts>/`.
3. Записать туда `backup.json`.
4. Собрать **референсные** медиапути: `chat.avatarPath` + `message.payload.uri` (для image/voice). Скопировать существующие файлы в `staging/media/<...>`, сохраняя относительную структуру. Не копируем orphan-файлы (не referenced) — это автоматически чистит бэкап.
5. `zip(stagingDir, targetZip)` → `react-native-zip-archive`.
6. Очистить staging-папку.
7. Вернуть путь к zip.

### Импорт (flow)
1. `DocumentPicker.pickSingle` — выбирает `.zip` (или устаревший `.json` для обратной совместимости).
2. Если `.zip`: распаковать в `CachesDirectoryPath/lichka-import-<ts>/`.
   - Прочитать `backup.json`, вызвать ядро `importFromJSON(jsonString, mode)` (БД).
   - Скопировать `media/` из распаковки в `MEDIA_DIR` (перезапись существующих). `ensureDir` для каждой поддиректории.
   - Очистить временную папку.
3. Если `.json`: легаси-путь — `importFromJSON` напрямую (старые бэкапы без медиа).
4. Вернуть `ImportResult` (+ счётчик восстановленных медиафайлов).

### Обратная совместимость
- `exportToJSON` / `importFromJSON` **не меняются** — используются Google Drive бэкапом (JSON без медиа в `appDataFolder`).
- Старые `.json` бэкапы по-прежнему импортируются (без медиа).
- Google Drive бэкап медиа не включает (out of scope — отмечено отдельным ограничением).

## Влияние на архитектуру (FSD)

| Слой | Файл | Изменение |
|------|------|-----------|
| `features/export` | `exportToZIP.ts` | **новый** — staging + zip |
| `features/export` | `exportToJSON.ts` | без изменений (вынесен хелпер сборки данных в общий модуль `buildExportData`) |
| `features/export` | `index.ts` | реэкспорт `exportToZIP` |
| `features/import` | `importFromZIP.ts` | **новый** — unzip + восстановление медиа |
| `features/import` | `importFromJSON.ts` | без изменений (ядро импорта БД) |
| `features/import` | `index.ts` | реэкспорт `importFromZIP` |
| `features` | `index.ts` | реэкспорт новых функций + `ZipImportResult` |
| `shared/lib` | `mediaPath.ts` | без изменений (`MEDIA_DIR`, `ensureDir`, `resolveMediaPath` переиспользуются) |
| `shared/config` | `locale.ts` | `exportDone` путь, `mediaRestored`, `importFailed`, `notBackupFile` |
| `pages/settings` | `SettingsScreen.tsx` | Export→`exportToZIP`, Import определяет `.zip`/`.json` |
| `package.json` | — | `+ react-native-zip-archive@^8` |
| `android/app/src/main/AndroidManifest.xml` | — | без изменений (ExternalDirectoryPath не требует разрешений) |

**Не затронуты:** Google Drive, уведомления, FTS, scheduled-сообщения, UI чатов.

## Альтернативы

### 1. Один JSON с base64-медиа
**Отклонено:** +33% размера, `JSON.parse` падает на сотнях МБ, рост памяти. Плохо масштабируется для голосовых записей.

### 2. Папка с JSON + медиафайлами рядом
**Отклонено:** много файлов — `DocumentPicker` выбирает один файл; сложно шарить; неудобный импорт.

### 3. `MANAGE_EXTERNAL_STORAGE` для гарантированной записи в `/Download/`
**Отклонено (как основной путь):** тяжёлое разрешение «All files access» — избыточно для бэкапа, плохой UX (поездка в Settings). Оставлено fallback на `ExternalDirectoryPath` без разрешений.

### 4. Share Sheet (`react-native-share`) для «Save to Downloads»
**Отложено (future enhancement):** самый user-friendly способ без разрешений — но требует второй нативной зависимости. Текущее решение (Download → fallback External) покрывает требование одной зависимостью. Share sheet можно добавить позже как опциональный «Поделиться бэкапом».

## Оценка сложности

| Компонент | Часы |
|-----------|------|
| Установка `react-native-zip-archive` + проверка сборки | 1 |
| `exportToZIP.ts` (staging + копирование медиа + zip) | 2 |
| `importFromZIP.ts` (unzip + восстановление медиа) | 2 |
| `SettingsScreen` (Export/Import flow) | 1 |
| Локализация (RU/EN) | 0.5 |
| Тесты (≥80% на модуль) | 3 |
| Документация (bug + proposal + report) | 1 |
| **Итого** | **~10.5 часов** |

**Риски:**
- **Средний:** `react-native-zip-archive@8` + RN 0.85 New Arch — библиотека заявляет поддержку TurboModules; при проблемах применим `patch-package` (уже используется в проекте).
- **Низкий:** Scoped storage — fallback на `ExternalDirectoryPath` гарантирует запись без разрешений.
- **Низкий:** Копирование больших медиа — операция async, UI показывает Alert после завершения.

## Известные ограничения
- Google Drive бэкап **не включает медиа** (только JSON). Включение медиа в GD — отдельная задача (загрузка файлов в Drive + хранение mapping).
- На Android 13+ папка `Android/data/<pkg>/files` может быть скрыта в «Files by Google» — нужен сторонний файловый менеджер или USB. Публичная `Download` доступна только при возможности записи (старый Android или `MANAGE_EXTERNAL_STORAGE`).
- Экспорт копирует только **referenced** медиа — orphan-файлы (без записи в БД) в бэкап не попадают (это желательно, см. `cleanupOrphanMedia`).
- Формат `.zip` не шифруется — не хранить чувствительные данные в открытом виде на共享 device без пароля (future: `zipWithPassword`).

## Тестирование
- Unit: `exportToZIP` — мок `react-native-zip-archive` + `RNFS`; проверка структуры staging, копирования referenced медиа, имени zip.
- Unit: `importFromZIP` — мок unzip + `RNFS`; проверка вызова `importFromJSON` с содержимым `backup.json`, копирования медиа в `MEDIA_DIR`, cleanup.
- Integration: export→import round-trip с image- и voice-сообщениями.
- Обратная совместимость: импорт старого `.json` (без медиа).
- Ручное: Settings → Export → найти zip в файловом менеджере → Import на другом устройстве → медиа отображаются.
