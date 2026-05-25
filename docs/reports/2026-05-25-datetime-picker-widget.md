# DateTimePicker Widget

**Дата:** 2026-05-25
**Промпт/задача:** 5.5 Picker даты/времени — кастомный picker с концентрическими кругами

## Что сделано

- Создан виджет `src/widgets/datetime-picker/` по FSD
- Реализованы 2 концентрических круга:
  - Внешний круг (дни 1–31) с Pan gesture через react-native-gesture-handler
  - Внутренний круг (месяцы 1–12) с Pan gesture
- Центр: горизонтальный скролл часов (0–23) и минут (0–59) с snap
- YearPicker — стрелки ← → для выбора года (±10 лет от текущего)
- Возвращает `Date` (UTC) при подтверждении
- Кнопки «Отмена» и «Готово» — text-кнопки без border
- Учёт локали устройства: определение 12/24 формата через `Intl.DateTimeFormat`
- Анимации через react-native-reanimated
- Accent color: `#4A9EFF` для выделения выбранного элемента
- Интеграция в `MessageComposer.tsx` — заменён старый `DateTimePickerModal`
- Обновлён barrel export в `src/widgets/index.ts`
- Задача 5.5 отмечена как выполненная в трекере

## Изменённые файлы

- `src/widgets/datetime-picker/circularMath.ts` — утилиты: polar→cartesian, snap-to-segment, daysInMonth
- `src/widgets/datetime-picker/DayRing.tsx` — внешний круг (дни), Pan gesture, SVG
- `src/widgets/datetime-picker/MonthRing.tsx` — внутренний круг (месяцы), Pan gesture, SVG
- `src/widgets/datetime-picker/TimeScroller.tsx` — горизонтальный FlatList для часов/минут с snap
- `src/widgets/datetime-picker/YearPicker.tsx` — stepper для года
- `src/widgets/datetime-picker/DateTimePicker.tsx` — Modal-обёртка, компоновка всех элементов
- `src/widgets/datetime-picker/index.ts` — public API
- `src/widgets/message-composer/MessageComposer.tsx` — замена DateTimePickerModal → DateTimePicker
- `src/widgets/index.ts` — добавлен экспорт DateTimePicker
- `docs/tasks/promted-tasks.md` — 5.5 отмечена как done

## Принятые решения

- SVG (react-native-svg) для рендеринга кругов — точное позиционирование текста по окружности
- Accent color `#4A9EFF` — фиксированный, не зависит от темы (выбран пользователем)
- FlatList с `snapToInterval` для скролла часов/минут — нативное поведение snap
- `daysInMonth` учитывает високосные годы при смене месяца/года
- Pan gesture на всём контейнере круга — не нужно точно попадать по тексту

## Известные ограничения

- SVG текст не поддерживает кастомные шрифты так же гибко, как RN Text
- Нет тактильного отклика (HapticFeedback) при выборе сегмента
- При быстром drag по кругу возможна задержка snap (зависит от устройства)

## Тестирование

- Ручное: открыть чат → Bell → проверить выбор дня, месяца, года, часов, минут
- Проверить корректность возвращаемого Date (UTC)
- Проверить «Отмена» закрывает picker
- Проверить 12/24 формат при разных локалях
