# Виджет PeriodPicker — периодичность напоминаний

**Дата:** 2026-05-25
**Промпт/задача:** Реализация задачи 5.6 — Picker периодичности (PeriodPicker)

## Что сделано

- Создан виджет `PeriodPicker` в `src/widgets/period-picker/`
- Компонент отображает модальное окно с выбором интервала периодичности
- Пять пресетов: 5 мин, 10 мин, 15 мин, 1 час, 1 день
- Поле ввода для произвольного интервала (в минутах)
- Кнопки «Отмена» и «Готово»
- Виджет экспортирован через `src/widgets/index.ts`
- Интегрирован в `MessageComposer` (иконка Repeat) — заменяет старый `IntervalPicker`

## Изменённые файлы

- `src/widgets/period-picker/PeriodPicker.tsx` — основной компонент виджета
- `src/widgets/period-picker/index.ts` — barrel-экспорт
- `src/widgets/index.ts` — добавлен экспорт `PeriodPicker`
- `src/widgets/message-composer/MessageComposer.tsx` — замена `IntervalPicker` на `PeriodPicker`
- `src/widgets/message-composer/IntervalPicker.tsx` — удалён (заменён на `PeriodPicker`)

## Принятые решения

- Паттерн модального окна — как в `DateTimePicker`: `Modal` + `Pressable` overlay
- Акцентный цвет `#4A9EFF` — как в DateTimePicker (hardcoded, не из темы)
- `KeyboardAvoidingView` для корректной работы с клавиатурой на iOS
- Пресеты как `Pressable` с рамкой — визуально выделяют активный выбор
- Поле ввода принимает только цифры (фильтрация в `handleCustomChange`)
- Кнопка «Готово» дизейблится, если не выбран ни пресет, ни введён кастомный интервал

## Известные ограничения

- Акцентный цвет захардкожен — не зависит от темы (как и в DateTimePicker)
- Нет валидации максимального значения (теоретически можно ввести 9999 мин)

## Тестирование

- Ручная проверка: открытие модалки, выбор пресета, ввод кастомного значения, подтверждение, отмена
