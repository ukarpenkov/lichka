# Остановка периодического напоминания из чата

**Дата:** 2026-10-13
**Промпт/задача:** отчёт по staged-изменениям — действие «Остановить напоминание» для сработавшего периодического сообщения

## Что сделано

- Добавлено действие **«Остановить напоминание»** в контекстное меню долгого нажатия для активного периодического сообщения, уже отображаемого в истории чата (синтетический display ID `periodic:…`).
- Шаблон периодики преобразуется в **отключённое обычное напоминание** (`type: reminder`, `enabled: false`, без интервала): сохраняются ID, текст и вложение; время последнего срабатывания записывается в `scheduledAt`, `createdAt` и `updatedAt` по той же формуле, что и для строки в истории.
- После сохранения отменяется нативное расписание (`cancelNotification` → обновление виджета отложенных); экран чата перезагружает историю и Future.
- Proposal в `docs/features/stop-periodic-reminder-proposal.md` со статусом **implemented**.
- Локализация `stopReminder` для ru, en, de, es, fr, pt.

## Изменённые файлы

- `docs/features/stop-periodic-reminder-proposal.md` — описание фичи, альтернативы, влияние на FSD.
- `src/entities/message/model/messageRepository.ts` — `getLatestPeriodicFireAt`, `finishPeriodicMessage`; рефакторинг `getPeriodicDisplayMessages` на общий расчёт последнего срабатывания.
- `src/entities/message/index.ts` — экспорт `finishPeriodicMessage`.
- `src/entities/message/__tests__/messageRepository.test.ts` — сценарии преобразования, гонка «ещё один repeat после открытия меню», защитные условия, удалённый шаблон.
- `src/features/notifications/stopPeriodicReminder.ts` — `canStopPeriodicReminder`, `stopPeriodicReminder`.
- `src/features/notifications/index.ts` — публичный API фичи.
- `src/features/notifications/__tests__/stopPeriodicReminder.test.ts` — видимость действия, отмена по template ID, порядок save → widget sync, no-op для неподходящих сообщений.
- `src/pages/chat-room/MessageContextMenu.tsx` — пункт меню с иконкой Square, защита «armed», как у остальных действий.
- `src/pages/chat-room/ChatRoomScreen.tsx` — `handleStopReminder`, передача `onStopReminder`.
- `src/pages/chat-room/__tests__/MessageContextMenu.test.tsx` — armed-guard для Stop reminder.
- `src/pages/chat-room/__tests__/MessageLine.test.tsx` — отображение остановленного reminder (Bell, без Repeat и без «изм.»).
- `src/pages/chat-room/__tests__/ChatRoomScreen.keyboardFocus.test.tsx` — мок notifications, fake timers в тесте фокуса.
- `src/shared/config/locale/*` + `types.ts` — ключ `stopReminder`.

## Принятые решения

- Не `enabled = false` на periodic: шаблон исчез бы из истории; вместо этого смена типа на `reminder` без активного расписания.
- Не удалять и создавать новое сообщение: сохраняем identity и медиа.
- Пункт меню только для display-сообщения (`isPeriodicDisplayId`), не для шаблона в Future и не для уже остановленных типов.
- Момент остановки считается по **текущему** `Date.now()`, чтобы при опоздании пользователя после нового срабатывания в БД попало актуальное последнее occurrence.

## Известные ограничения

- Остановка доступна только из истории чата (сработавшая периодика), не из списка Future до первого fire.
- Новое срабатывание при остановке не создаётся — в истории остаётся одна строка с временем последнего repeat.
- E2E-сценарий «долгое нажатие → стоп → проверка уведомлений» в отчёт не включён (только unit/integration Jest).

## Тестирование

- `messageRepository`: `finishPeriodicMessage` — happy path с attachment, пересчёт после сдвига времени, `it.each` для отказов, missing row.
- `stopPeriodicReminder`: условия `canStopPeriodicReminder`, вызов `finishPeriodicMessage('template-1')`, `cancelAlarm` + `syncScheduledWidgetSnapshot`, stale template → null без отмены.
- UI: `MessageContextMenu` — 4 пункта меню, Stop только после arming; `MessageLine` — иконка reminder без repeat.
- Рекомендуемая ручная проверка: периодическое напоминание с хотя бы одним срабатыванием → long press → «Остановить напоминание» → нет следующих push/alarm, в ленте обычный reminder с Bell, Future без активной периодики по этому ID.
