# Локализация — ключи для изображений

**Дата:** 2026-07-04
**Промпт/задача:** Шаг 5 из `docs/tasks/image-messages-proposal-prompts.md` — добавить строки локализации для функциональности изображений

## Что сделано
- Добавлены ключи в интерфейс `LocaleDictionary`: `attachImage`, `imagePreview`, `removeImage`, `imagePickError`, `imageMessage`
- Добавлены русские значения: «Прикрепить изображение», «Предпросмотр», «Убрать», «Не удалось выбрать изображение», `[image:WxH]`
- Добавлены английские значения: «Attach image», «Preview», «Remove», «Failed to pick image», `[image:WxH]`
- Обновлены тесты в `src/shared/config/__tests__/locale.test.ts`

## Изменённые файлы
- `src/shared/config/locale.ts` — 5 новых ключей в `LocaleDictionary`, значения для `ru` и `en`
- `src/shared/config/__tests__/locale.test.ts` — тесты: template-функция `imageMessage`, строковые ключи не пустые

## Принятые решения
- `imageMessage(w, h)` — нейтральный формат `[image:WxH]`, одинаковый для обоих языков
- Формат аналогичен `voiceMessage(sec)` → `[voice:N]`

## Известные ограничения
- Нет

## Тестирование
- `npm test` — все тесты проходят (132 passed), тест «matching keys in ru and en» проходит
- Проверено: все ключи присутствуют в обоих словарях, значения не пустые
