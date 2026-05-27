# Google Drive Manual Backup (12.3)

**Дата:** 2026-05-28
**Промпт/задача:** Реализация интеграции с Google Drive для ручного бэкапа — задача 12.3 из promted-tasks.md

## Что сделано

- Установлена зависимость `@react-native-google-signin/google-signin` (v16.1.2)
- Создан модуль `src/features/google-drive/` с тремя файлами:
  - `googleSignIn.ts` — OAuth через Google Sign-In с scope `drive.appdata`, функции `getGoogleToken()` и `signOutGoogle()`
  - `googleDrive.ts` — `uploadBackup(token)` (multipart upload в appDataFolder) и `downloadBackup(token)` (скачивание последнего бэкапа)
  - `index.ts` — public API
- Обновлён `src/features/index.ts` с экспортом google-drive
- Заменены заглушки в `SettingsScreen.tsx` на реальные handlers:
  - «Сохранить в Google Drive» — авторизация → экспорт → загрузка на Drive
  - «Восстановить из Google Drive» — авторизация → скачивание → выбор merge/replace (тот же UX что и импорт из файла)

## Изменённые файлы

- `package.json` — добавлен `@react-native-google-signin/google-signin`
- `src/features/google-drive/googleSignIn.ts` — новый файл
- `src/features/google-drive/googleDrive.ts` — новый файл
- `src/features/google-drive/index.ts` — новый файл
- `src/features/index.ts` — добавлен экспорт google-drive
- `src/pages/settings/SettingsScreen.tsx` — заменены заглушки на реальные handlers

## Принятые решения

- Используем `@react-native-google-signin/google-signin` для OAuth — стандартная библиотека для React Native
- Google Drive REST API напрямую через fetch (без отдельного Drive SDK) — у нас всего 2 операции (upload/download)
- Scope `drive.appdata` — доступ только к appDataFolder, не ко всем файлам пользователя
- При повторной загрузке ищем существующий файл и обновляем его (PATCH) вместо создания дубликата
- При восстановлении — тот же UX что и импорт из файла: выбор между «Объединить» и «Заменить всё» с подтверждением для деструктивной операции

## Известные ограничения

- **webClientId** — placeholder `YOUR_WEB_CLIENT_ID.apps.googleusercontent.com`, нужно создать в Google Cloud Console
- Медиафайлы (аватары, голосовые) не включаются в бэкап — только JSON-метаданные (как и в 12.1/12.2)
- Нет автоматической синхронизации — только manual trigger
- Нет индикатора загрузки (progress indicator) — операции обычно быстрые для JSON

## Тестирование

1. Заменить `YOUR_WEB_CLIENT_ID` на реальный ключ из Google Cloud Console
2. `npx react-native run-android`
3. Настройки → Сохранить в Google Drive → авторизация → Alert успеха
4. Настройки → Восстановить из Google Drive → выбор режима → восстановление
5. Проверить что merge не дублирует существующие данные
6. Проверить что replace корректно заменяет всё
7. Проверить обработку случая «нет бэкапа на Drive»
