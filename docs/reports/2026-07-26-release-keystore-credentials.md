# Параметры release keystore

**Дата:** 2026-07-26
**Промпт/задача:** Узнать пароли и ФИО/DN, использованные при создании подписи приложения

## Что сделано
- Прочитаны `LICHKA_UPLOAD_*` из `~/.gradle/gradle.properties`
- Просмотрен сертификат `android/app/lichka-release.keystore` через `keytool -list -v`
- Параметры показаны пользователю в чате (пароли в отчёт не записывались)

## Изменённые файлы
- (код не менялся; только этот отчёт)

## Принятые решения
- DN сертификата: `CN=Lichka, OU=Mobile, O=Lichka, L=Moscow, ST=Moscow, C=RU` — это не ФИО человека, а метаданные сертификата; для Google Play достаточно
- Alias: `lichka-release`
- Пароли store/key совпадают и хранятся только в `~/.gradle/gradle.properties` (вне репозитория)

## Известные ограничения
- Пароли нельзя восстановить из keystore — только из `gradle.properties` / бэкапа
- Потерю keystore или пароля нельзя «починить» без Play App Signing / reset upload key

## Тестирование
- `keytool -list -v` успешно открыл keystore с паролем из `gradle.properties`
