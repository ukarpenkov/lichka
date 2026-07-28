# UI-полировка Future Peek

**Дата:** 2026-07-28
**Промпт/задача:** При свайпе peek убрать бордер вокруг иконок и артефакты дат на header; добавить пиксельную вертикаль со стрелкой вниз (на 50% пути к compose). В режиме Future сообщения не должны прятаться за sticky «── Future ──» — позиция как у обычной ленты.

## Что сделано

- Убран `borderWidth` у badge якоря peek (часы + стрелка вперёд).
- Под якорем добавлен `PeekDownGuide`: вертикальная черта 2px + `ChevronRight` повёрнутый на 90° (стрелка вниз); наконечник на ~50% пути от иконок до compose (exit — flex-половина экрана; enter — короткий stub у низа).
- При rubber-band лента больше не заезжает на шапку: `overflow: 'hidden'` на `chatArea` / `listPane`, header выше по z-index (`headerShell`).
- В `FutureTimeline` добавлен `ListHeaderComponent` с тем же маркером `── Future ──`, что и sticky-chip (паттерн как у `DateSeparator` в истории) — строки начинаются ниже оверлея.

## Изменённые файлы

- `src/features/chat-future-peek/FuturePeekOverlay.tsx` — без бордера; колонка + `PeekDownGuide` для enter/exit
- `src/pages/chat-room/ChatRoomScreen.tsx` — clip ленты, z-index шапки
- `src/pages/chat-room/FutureTimeline.tsx` — list header под sticky Future
- `src/pages/chat-room/__tests__/FutureTimeline.test.tsx` — mock `futureMode` в locale

## Принятые решения

- Стрелка вниз — поворот существующего `ChevronRight`, без новой иконки в pixel-set.
- Отступ future-ленты — inline header как в истории (sticky перекрывает тот же текст), а не «магический» `paddingTop` в пикселях.
- Клип на уровне `chatArea`/`listPane`, плюс elevation шапки — защита от артефактов дат при overscroll.

## Известные ограничения

- В режиме Future composer скрыт; «50% до compose» для exit считается до низа list pane.
- Enter-guide короткий (бывший `paddingBottom` = `xxl`); основной визуал черты — на exit (свайп вниз из Future).

## Тестирование

- `npm test -- --testPathPattern='FutureTimeline|futurePeek|chat-future-peek'` — PASS
- Ручная проверка: peek enter/exit (бордер, клип дат, черта); вход в Future — первая строка ниже sticky «── Future ──»
