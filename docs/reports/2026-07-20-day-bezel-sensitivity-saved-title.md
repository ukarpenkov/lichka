# Day bezel sensitivity + short default chat title

**Дата:** 2026-07-20
**Промпт/задача:** Снизить чувствительность листания дней на безеле (месяцы ок); переименовать дефолтный чат в короткое имя, чтобы не обрезалось в шапке.

## Что сделано

### DateTimePicker — день
- `DAY_ROTATION_GAIN = 0.62` — палец крутит день медленнее, чем месяц
- `DAY_STEP_THRESHOLD = 0.62` — день переключается только после ~62% шага (не на половине как `Math.round`)
- На отпускании: если не дотянули до порога — snap назад к текущему дню
- Месяцы без изменений

### Default chat
- Title: `Saved messages` → `Saved`
- Миграция при `seedDefaultChat()` для уже существующих БД с legacy-заголовком
- Пользовательские переименования не трогаем (только точное `Saved messages`)

## Изменённые файлы
- `src/widgets/datetime-picker/DateTimePicker.tsx` — gain + hysteresis для day ring
- `src/entities/chat/model/chatRepository.ts` — `DEFAULT_CHAT_TITLE`, `migrateLegacyDefaultChat`
- `src/entities/chat/__tests__/chatRepository.test.ts` — ожидания + тест миграции title

## Принятые решения
- Короткое **Saved** (не «Сохранённое») — Press Start 2P широкий, кириллица снова рискнет `…`
- Миграция только точного legacy-строки, чтобы не затирать кастомные названия

## Известные ограничения
- Gain/threshold подобраны «на глаз»; при необходимости можно чуть подкрутить

## Тестирование
- Линт — ок
- Unit: `chatRepository` (seed + migrate title/icon)
