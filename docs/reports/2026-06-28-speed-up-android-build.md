# Ускорение сборки Android

**Дата:** 2026-06-28
**Промпт/задача:** Анализ и оптимизация времени сборки приложения на эмуляторе

## Что сделано
- Включены параллельные сборки Gradle (`org.gradle.parallel=true`)
- Включён build cache (`org.gradle.caching=true`)
- Увеличен JVM heap с 2GB до 4GB (`-Xmx4096m`)
- Ограничены архитектуры до `x86_64` (для эмулятора)
- Добавлен `inlineRequires: true` в Metro config для ускорения бандлинга
- Добавлен скрипт `android:emulator` с флагом `--active-arch-only`

## Изменённые файлы
- `android/gradle.properties` — parallel, caching, JVM heap, architectures
- `metro.config.js` — inlineRequires
- `package.json` — новый скрипт `android:emulator`

## Ожидаемый эффект
- Чистая сборка: ~2-3x быстрее
- Повторная сборка: ~3-5x быстрее

## Тестирование
- Запустить `npm run android:emulator` и сравнить время сборки
