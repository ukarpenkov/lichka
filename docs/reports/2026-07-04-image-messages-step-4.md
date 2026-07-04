# Утилита сжатия изображений imageCompress.ts

**Дата:** 2026-07-04
**Промпт/задача:** Шаг 4 из `docs/tasks/image-messages-proposal-prompts.md` — создать модуль сжатия изображений

## Что сделано
- Создан `src/shared/lib/imageCompress.ts` с функцией `pickAndCompressImage()`
- Функция использует `react-native-image-picker` (`launchImageLibrary`) с параметрами `maxWidth: 1920, maxHeight: 1920, quality: 0.75`
- Тип `CompressedImage = { uri, width, height, fileSize }`
- Возвращает `null` при отмене/ошибке/отсутствии asset
- Экспортирован из `src/shared/lib/index.ts`
- Написаны unit-тесты в `src/shared/lib/__tests__/imageCompress.test.ts`

## Изменённые файлы
- `src/shared/lib/imageCompress.ts` — `pickAndCompressImage()`, `CompressedImage`
- `src/shared/lib/index.ts` — экспорт `pickAndCompressImage`, `CompressedImage`
- `src/shared/lib/__tests__/imageCompress.test.ts` — тесты: параметры сжатия, успех, отмена, ошибка, пустой assets, отсутствие uri, значения по умолчанию

## Принятые решения
- Без новых зависимостей — используется `react-native-image-picker` (уже есть в проекте)
- Обёрнуто в Promise вокруг callback-based API библиотеки
- Значения по умолчанию для width/height/fileSize = 0

## Известные ограничения
- Сжатие происходит на стороне библиотеки image-picker, без дополнительного ресайза

## Тестирование
- `npm test` — все тесты проходят (132 passed)
- Проверено: параметры сжатия передаются, отмена→null, ошибка→null, edge cases
