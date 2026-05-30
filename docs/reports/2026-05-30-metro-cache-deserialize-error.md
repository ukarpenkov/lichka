# Ошибка десериализации кэша Metro

**Дата:** 2026-05-30
**Промпт/задача:** При запуске Metro — `Error while reading cache, falling back to a full crawl: Unable to deserialize cloned data`

## Что сделано
- Добавлен скрипт `scripts/clear-metro-cache.mjs` — удаляет `metro-file-map-*`, `metro-cache` и `.metro-health-check*` в `%TEMP%` и в корне проекта
- В `package.json`: `npm run metro:clean-cache` и `npm run start:reset` (очистка + `react-native start --reset-cache`)

## Изменённые файлы
- `scripts/clear-metro-cache.mjs` — новый скрипт очистки
- `package.json` — npm-скрипты `metro:clean-cache`, `start:reset`

## Принятые решения
- Кэш file-map лежит в системном `tmpdir` (по умолчанию Metro), а не в репозитории — чистим там, где создаётся файл
- `--reset-cache` сбрасывает только transform cache (`cacheStores`), поэтому отдельно чистим file-map

## Известные ограничения
- Предупреждение не фатально: Metro всё равно делает full crawl и пересоздаёт кэш
- Повтор может появиться после смены версии Node, прерванной записи кэша или гонки двух Metro на одном порту

## Тестирование
- `node scripts/clear-metro-cache.mjs` — выполнен локально
