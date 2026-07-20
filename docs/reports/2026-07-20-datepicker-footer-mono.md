# DatePicker: текстовые кнопки футера + JetBrains Mono

**Дата:** 2026-07-20
**Промпт/задача:** Убрать бордер/заливку у кнопок Отмена / Сегодня / Готово — только текст с цветами (краснее / зелёнее / голубее) в духе DESIGN.md; проверить и применить mono-шрифт приложения на месяцы, часы и даты.

## Что сделано
- Футер DateTimePicker: кнопки без `background` / `borderRadius` — только текст (`variant="button"`).
- Цвета:
  - **Отмена** → `colors.destructive` (`#E53935`, semantic red из DS)
  - **Сегодня** → фиксированный green `#2EAF6E` (читается на light/dark canvas)
  - **Готово** → picker accent `#4A9EFF` (уже используется в кольце/тайме)
- Mono (JetBrains) там, где не было:
  - метки кольца месяцев/дней (`BezelLabel` / `Animated.Text`)
  - крупный день в шапке (`Animated.Text`)
  - часы/минуты и двоеточие в `TimeScroller` (явный `fonts.bold` / `fonts.regular` / `fonts.semiBold`)
  - имя месяца в шапке — `fonts.medium`

## Изменённые файлы
- `src/widgets/datetime-picker/DateTimePicker.tsx` — футер text-only + mono на day/month header
- `src/widgets/datetime-picker/BezelLabel.tsx` — `fontFamily: fonts.semiBold`
- `src/widgets/datetime-picker/TimeScroller.tsx` — явные JetBrains faces для чисел и `:`

## Принятые решения
- Цветные подписи действий — фиксированные accents вне пары темы (как badge/destructive), без заливок — ближе к terminal «borders by default no» из DESIGN.md.
- Голубой accent пикера сохранён для Готово и выделения кольца (legacy `#4A9EFF`), не вводили новый brand-accent в токены.

## Известные ограничения
- На теме `green-on-black` «Сегодня» ближе к ink темы — различие слабее, чем на light/dark.
- Кольцо/selection по-прежнему с `#4A9EFF` (вне 2-color инварианта DESIGN; уже отмечалось в отчётах редизайна).

## Тестирование
- Линт изменённых файлов — без новых ошибок.
- Визуально: открыть DateTimePicker → проверить футер (текст без pill) и mono на кольце месяцев/дней и скроллере часов.
