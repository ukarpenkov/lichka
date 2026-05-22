# Структура папок FSD

**Дата:** 2026-05-22
**Промпт/задача:** Создать все папки под Feature-Sliced Design

## Что сделано

- Добавлена корневая папка `src/` с шестью слоями FSD: `app`, `pages`, `widgets`, `features`, `entities`, `shared`
- В каждом слое создан `index.ts` как точка public API (пустой `export {}` до появления слайсов)
- В `shared` добавлены стандартные сегменты: `ui`, `lib`, `api`, `config`, `assets`
- `shared/index.ts` реэкспортирует сегменты `ui`, `lib`, `api`, `config`

## Изменённые файлы

- `src/app/index.ts` — public API слоя app
- `src/pages/index.ts` — public API слоя pages
- `src/widgets/index.ts` — public API слоя widgets
- `src/features/index.ts` — public API слоя features
- `src/entities/index.ts` — public API слоя entities
- `src/shared/index.ts` — агрегирующий public API shared
- `src/shared/ui/index.ts` — UI-kit
- `src/shared/lib/index.ts` — утилиты
- `src/shared/api/index.ts` — API-клиент
- `src/shared/config/index.ts` — конфигурация
- `src/shared/assets/.gitkeep` — placeholder для статики

## Принятые решения

- Слайсы (`entities/note`, `features/addNote` и т.д.) **не** создавались заранее — они появляются при реализации конкретных фич
- `App.tsx` оставлен в корне проекта; перенос в `src/app/` — отдельный шаг
- Сегмент `assets` без `index.ts` — бинарные ресурсы не экспортируются через TS API

## Известные ограничения

- `index.js` по-прежнему импортирует `./App` из корня
- Алиасы путей (`@/shared`, `@/entities`) в `tsconfig.json` не настроены

## Тестирование

- Не требовалось (только структура каталогов)
