# Исправление TypeScript ошибок

**Дата:** 2026-05-29
**Промпт/задача:** Проверить весь проект на TS ошибки и исправить

## Что сделано

- Установлен `@types/jest` — все тестовые файлы (`__tests__/`) теперь корректно типизированы
- Добавлен `types: ["jest"]` в `tsconfig.json`
- Создан `document-picker/src/invariant.d.ts` — декларация модуля `invariant`
- Исправлен тип `quality: 0.85` в `ChatForm.tsx` — приведение к `PhotoQuality`
- Исправлен тип навигации в `ScheduledScreen.tsx` — замена `as never` на `(navigation as any).navigate()`

## Изменённые файлы

- `tsconfig.json` — добавлен `types: ["jest"]`
- `package.json` / `package-lock.json` — добавлен `@types/jest` в devDependencies
- `document-picker/src/invariant.d.ts` — новый файл, декларация типа для модуля `invariant`
- `src/widgets/chat-form/ChatForm.tsx:75` — `quality: 0.85` → `quality: 0.85 as PhotoQuality`
- `src/pages/scheduled/ScheduledScreen.tsx:37` — исправлен вызов `navigation.navigate()` для вложенного навигатора

## Принятые решения

- **`@types/jest`** — установлен как devDependency, а не через `skipLibCheck`, т.к. типы нужны для автодополнения в тестах
- **`invariant.d.ts`** — создана локальная декларация вместо установки `@types/invariant` (пакет не существует в DefinitelyTyped)
- **`as any` для навигации** — использовано вместо `as never`, т.к. React Navigation не предоставляет типобезопасный способ навигации через вложенные стеки без `createNativeStackNavigator`

## Известные ограничения

- Навигация в `ScheduledScreen.tsx` использует `as any` — при миграции на типизированный навигатор (`RootStackParamList`) это место нужно будет обновить

## Тестирование

- `npx tsc --noEmit` — 0 ошибок
