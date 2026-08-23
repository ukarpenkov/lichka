# Скрывать sticky-дату, пока виден разделитель дня

**Дата:** 2026-08-23
**Промпт/задача:** Убрать дубль «── Вчера ──» сверху чата: sticky показывать только после того, как метка дня в ленте уехала вверх. Документировать как задачу в `docs/features` и написать отчёт.

## Что сделано

- Sticky overlay больше не показывается, пока inline `DateSeparator` того же дня ещё в viewport
- Чип появляется, когда разделитель дня уехал вверх, а у верхнего края экрана остаются сообщения этого дня
- Разделитель более нового дня ниже по ленте не блокирует sticky для дня на визуальном верху
- Режим Future без изменений

## Изменённые файлы

- `src/pages/chat-room/stickyDate.ts` — `resolveStickyDate`, `sameStickyDay`
- `src/pages/chat-room/ChatRoomScreen.tsx` — viewability 1%, sticky из `resolveStickyDate`; `animateEnter={false}` у overlay `DateSeparator`
- `src/pages/chat-room/__tests__/stickyDate.test.ts` — сценарии hide/show
- `docs/features/hide-sticky-date-while-separator-visible-proposal.md` — описание задачи

## Принятые решения

- Правило вынесено в чистую функцию: inverted лента, наибольший viewable index = визуальный верх
- Скрывать sticky, если верх — date-row **или** разделитель того же дня ещё viewable
- `itemVisiblePercentThreshold: 1` — дата считается на экране, пока почти не уехала
- `sameStickyDay` — не пересоздавать overlay на другом ISO того же календарного дня

## Известные ограничения

- Точность по-прежнему зависит от `onViewableItemsChanged` при быстром скролле
- Нет анимации «вытеснения» sticky входящим разделителем (как в Telegram) — только hide/show
- Поведение не проверялось на устройстве в этой сессии (RN, не web)

## Тестирование

- `stickyDate.test.ts`: разделитель на визуальном верху → sticky `null`
- тот же день, разделитель ещё в viewport → sticky `null`
- разделитель дня уехал → sticky = `createdAt` верхней строки
- более новый разделитель ниже не мешает sticky старшего дня
- не-viewable строки игнорируются; пустой viewport → `null`
- `sameStickyDay` склеивает timestamps одного дня
- `historyListItems.test.ts`, `ChatRoomScreen.keyboardFocus.test.tsx` — без регрессий
