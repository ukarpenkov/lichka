# Подложка destructive-кнопок в AlertDialog

**Дата:** 2026-08-21
**Промпт/задача:** У кнопок уведомлений с постоянным цветом (как «Удалить» на скрине) выступающая подложка должна совпадать с цветом кнопки, а не с цветом темы. Найти все похожие кнопки и сделать постоянную подложку.

## Что сделано
- Заведён баг `docs/bugs/alert-destructive-button-theme-shadow.md`.
- В `HardShadowButton` акцент destructive (`colors.destructive`) применяется и к обводке лица, и к hard-shadow подложке.
- Cancel и default по-прежнему используют подложку цвета темы (`text`).
- Все диалоги приложения идут через один `AlertDialog` — отдельной правки по экранам не потребовалось.
- Добавлены unit-тесты на цвет подложки/обводки.

## Изменённые файлы
- `src/shared/ui/AlertDialog.tsx` — `accentColor` для destructive; `testID` слоёв кнопки; импорт `useTheme` из `ThemeProvider`
- `src/shared/ui/__tests__/AlertDialog.test.tsx` — тесты destructive vs cancel/default
- `docs/bugs/alert-destructive-button-theme-shadow.md` — описание бага

## Принятые решения
- Похожие кнопки не дублировались: hard-shadow кнопки есть только в `AlertDialog`. Контекстные меню (`ChatContextMenu`, `MessageContextMenu`) имеют тень на всей карточке, не на отдельных пунктах.
- Постоянный цвет сейчас только у `style: 'destructive'` (`fixedColors.destructive` = `#E53935`). Cancel использует `muted` (альфа от темы) — это не постоянный цвет, подложка остаётся тематической.
- Логика сведена к одному `accentColor`: destructive → `colors.destructive`, иначе → `shadowColor` темы.

## Известные ограничения
- Если появятся другие кнопки с постоянным акцентом (не destructive), их нужно будет добавить в ту же ветку `accentColor`.
- Ручная проверка на устройстве в neon-теме остаётся полезной: визуально «Удалить» должна быть целиком красной.

## Тестирование
```bash
npx jest src/shared/ui/__tests__/AlertDialog.test.tsx --no-coverage
```

Покрыто:
- destructive: подложка и border = `#E53935`, не цвет темы;
- cancel и default: подложка и border = ink темы.

Рекомендуемый ручной сценарий:
1. Список чатов → удалить чат → у «Удалить» красные текст, рамка и подложка; у «Отмена» — цвет темы.
2. Чат → удалить сообщение — то же.
3. Настройки → destructive-диалоги (удаление данных / replace при импорте) — то же.
