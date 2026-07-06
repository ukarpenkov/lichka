# Баг: Экспорт файла в недоступную директорию

## Описание
При нажатии кнопки «Export File» в Settings файл бэкапа сохраняется во внутреннюю приватную директорию приложения (`/data/user/0/com.lichka/files/`), которая недоступна через файловый менеджер устройства. Пользователь не может найти экспортированный файл и использовать его для импорта.

Дополнительно: текущий экспорт сохраняет **только JSON** (чаты, сообщения, настройки). Медиафайлы (картинки `media/images/`, голосовые записи `media/voice/`, аватары `media/avatars/`) **не включаются** в бэкап — после импорта на другом устройстве все медиа будут битые.

## Воспроизведение
1. Открыть Settings
2. Нажать «Export File»
3. Получить сообщение об успешном сохранении с путём `/data/user/0/com.lichka/files/licka-backup-<ts>.json`
4. Попытаться найти файл через файловый менеджер — файл недоступен

## Ожидаемое поведение
Файл сохраняется в директорию, доступную из файлового менеджера (публичная папка Download или app-specific external files dir), и содержит не только данные БД, но и все медиафайлы — чтобы импорт на другом устройстве полностью восстанавливал состояние.

## Фактическое поведение
- Файл сохраняется в `RNFS.DocumentDirectoryPath` (`src/features/export/exportToJSON.ts:70`) — приватная внутренняя директория, невидимая в файловом менеджере.
- В бэкапе отсутствуют медиафайлы — экспортируется только JSON с путями вида `media/images/<id>.jpg`, сами файлы не копируются.

## Причина
1. `exportToJSON` использует `RNFS.DocumentDirectoryPath` (внутреннее хранилище приложения) вместо публичной/доступной директории.
2. Формат экспорта — одиночный JSON без медиа. Нет упаковки файлов в архив.

## Решение
- Формат экспорта/импорта: **ZIP-архив** (`licka-backup-<ts>.zip`), содержащий `backup.json` + папку `media/` (avatars, images, voice). Один файл удобно шарить и искать.
- Сохранение в доступную директорию: сначала пробуем `RNFS.DownloadDirectoryPath` (публичная Download), при ошибке `EACCES` (scoped storage на Android 11+) падаем на `RNFS.ExternalDirectoryPath` (`/storage/emulated/0/Android/data/com.lichka/files/`), которая всегда доступна для записи без разрешений и видна в файловом менеджере. Пользователю показывается реальный путь.
- Импорт: `react-native-document-picker` выбирает `.zip` (или устаревший `.json` для обратной совместимости). Для ZIP — распаковка во временную папку, импорт `backup.json` в БД, копирование `media/` в `MEDIA_DIR`.
- Google Drive бэкап остаётся на JSON (`exportToJSON`/`importFromJSON` не меняются) — медиа в GD не передаётся (out of scope, отмечено в proposal).

## Затронутые файлы
- `src/features/export/exportToJSON.ts` — без изменений (используется Google Drive)
- `src/features/export/exportToZIP.ts` — **новый**, сборка staging-папки + zip
- `src/features/export/index.ts` — реэкспорт `exportToZIP`
- `src/features/import/importFromJSON.ts` — без изменений (переиспользуется как ядро)
- `src/features/import/importFromZIP.ts` — **новый**, распаковка + восстановление медиа
- `src/features/import/index.ts` — реэкспорт `importFromZIP`
- `src/features/index.ts` — реэкспорт новых функций
- `src/pages/settings/SettingsScreen.tsx` — Export→`exportToZIP`, Import определяет `.zip`/`.json`
- `src/shared/config/locale.ts` — обновлены строки (`exportDone`, `mediaRestored`, и т.д.)
- `package.json` — добавлен `react-native-zip-archive`

## Статус
Открыт — в работе (см. `docs/features/zip-backup-proposal.md`)
