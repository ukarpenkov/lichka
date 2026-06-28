# Расследование: Backup to Google Drive не работает

**Дата:** 2026-06-28
**Промпт/задача:** Почему не работает backup to Google Drive, нужно ли регистрировать приложение

## Что сделано
- Phase 1 Root Cause Investigation: найден плейсхолдер `YOUR_WEB_CLIENT_ID` в `src/features/google-drive/googleSignIn.ts:4`
- Проверена зависимость `@react-native-google-signin/google-signin` (v16.1.2) — установлена
- Проверен `android/app/build.gradle` — applicationId = `com.lichka`
- Проверен `app.json` — минималистичный конфиг

## Изменённые файлы
- (none — исследование без изменений кода)

## Принятые решения
- Причина — не зарегистрировано приложение в Google Cloud Console
- Нужно: создать OAuth credentials (Web + Android), включить Drive API, подставить webClientId

## Известные ограничения
- SHA-1 fingerprint для Android credentials не извлечён (нужен `./gradlew signingReport`)
- Для iOS credentials потребуется Bundle ID (не найден в app.json)

## Тестирование
- (не проводилось — проблема конфигурации, не кода)
