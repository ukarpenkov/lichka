# Инструкция по сборке релизного APK

**Дата:** 2026-07-13
**Промпт/задача:** Изучить проект и написать инструкцию по сборке релизного APK для Android.

## Что сделано
- Изучена структура проекта (React Native 0.85.3, FSD, Kotlin + Hermes + New Architecture).
- Прочитан `android/app/build.gradle`, `android/build.gradle`, `android/gradle.properties`, `android/local.properties`, `AndroidManifest.xml`, `proguard-rules.pro`.
- Проверено окружение: JDK 21, Android SDK в `/Users/ukarpenkov/Library/Android/sdk`, NDK 27.1.12297006, buildTools 36.0.0.
- Сформирована пошаговая инструкция по подготовке keystore, настройке подписи, инкременту versionCode, сборке APK/AAB и проверке артефактов.

## Изменённые файлы
- Файлы проекта не изменялись — задача была аналитической.

## Принятые решения
- В инструкции использован подход с хранением паролей keystore в `gradle.properties` через property-флаги (`LICHKA_RELEASE_*`), чтобы можно было легко переопределять их в CI через `-P` или `~/.gradle/gradle.properties`. Реальные значения рекомендовано хранить вне репозитория.
- Для распространения рекомендован **AAB** (`bundleRelease`) — требование Google Play.
- Universal APK (`assembleRelease`) оставлен как опция для прямого распространения / тестирования.
- ProGuard/R8 предложено включить отдельным шагом (текущее значение `enableProguardInReleaseBuilds = false` в `android/app/build.gradle:60`) с оговоркой про возможные `keep`-правила для используемых нативных модулей.
- Флаг `reactNativeArchitectures` (`android/gradle.properties:29`) уже включает все три ABI (`arm64-v8a, armeabi-v7a, x86_64`), поэтому universal APK соберётся со всеми нативными lib; для уменьшения размера рекомендован split по arm64.

## Известные ограничения
- В текущем состоянии конфиг `release` в `android/app/build.gradle:107` всё ещё ссылается на `signingConfig signingConfigs.debug` — это заглушка шаблона RN. Без шага 3 инструкции APK будет подписан отладочным ключом и не примет Google Play.
- В `android/app/proguard-rules.pro` нет кастомных правил — после включения R8 может потребоваться отладка missing-classes для `@op-engineering/op-sqlite`, `@react-native-google-signin`, `react-native-reanimated`, `react-native-audio-recorder-player` и др.
- В `AndroidManifest.xml` присутствуют «чувствительные» permissions (`SCHEDULE_EXACT_ALARM`, `USE_FULL_SCREEN_INTENT`, `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`) — для Google Play потребуется обоснование в review-форме.

## Тестирование
- Код проекта не изменялся, тесты не запускались.
- Инструкция валидирована на основе актуального состояния gradle-конфигов и общеизвестного workflow сборки RN 0.85.
