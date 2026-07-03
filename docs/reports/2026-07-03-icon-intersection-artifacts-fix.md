# Фикс визуальных артефактов иконок (double-stroke overlap)

**Дата:** 2026-07-03
**Промпт/задача:** Исправить визуальный дефект иконок — яркие точки/утолщения в местах пересечения линий (баг `docs/bugs/icon-intersection-artifacts.md`)

## Что сделано

- **AlarmClockIcon** — добавлен ClipPath с `fillRule="evenodd"` для обрезки нижних ножек в зоне наложения на круг корпуса
- **MicIcon** — новый компонент с ClipPath, обрезающий дугу в зоне пересечения с корпусом микрофона
- **SettingsIcon** — новый компонент с ClipPath, обрезающий центральный круг в зоне пересечения с внутренним кольцом шестерни
- **MessageCircleIcon** — новый компонент: путь разделён на круг и хвостик, хвостик обрезан ClipPath в точке примыкания к кругу
- **IconButton** — тип `icon` расширен до `React.ComponentType<any>` для поддержки как Lucide, так и кастомных иконок

## Изменённые файлы

- `src/shared/ui/Icon.tsx` — добавлены AlarmClockIcon (с ClipPath), MicIcon, SettingsIcon, MessageCircleIcon
- `src/shared/ui/IconButton.tsx` — расширен тип `icon` для поддержки кастомных иконок
- `src/shared/ui/index.ts` — экспорт новых иконок
- `src/app/AppNavigator.tsx` — замена `MessageCircle`, `Settings` из lucide на кастомные `MessageCircleIcon`, `SettingsIcon`
- `src/widgets/message-composer/MessageComposer.tsx` — замена `AlarmClock`, `Mic` из lucide на кастомные `AlarmClockIcon`, `MicIcon`
- `src/pages/scheduled/ScheduledItem.tsx` — замена `AlarmClock` из lucide на кастомный `AlarmClockIcon`

## Принятые решения

- **ClipPath + `fillRule="evenodd"`** как основной механизм фикса: для каждой иконки создаётся `ClipPath` с «дыркой» в зоне пересечения элементов, и пересекающий элемент рендерится с этим `clipPath`, предотвращая double-stroke на стыках
- **MessageCircleIcon разделён на два пути** (круг + хвостик), так как оригинальный единый путь не имел отдельных пересекающихся элементов и требовал ClipPath именно на стыке

## Известные ограничения

- Размеры «дырок» подобраны эмпирически (с запасом 0.5–1px от геометрических границ). При изменении strokeWidth может потребоваться корректировка
- MessageCircleIcon использует реконструированный путь круга — визуально идентичен оригиналу, но требует ручного обновления при смене версии lucide

## Тестирование

- `npx tsc --noEmit` — без ошибок (только 2 предсуществующих ошибки в `AppNavigator.tsx:50` и `AlertDialog.tsx:130`)
- Требуется визуальная проверка на Android/iOS при размерах 20–24px
