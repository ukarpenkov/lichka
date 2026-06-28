# Удаление preview-лейбла из DateTimePicker

**Дата:** 2026-06-28
**Промпт/задача:** Убрать label месяца и дня при прокрутке, оставить только месяц и день в заголовке

## Что сделано
- Удалён блок preview (плавающий текст `previewLabel` с анимацией `FadeIn`/`FadeOut`) из DateTimePicker
- Удалены неиспользуемые импорты `FadeIn`, `FadeOut` из `react-native-reanimated`
- Удалена переменная `previewLabel`
- Удалены неиспользуемые стили `previewRow` и `previewText`

## Изменённые файлы
- `src/widgets/datetime-picker/DateTimePicker.tsx` — удалён preview-блок и связанный код

## Принятые решения
- Полное удаление preview-блока вместо скрытия через `display: 'none'` — чище, без мёртвого кода

## Известные ограничения
- Нет

## Тестирование
- TypeScript `tsc --noEmit` проходит без ошибок
