# Реализация редактирования сообщений (10.1)

**Дата:** 2026-05-26
**Промпт/задача:** Реализовать редактирование сообщений — текста и времени напоминаний

## Что сделано

- Создан feature-хук `useEditMessage` — атомарная операция: отмена старого уведомления → обновление БД → перепланирование (для reminder/alarm/periodic)
- Создан UI-компонент `MessageEditor` — Modal с полем ввода текста и возможностью изменить время (DateTimePicker) или интервал (PeriodPicker)
- Подключён `MessageEditor` в `ChatRoomScreen` — long press → «Редактировать» → Modal → «Сохранить»

## Изменённые файлы

- `src/features/edit-message/useEditMessage.ts` — **создан** — хук `saveEdit(message, fields)`: cancelNotification → updateMessage → scheduleNotification
- `src/features/edit-message/index.ts` — **создан** — barrel export
- `src/features/index.ts` — **изменён** — добавлен экспорт `useEditMessage` и `EditFields`
- `src/pages/chat-room/MessageEditor.tsx` — **создан** — Modal с TextInput, DateTimePicker (для reminder/alarm), PeriodPicker (для periodic)
- `src/pages/chat-room/ChatRoomScreen.tsx` — **изменён** — заменён TODO-стаб `handleEditMessage` на реальную логику, добавлен рендер `<MessageEditor>`

## Принятые решения

- **Атомарный reschedule**: `saveEdit` всегда отменяет старое уведомление перед обновлением, затем перепланирует — это гарантирует консистентность между БД и AlarmManager
- **UI в pages/chat-room**: `MessageEditor` расположен рядом с `MessageContextMenu`, так как оба являются частью одного UI-флоу редактирования на уровне экрана
- **Переиспользование виджетов**: `DateTimePicker` и `PeriodPicker` переиспользованы из `widgets/` без изменений
- **Оптимистичное обновление**: `handleSaveEdit` вызывает `loadData()` после сохранения для обновления списка сообщений
- **Проверка изменений**: `handleSaveEdit` в `MessageEditor` проверяет, есть ли реальные изменения, и если нет — просто закрывает модалку

## Известные ограничения

- Голосовые сообщения не редактируются (нет текста для редактирования)
- История правок не хранится — только факт «изменено» (уже реализован в `MessageBubble` через сравнение `updatedAt > createdAt`)
- Редактирование типа сообщения (simple → reminder и т.д.) не поддерживается — только body, scheduledAt, intervalMinutes

## Тестирование

- Long press на текстовом сообщении → «Редактировать» → Modal с текущим текстом → изменить → «Сохранить» → сообщение обновлено, метка «изменено»
- Long press на reminder → изменить время → «Сохранить» → alarm перепланирован
- Long press на periodic → изменить интервал → «Сохранить» → перепланирование
- «Отмена» → Modal закрывается без изменений
