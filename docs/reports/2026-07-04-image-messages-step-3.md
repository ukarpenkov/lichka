# IMAGES_DIR и saveImage в mediaPath.ts

**Дата:** 2026-07-04
**Промпт/задача:** Шаг 3 из `docs/tasks/image-messages-proposal-prompts.md` — добавить константу IMAGES_DIR и функцию saveImage

## Что сделано
- Добавлена константа `IMAGES_DIR = ${MEDIA_DIR}/images` в `src/shared/lib/mediaPath.ts`
- Добавлена функция `saveImage(sourceUri, messageId)`: создаёт директорию, перезаписывает существующий файл, копирует sourceUri, возвращает относительный путь
- Экспортированы `IMAGES_DIR` и `saveImage` из `src/shared/lib/index.ts`
- Написаны unit-тесты в `src/shared/lib/__tests__/mediaPath.test.ts`

## Изменённые файлы
- `src/shared/lib/mediaPath.ts` — `IMAGES_DIR`, `saveImage()`
- `src/shared/lib/index.ts` — экспорт `IMAGES_DIR`, `saveImage`
- `src/shared/lib/__tests__/mediaPath.test.ts` — тесты: создание директории, относительный путь, перезапись файла, strip `file://` префикса

## Принятые решения
- Функция `saveImage` реализована по аналогии с `saveAvatar`
- Целевой путь: `media/images/{messageId}.jpg`
- Существующий файл удаляется перед копированием (перезапись)

## Известные ограничения
- Нет

## Тестирование
- `npm test` — все тесты проходят (132 passed)
- Проверено: создание директории, копирование, перезапись, относительный путь
