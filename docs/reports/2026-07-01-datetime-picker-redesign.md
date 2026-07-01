# Редизайн DateTimePicker по макету HTML-прототипа

**Дата:** 2026-07-01
**Промпт/задача:** Реализовать обновлённый дизайн DateTimePicker на основе HTML-прототипа `docs/design/date-picker.html`

## Что сделано

### Кольца (месяцы и дни)
- Увеличена ширина трека колец до 44 px (было 22/16 px)
- Увеличен gap между кольцами до 28 px (было 7 px)
- Добавлен пунктирный разделитель (dashed SVG circle) между внешним и внутренним кольцами
- Убрана синяя подсветка слота (`strokeDasharray` highlight) — полностью удалена
- Выбранный элемент подсвечивается акцентным цветом через анимацию `BezelLabel`
- Неактивные дни (например, 31 февраля) отображаются с opacity 0.35 (`dimIndices` prop)
- Haptic feedback при смене значения — сохранён

### Пикер времени
- Полностью переписан `TimeScroller.tsx`
- Высота элемента: 46 px (было 28)
- Видимая область: 5 элементов (2 сверху + выбранный + 2 снизу) — было 3
- Добавлена полоса подсветки центральной строки (highlight bar с border и полупрозрачным фоном)
- Выбранный элемент: fontSize 28, fontWeight 600, акцентный цвет
- Невыбранные: fontSize 22, fontWeight 400, приглушённый цвет

### Навигация по году
- Диапазон годов изменён на 2020–2035 (был ±10 от текущего)
- Добавлено долгое нажатие (500 мс) на год → открытие модалки выбора года
- Создан новый компонент `YearGridModal.tsx` — модалка с сеткой 3×N годов
- Добавлена кнопка «Today» в строке навигации года

### Футер
- Добавлена кнопка «Сегодня» (Cancel | Сегодня | Done)
- Cancel теперь сохраняет исходное значение в `useRef` и восстанавливает его при отмене
- Done подтверждает выбор и обновляет `savedValue`

### Компоновка
- Пикер времени вынесен под кольца (отдельная секция, а не центр колец)
- Кольца теперь занимают весь контейнер без дырки под TimeScroller

## Изменённые файлы
- `src/widgets/datetime-picker/DateTimePicker.tsx` — полный редизайн компоновки, Cancel/Today/Done, модалка года
- `src/widgets/datetime-picker/geometry.ts` — новые размеры колец (44 px), gap (28 px), убран centerRadius
- `src/widgets/datetime-picker/Bezel.tsx` — удалён blue highlight, добавлен `dimIndices` prop
- `src/widgets/datetime-picker/BezelLabel.tsx` — поддержка `dim` prop (opacity 0.35)
- `src/widgets/datetime-picker/TimeScroller.tsx` — полный рерайт (46 px items, 5 visible, highlight bar)
- `src/widgets/datetime-picker/YearPicker.tsx` — long-press 500ms, Today, диапазон 2020–2035
- `src/widgets/datetime-picker/YearGridModal.tsx` — новый компонент, модалка выбора года

## Принятые решения
- Цвета берутся из темы приложения (`useTheme`), акцентный `#4A9EFF` как в оригинале
- Пунктирный разделитель — SVG `Circle` с `strokeDasharray="6 4"` поверх колец с `pointerEvents="none"`
- Дни для day-ring всегда 1–31 (31 метка), неактивные затемняются через `dimIndices`, а не скрываются

## Известные ограничения
- Автотестов для DateTimePicker по-прежнему нет

## Тестирование
- TypeScript компиляция: без ошибок
- ESLint: 0 errors, 10 warnings (inline styles — стандартный паттерн в проекте)
- Jest: 8 suites, 111 tests passed (регрессия существующих тестов)
