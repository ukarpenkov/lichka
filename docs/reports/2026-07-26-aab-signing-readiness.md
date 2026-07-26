# Готовность к AAB-сборке для Google Play

**Дата:** 2026-07-26  
**Промпт/задача:** Проверить, готово ли приложение к AAB-сборке или нужна подпись

## Что сделано
- Проверена конфигурация подписи в `android/app/build.gradle`
- Проверено наличие release keystore и свойств `LICHKA_UPLOAD_*` в `~/.gradle/gradle.properties`
- Сверено с инструкцией `docs/release/android-aab-google-play.md`

## Изменённые файлы
- (код не менялся)

## Принятые решения
- Вердикт: **не готово к загрузке в Google Play** — нужна release-подпись

### Текущее состояние
| Проверка | Статус |
|----------|--------|
| `bundleRelease` технически соберётся | Да (Gradle есть) |
| Release signed своим keystore | Нет — `signingConfigs.release` отсутствует |
| `buildTypes.release` | Подписан **debug.keystore** (`signingConfigs.debug`) |
| `lichka-release.keystore` | Нет |
| `LICHKA_UPLOAD_*` в `~/.gradle/gradle.properties` | Нет |

## Известные ограничения
- AAB, подписанный debug-ключом, Google Play **не примет**
- После создания upload keystore его нельзя «забыть»: смена ключа без Play App Signing сильно усложняет обновления

## Тестирование
- Проверка файлов и конфигов; сборка не запускалась
