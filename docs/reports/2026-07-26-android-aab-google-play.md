# Сборка release AAB для Google Play

**Дата:** 2026-07-26
**Промпт/задача:** собрать релизный AAB для Google Play

## Что сделано
- Остановлены параллельные Gradle-сборки (`./gradlew --stop`)
- Выяснено: в Cursor sandbox `GRADLE_USER_HOME` не указывает на `~/.gradle`, поэтому `LICHKA_UPLOAD_*` не подхватывались → `signReleaseBundle` NPE (Store/Alias = null)
- Сборка с `GRADLE_USER_HOME=$HOME/.gradle`: signing ок, AAB собран

## Изменённые файлы
- Код не менялся
- Артефакт: `android/app/build/outputs/bundle/release/app-release.aab`
- Отчёт: `docs/reports/2026-07-26-android-aab-google-play.md`

## Принятые решения
- Для сборки из Cursor/агента обязательно `GRADLE_USER_HOME=$HOME/.gradle`, иначе props из `~/.gradle/gradle.properties` не видны
- `versionCode 1` / `versionName "1.0"` — как в `android/app/build.gradle`

## Известные ограничения
- Параллельные `./gradlew --stop` / сборки на одном проекте ломают друг друга
- Без явного `GRADLE_USER_HOME` release signing в sandbox окружении пустой

## Тестирование
- `:app:signingReport` — release Store = `lichka-release.keystore`, Alias = `lichka-release`
- `GRADLE_USER_HOME=$HOME/.gradle ./gradlew bundleRelease` — BUILD SUCCESSFUL / EXIT:0
- `jarsigner -verify` — jar verified
