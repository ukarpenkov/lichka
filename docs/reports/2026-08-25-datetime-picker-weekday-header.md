# День недели в шапке DateTimePicker

**Дата:** 2026-08-25
**Промпт/задача:** Справа от выбранного дня в шапке пикера даты (год / месяц / день, не безель) показывать сокращённый день недели заглавными буквами на выбранном языке; высота шрифта как у года. Proposal, код, отчёт.

## Что сделано
- Описана фича в `docs/features/datetime-picker-weekday-header-proposal.md`
- В локальные бандлы добавлен массив `weekdaysShort` (воскресенье = индекс 0)
- Хелпер `getWeekdayShort` возвращает сокращение для даты и локали
- В шапке DateTimePicker справа от большого числа дня выводится сокращение (16px Mono Bold, цвет как у дня)

## Изменённые файлы
- `docs/features/datetime-picker-weekday-header-proposal.md` — proposal (status: implemented)
- `src/shared/config/locale/types.ts` — поле `weekdaysShort`
- `src/shared/config/locale/ru.ts`, `en.ts`, `es.ts`, `de.ts`, `fr.ts`, `pt.ts` — сокращения дней
- `src/shared/config/dateUtils.ts` — `getWeekdayShort`
- `src/shared/config/index.ts` — реэкспорт
- `src/widgets/datetime-picker/DateTimePicker.tsx` — ряд «день + день недели» в шапке
- `src/shared/config/__tests__/locale.test.ts` — 7 непустых сокращений в каждом бандле
- `src/shared/config/__tests__/dateUtils.test.ts` — `getWeekdayShort` по локалям

## Принятые решения
- Сокращения хранятся уже в верхнем регистре, без `toUpperCase` в UI
- Индекс = `Date.getDay()` (0 = воскресенье)
- Шрифт как у года: JetBrains Mono Bold, 16px; цвет как у числа дня
- Португальский — три буквы (`DOM`/`SEG`/…): двубуквенное `SE` неоднозначно для segunda и sexta
- Безель не трогали

## Известные ограничения
- Визуальную проверку выравнивания (baseline большого 44px-числа и 16px-подписи) нужно смотреть на устройстве/эмуляторе

## Тестирование
- `locale.test.ts`: у каждого бандла 7 непустых `weekdaysShort`
- `dateUtils.test.ts`: вторник 2026-08-25 → `ВТ` (ru) / `TU` (en); смена локали меняет строку; воскресенье 2026-08-30 → `ВС` / `SU`
- Jest: 53 теста в двух сьютах — pass
